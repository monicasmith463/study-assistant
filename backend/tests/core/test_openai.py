import uuid
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import UUID

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from app.core.ai.openai import (
    fetch_document_texts,
    generate_answer_explanation,
    generate_explanation_prompt,
    generate_questions_from_documents,
    generate_questions_prompt,
    normalize_uuid_list,
    parse_llm_output,
    validate_and_convert_question_item,
)
from app.models import QuestionCreate, QuestionType


def test_generate_questions_prompt() -> None:
    """Test question generation prompt creation."""
    text = "This is sample document text."
    num_questions = 5

    prompt = generate_questions_prompt(text, num_questions)

    assert str(num_questions) in prompt
    assert text in prompt
    assert "multiple_choice" in prompt
    assert "true_false" in prompt
    assert "options" in prompt


def test_generate_questions_prompt_default_num_questions() -> None:
    """Test question generation prompt with default number of questions."""
    text = "Sample text"
    prompt = generate_questions_prompt(text)

    assert "5" in prompt  # Default is 5
    assert text in prompt


def test_fetch_document_texts_success() -> None:
    """Test successfully fetching document texts."""
    document_ids = [uuid.uuid4(), uuid.uuid4()]
    expected_texts = ["Text 1", "Text 2"]

    mock_session = MagicMock()
    mock_result = MagicMock()
    mock_result.all.return_value = [(text,) for text in expected_texts]
    mock_session.exec.return_value = mock_result

    result = fetch_document_texts(mock_session, document_ids)

    assert result == expected_texts
    mock_session.exec.assert_called_once()


def test_fetch_document_texts_no_texts() -> None:
    """Test fetching document texts when no texts are found."""
    document_ids = [uuid.uuid4()]

    mock_session = MagicMock()
    mock_result = MagicMock()
    mock_result.all.return_value = []
    mock_session.exec.return_value = mock_result

    with pytest.raises(ValueError) as exc_info:
        fetch_document_texts(mock_session, document_ids)

    assert "No extracted texts found" in str(exc_info.value)


def test_fetch_document_texts_filters_none() -> None:
    """Test that None texts are filtered out."""
    document_ids = [uuid.uuid4(), uuid.uuid4()]
    texts_with_none = [("Text 1",), (None,), ("Text 2",)]

    mock_session = MagicMock()
    mock_result = MagicMock()
    mock_result.all.return_value = texts_with_none
    mock_session.exec.return_value = mock_result

    result = fetch_document_texts(mock_session, document_ids)

    assert result == ["Text 1", "Text 2"]


def test_validate_and_convert_question_item_success() -> None:
    """Test successful validation and conversion of question item."""
    mock_question = MagicMock()
    mock_question.question = "What is 2+2?"
    mock_question.answer = "4"
    mock_question.type = "multiple_choice"
    mock_question.options = ["2", "3", "4", "5"]

    result = validate_and_convert_question_item(mock_question)

    assert isinstance(result, QuestionCreate)
    assert result.question == "What is 2+2?"
    assert result.correct_answer == "4"
    assert result.type == QuestionType.MULTIPLE_CHOICE
    assert result.options == ["2", "3", "4", "5"]


def test_validate_and_convert_question_item_true_false() -> None:
    """Test validation of true/false question."""
    mock_question = MagicMock()
    mock_question.question = "Is the sky blue?"
    mock_question.answer = "True"
    mock_question.type = "true_false"
    mock_question.options = ["True", "False"]

    result = validate_and_convert_question_item(mock_question)

    assert result.type == QuestionType.TRUE_FALSE
    assert result.options == ["True", "False"]


def test_validate_and_convert_question_item_validation_error() -> None:
    """Test validation error handling."""
    mock_question = MagicMock()
    mock_question.question = "Test"
    mock_question.answer = None
    mock_question.type = "invalid_type"  # Invalid type
    mock_question.options = []

    with patch("app.core.ai.openai.QuestionCreate") as mock_create, patch(
        "app.core.ai.openai.logger"
    ):
        mock_create.side_effect = ValidationError.from_exception_data(
            "QuestionCreate",
            [{"type": "value_error", "loc": ("type",), "msg": "Invalid"}],
        )

        with pytest.raises(ValidationError):
            validate_and_convert_question_item(mock_question)


