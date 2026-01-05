import logging
from typing import Any
from uuid import UUID

from fastapi import HTTPException
from langchain_openai import ChatOpenAI
from pydantic import ValidationError
from sqlalchemy import select
from sqlmodel import Session

from app.core.ai.embeddings import embed_text
from app.core.ai.retrieval import retrieve_top_k_chunks
from app.core.config import settings
from app.models import (
    Difficulty,
    Document,
    ExplanationOutput,
    QuestionCreate,
    QuestionItem,
    QuestionOutput,
    QuestionType,
)

# Initialize logging
logger = logging.getLogger(__name__)

# Maximum characters for extracted text when generating exam questions
MAX_CHARS = 15_000

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.5,
    max_completion_tokens=500,
    api_key=settings.OPENAI_API_KEY,  # type: ignore
)

structured_question_llm = llm.with_structured_output(QuestionOutput)


def generate_questions_prompt(
    text: str,
    num_questions: int = 5,
    difficulty: Difficulty | None = None,
    question_types: list[QuestionType] | None = None,
) -> str:
    difficulty_str = difficulty.value if difficulty else "medium"
    question_types_str = (
        ", ".join(question_types) if question_types else "multiple_choice, true_false"
    )
    return f"""
Generate {num_questions} questions from the following document text.

Rules (must follow exactly):
- Each question MUST include:
  - question (string)
  - answer (string or null)
  - type: "multiple_choice" or "true_false"
  - options (array of strings)

- For true_false questions:
  - type MUST be "true_false"
  - options MUST be exactly ["True", "False"]
  - Do NOT use true_false type with multiple choice options

- For multiple_choice questions:
  - type MUST be "multiple_choice"
  - options MUST contain at least 3 plausible choices (not just True/False)
  - answer MUST match exactly one option
  - Do NOT use multiple_choice type with only True/False options

Difficulty rules:
- EASY:
  - Focus on direct facts explicitly stated in the text
  - Minimal inference
  - Single concept per question
  - Obvious distractors

- MEDIUM:
  - Require understanding relationships between concepts
  - Light inference or comparison
  - Distractors should be plausible but incorrect

- HARD:
  - Require multi-step reasoning or synthesis across multiple parts of the text
  - Subtle distinctions between options
  - Distractors should be conceptually close to the correct answer

Additional constraints:
- Do NOT introduce facts not present in the document
- Do NOT rely on outside knowledge
- Difficulty MUST affect question complexity, not wording alone

Return structured data only.

Document text:
{text}

Difficulty: {difficulty_str}
Allowed question types: {question_types_str}

CRITICAL: The question type MUST match the options:
- If type is "true_false", options MUST be exactly ["True", "False"]
- If type is "multiple_choice", options MUST have at least 3 different choices (NOT True/False)
- Do NOT mix types: a true_false question cannot have multiple choice options, and vice versa

"""


def fetch_document_texts(session: Session, document_ids: list[UUID]) -> list[str]:
    """Fetch extracted texts for given document IDs."""
    try:
        stmt = select(Document.extracted_text).where(Document.id.in_(document_ids))  # type: ignore[attr-defined, call-overload]
        results = session.exec(stmt).all()
        texts = [text for (text,) in results if text]
        if not texts:
            raise ValueError(f"No extracted texts found for documents: {document_ids}")
        return texts
    except Exception as e:
        logger.error(f"Failed to fetch document texts for {document_ids}: {e}")
        raise


def validate_and_convert_question_item(q: Any) -> QuestionCreate | None:
    """Validate LLM question item and convert to QuestionCreate.

    Validation is handled by Pydantic validators in QuestionItem model.
    """
    try:
        # Convert to dict if it's a MagicMock or other object with attributes
        if isinstance(q, QuestionItem):
            question_item = q
        elif isinstance(q, dict):
            question_item = QuestionItem.model_validate(q)
        else:
            # Handle MagicMock or other objects with attributes
            q_dict = {
                "question": getattr(q, "question", ""),
                "answer": getattr(q, "answer", None),
                "type": getattr(q, "type", ""),
                "options": getattr(q, "options", []),
            }
            question_item = QuestionItem.model_validate(q_dict)

        # Pydantic validators in QuestionItem will automatically correct type/options mismatches

        return QuestionCreate(
            question=question_item.question,
            correct_answer=question_item.answer,
            type=QuestionType(question_item.type),
            options=question_item.options,
        )
    except (ValidationError, ValueError) as ve:
        logger.error(f"Validation error for question item {q}: {ve}")
        return None


