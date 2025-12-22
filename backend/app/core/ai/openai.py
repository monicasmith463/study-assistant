import logging
from typing import Any
from uuid import UUID

from fastapi import HTTPException
from langchain_openai import ChatOpenAI
from pydantic import ValidationError
from sqlalchemy import select
from sqlmodel import Session

from app.core.config import settings
from app.models import (
    Document,
    ExplanationOutput,
    QuestionCreate,
    QuestionOutput,
    QuestionType,
)

# Initialize logging
logger = logging.getLogger(__name__)

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.5,
    max_completion_tokens=500,
    api_key=settings.OPENAI_API_KEY,  # type: ignore
)

structured_question_llm = llm.with_structured_output(QuestionOutput)


def generate_questions_prompt(text: str, num_questions: int = 5) -> str:
    return f"""
Generate {num_questions} questions from the following document text.

Rules (must follow exactly):
- Each question MUST include:
  - question (string)
  - answer (string or null)
  - type: "multiple_choice" or "true_false"
  - options (array of strings)
- For true_false questions:
  - options MUST be exactly ["True", "False"]
- For multiple_choice questions:
  - options MUST contain at least 3 plausible choices
  - answer MUST match exactly one option

Return structured data only.

Document text:
{text}
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
    """Validate LLM question item and convert to QuestionCreate."""
    try:
        return QuestionCreate(
            question=q.question,
            correct_answer=q.answer,
            type=QuestionType(q.type),
            options=q.options,
        )
    except ValidationError as ve:
        logger.error(f"Validation error for question item {q}: {ve}")
        raise


def parse_llm_output(llm_output: Any) -> list[QuestionCreate]:
    """Parse LLM structured output into QuestionCreate list."""
    questions: list[QuestionCreate] = []
    for q in llm_output.questions:
        qc = validate_and_convert_question_item(q)
        if qc:
            questions.append(qc)

    return questions


async def generate_questions_from_documents(
    session: Session, document_ids: list[UUID], num_questions: int = 5
) -> list[QuestionCreate]:
    """Main function: fetch documents, generate questions via LLM, and return QuestionCreate objects."""
    document_texts = fetch_document_texts(session, document_ids)
    if not document_texts:
        return []

    prompt = generate_questions_prompt(
        "\n".join(document_texts), num_questions=num_questions
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
You are a tutor explaining why a student answer is incorrect.

Question:
{question}

Correct answer:
{correct_answer}

Student answer:
{user_answer}

Relevant study material:
{context}

Explain clearly using ONLY the material above.
Avoid introducing new facts.
"""


async def generate_answer_explanation(
    *, question: str, correct_answer: str, user_answer: str, context_chunks: list[str]
) -> ExplanationOutput:
    if not correct_answer:
        raise ValueError("Cannot generate explanation without a correct answer")

    prompt = generate_explanation_prompt(
        question=question,
        correct_answer=correct_answer,
        user_answer=user_answer,
        context_chunks=context_chunks,
    )

    try:
        raw = await structured_explanation_llm.ainvoke(prompt)

        # 🔑 enforce type
        return ExplanationOutput.model_validate(raw)
    except Exception as e:
        logger.error(f"Failed to generate explanation: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate answer explanation",
        )