def test_parse_llm_output_success() -> None:
    """Test parsing LLM output successfully."""
    mock_question1 = MagicMock()
    mock_question1.question = "Question 1"
    mock_question1.answer = "Answer 1"
    mock_question1.type = "multiple_choice"
    mock_question1.options = ["A", "B", "C"]

    mock_question2 = MagicMock()
    mock_question2.question = "Question 2"
    mock_question2.answer = "True"
    mock_question2.type = "true_false"
    mock_question2.options = ["True", "False"]

    mock_llm_output = MagicMock()
    mock_llm_output.questions = [mock_question1, mock_question2]

    with patch(
        "app.core.ai.openai.validate_and_convert_question_item"
    ) as mock_validate:
        mock_validate.side_effect = [
            QuestionCreate(
                question="Question 1",
                correct_answer="Answer 1",
                type=QuestionType.MULTIPLE_CHOICE,
                options=["A", "B", "C"],
            ),
            QuestionCreate(
                question="Question 2",
                correct_answer="True",
                type=QuestionType.TRUE_FALSE,
                options=["True", "False"],
            ),
        ]

        result = parse_llm_output(mock_llm_output)

    assert len(result) == 2
    assert all(isinstance(q, QuestionCreate) for q in result)


def test_parse_llm_output_filters_none() -> None:
    """Test that None results from validation are filtered out."""
    mock_question = MagicMock()
    mock_question.question = "Question"
    mock_llm_output = MagicMock()
    mock_llm_output.questions = [mock_question]

    with patch(
        "app.core.ai.openai.validate_and_convert_question_item", return_value=None
    ):
        result = parse_llm_output(mock_llm_output)

    assert result == []


@pytest.mark.asyncio
async def test_generate_questions_from_documents_success() -> None:
    """Test successful question generation from documents."""
    document_ids = [uuid.uuid4()]
    num_questions = 3

    mock_question = QuestionCreate(
        question="Test question?",
        correct_answer="Answer",
        type=QuestionType.MULTIPLE_CHOICE,
        options=["A", "B", "C"],
    )

    mock_session = MagicMock()
    mock_llm = AsyncMock()
    mock_llm_output = MagicMock()
    mock_llm_output.questions = [MagicMock()]

    with patch(
        "app.core.ai.openai.fetch_document_texts", return_value=["Document text"]
    ), patch("app.core.ai.openai.structured_question_llm", mock_llm), patch(
        "app.core.ai.openai.parse_llm_output", return_value=[mock_question]
    ):
        mock_llm.ainvoke.return_value = mock_llm_output

        result = await generate_questions_from_documents(
            mock_session, document_ids, num_questions
        )

    assert len(result) == 1
    assert result[0] == mock_question


@pytest.mark.asyncio
async def test_generate_questions_from_documents_no_texts() -> None:
    """Test question generation when no document texts are found."""
    document_ids = [uuid.uuid4()]

    mock_session = MagicMock()

    with patch("app.core.ai.openai.fetch_document_texts", return_value=[]):
        result = await generate_questions_from_documents(mock_session, document_ids)

    assert result == []


@pytest.mark.asyncio
async def test_generate_questions_from_documents_validation_error() -> None:
    """Test handling of validation errors during question generation."""
    document_ids = [uuid.uuid4()]

    mock_session = MagicMock()
    mock_llm = AsyncMock()

    with patch(
        "app.core.ai.openai.fetch_document_texts", return_value=["Document text"]
    ), patch("app.core.ai.openai.structured_question_llm", mock_llm), patch(
        "app.core.ai.openai.logger"
    ):
        mock_llm.ainvoke.side_effect = ValidationError.from_exception_data(
            "QuestionOutput",
            [{"type": "value_error", "loc": ("questions",), "msg": "Invalid"}],
        )

        with pytest.raises(HTTPException) as exc_info:
            await generate_questions_from_documents(mock_session, document_ids)

        assert exc_info.value.status_code == 500
        assert "LLM validation error" in exc_info.value.detail


@pytest.mark.asyncio
async def test_generate_questions_from_documents_general_error() -> None:
    """Test handling of general errors during question generation."""
    document_ids = [uuid.uuid4()]

    mock_session = MagicMock()
    mock_llm = AsyncMock()

    with patch(
        "app.core.ai.openai.fetch_document_texts", return_value=["Document text"]
    ), patch("app.core.ai.openai.structured_question_llm", mock_llm), patch(
        "app.core.ai.openai.logger"
    ):
        mock_llm.ainvoke.side_effect = Exception("API Error")

        with pytest.raises(HTTPException) as exc_info:
            await generate_questions_from_documents(mock_session, document_ids)

        assert exc_info.value.status_code == 500
        assert "Failed to generate questions" in exc_info.value.detail


def test_generate_explanation_prompt() -> None:
    """Test explanation prompt generation."""
    question = "What is 2+2?"
    correct_answer = "4"
    user_answer = "5"
    context_chunks = ["Chunk 1", "Chunk 2"]

    prompt = generate_explanation_prompt(
        question=question,
        correct_answer=correct_answer,
        user_answer=user_answer,
        context_chunks=context_chunks,
    )

    assert question in prompt
    assert correct_answer in prompt
    assert user_answer in prompt
    assert "Chunk 1" in prompt
    assert "Chunk 2" in prompt