def parse_llm_output(llm_output: Any) -> list[QuestionCreate]:
    """Parse LLM structured output into QuestionCreate list."""
    questions: list[QuestionCreate] = []
    for q in llm_output.questions:
        qc = validate_and_convert_question_item(q)
        if qc:
            questions.append(qc)

    return questions


def normalize_question_types(
    question_types: list[QuestionType] | None,
) -> list[QuestionType]:
    if question_types is None:
        return [QuestionType.multiple_choice, QuestionType.true_false]
    return question_types


def normalize_difficulty(difficulty: Difficulty | None) -> Difficulty:
    if difficulty is None:
        return Difficulty.medium
    return difficulty


async def generate_questions_from_documents(
    session: Session,
    document_ids: list[UUID],
    num_questions: int = 5,
    difficulty: Difficulty | None = None,
    question_types: list[QuestionType] | None = None,
) -> list[QuestionCreate]:
    """Main function: fetch documents, generate questions via LLM, and return QuestionCreate objects."""
    document_texts = fetch_document_texts(session, document_ids)
    if not document_texts:
        return []

    # Join texts and truncate to MAX_CHARS
    combined_text = "\n".join(document_texts)
    original_length = len(combined_text)
    if original_length > MAX_CHARS:
        combined_text = combined_text[:MAX_CHARS]
        logger.warning(
            f"Truncated extracted text from {original_length} to {MAX_CHARS} characters"
        )

    prompt = generate_questions_prompt(
        combined_text,
        num_questions=num_questions,
        difficulty=normalize_difficulty(difficulty),
        question_types=normalize_question_types(question_types),
    )

    try:
        # async call to the API
        llm_output = await structured_question_llm.ainvoke(prompt)
        return parse_llm_output(llm_output)
    except ValidationError as ve:
        logger.error(f"Pydantic validation error: {ve}")
        raise HTTPException(status_code=500, detail=f"LLM validation error: {ve}")
    except Exception as e:
        logger.error(f"Error generating questions from LLM: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to generate questions: {e}"
        )


# ------------------------
# Explanation LLM
# ------------------------

structured_explanation_llm = llm.with_structured_output(ExplanationOutput)


def generate_explanation_prompt(
    *,
    question: str,
    correct_answer: str,
    user_answer: str,
    context_chunks: list[str],
) -> str:
    context = "\n\n".join(context_chunks)

    return f"""
You are a friendly, concise tutor helping a student learn from a mistake.

Rules (must follow):
- Use ONLY the study material below
- Do NOT restate the material verbatim
- Do NOT say \"the material says\" or similar phrases
- Be brief (1–4 sentences total)
- Be encouraging and slightly playful, not academic

Task:
Explain why the student's answer is incorrect and what they should remember next time.

Question:
{question}

Correct answer:
{correct_answer}

Student answer:
{user_answer}

Study material:
{context}


Explain clearly using ONLY the material above.
Avoid introducing new facts.
"""


def normalize_uuid_list(values: list[str | UUID]) -> list[UUID]:
    return [v if isinstance(v, UUID) else UUID(v) for v in values]


async def generate_answer_explanation(
    *,
    session: Session,
    exam: Any,  # ideally Exam
    question: str,
    correct_answer: str,
    user_answer: str,
) -> ExplanationOutput:
    if not correct_answer:
        raise ValueError("Cannot generate explanation without a correct answer")

    source_doc_ids = normalize_uuid_list(exam.source_document_ids)

    query_text = (
        f"Question: {question}\n"
        f"Correct answer: {correct_answer}\n"
        f"Student answer: {user_answer}"
    )

    query_embedding = embed_text(query_text)

    context_chunks = retrieve_top_k_chunks(
        session=session,
        document_ids=source_doc_ids,
        query_embedding=query_embedding,
        k=4,
    )

    prompt = generate_explanation_prompt(
        question=question,
        correct_answer=correct_answer,
        user_answer=user_answer,
        context_chunks=context_chunks,
    )

    try:
        raw = await structured_explanation_llm.ainvoke(prompt)
        return ExplanationOutput.model_validate(raw)
    except Exception as e:
        logger.error(f"Failed to generate explanation: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate answer explanation",
        )