def test_generate_explanation_prompt_empty_chunks() -> None:
    """Test explanation prompt with empty context chunks."""
    prompt = generate_explanation_prompt(
        question="Q",
        correct_answer="A",
        user_answer="B",
        context_chunks=[],
    )

    assert "Q" in prompt
    assert "A" in prompt
    assert "B" in prompt


def test_normalize_uuid_list_with_uuids() -> None:
    """Test normalizing a list of UUIDs."""
    uuids = [uuid.uuid4(), uuid.uuid4()]
    result = normalize_uuid_list(uuids)

    assert result == uuids
    assert all(isinstance(u, UUID) for u in result)


def test_normalize_uuid_list_with_strings() -> None:
    """Test normalizing a list of UUID strings."""
    uuid1 = uuid.uuid4()
    uuid2 = uuid.uuid4()
    strings = [str(uuid1), str(uuid2)]

    result = normalize_uuid_list(strings)

    assert len(result) == 2
    assert result[0] == uuid1
    assert result[1] == uuid2
    assert all(isinstance(u, UUID) for u in result)


def test_normalize_uuid_list_mixed() -> None:
    """Test normalizing a mixed list of UUIDs and strings."""
    uuid1 = uuid.uuid4()
    uuid2 = uuid.uuid4()
    mixed = [uuid1, str(uuid2)]

    result = normalize_uuid_list(mixed)

    assert len(result) == 2
    assert result[0] == uuid1
    assert result[1] == uuid2


@pytest.mark.asyncio
async def test_generate_answer_explanation_success() -> None:
    """Test successful answer explanation generation."""
    mock_exam = MagicMock()
    mock_exam.source_document_ids = [str(uuid.uuid4())]

    mock_session = MagicMock()
    mock_embedding = [0.1, 0.2, 0.3]
    mock_chunks = ["Chunk 1", "Chunk 2"]
    mock_explanation = MagicMock()
    mock_explanation.explanation = "Explanation text"
    mock_explanation.key_takeaway = "Takeaway"
    mock_explanation.suggested_review = "Review"

    with patch("app.core.ai.openai.embed_text", return_value=mock_embedding), patch(
        "app.core.ai.openai.retrieve_top_k_chunks", return_value=mock_chunks
    ), patch(
        "app.core.ai.openai.structured_explanation_llm", new_callable=AsyncMock
    ) as mock_llm, patch("app.core.ai.openai.ExplanationOutput") as mock_output:
        mock_llm_instance = AsyncMock()
        mock_llm_instance.ainvoke.return_value = mock_explanation
        mock_llm.return_value = mock_llm_instance
        mock_output.model_validate.return_value = mock_explanation

        result = await generate_answer_explanation(
            session=mock_session,
            exam=mock_exam,
            question="What is 2+2?",
            correct_answer="4",
            user_answer="5",
        )

    assert result == mock_explanation


@pytest.mark.asyncio
async def test_generate_answer_explanation_no_correct_answer() -> None:
    """Test explanation generation fails without correct answer."""
    mock_exam = MagicMock()
    mock_session = MagicMock()

    with pytest.raises(ValueError) as exc_info:
        await generate_answer_explanation(
            session=mock_session,
            exam=mock_exam,
            question="Q",
            correct_answer="",
            user_answer="A",
        )

    assert "Cannot generate explanation without a correct answer" in str(exc_info.value)


@pytest.mark.asyncio
async def test_generate_answer_explanation_api_error() -> None:
    """Test handling of API errors during explanation generation."""
    mock_exam = MagicMock()
    mock_exam.source_document_ids = [str(uuid.uuid4())]

    mock_session = MagicMock()
    mock_embedding = [0.1, 0.2, 0.3]
    mock_chunks = ["Chunk 1"]

    with patch("app.core.ai.openai.embed_text", return_value=mock_embedding), patch(
        "app.core.ai.openai.retrieve_top_k_chunks", return_value=mock_chunks
    ), patch(
        "app.core.ai.openai.structured_explanation_llm", new_callable=AsyncMock
    ) as mock_llm, patch("app.core.ai.openai.logger"):
        mock_llm_instance = AsyncMock()
        mock_llm_instance.ainvoke.side_effect = Exception("API Error")
        mock_llm.return_value = mock_llm_instance

        with pytest.raises(HTTPException) as exc_info:
            await generate_answer_explanation(
                session=mock_session,
                exam=mock_exam,
                question="Q",
                correct_answer="A",
                user_answer="B",
            )

        assert exc_info.value.status_code == 500
        assert "Failed to generate answer explanation" in exc_info.value.detail
