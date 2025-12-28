import io
import tempfile
from unittest.mock import MagicMock, patch

import pytest
from botocore.exceptions import ClientError
from fastapi import UploadFile

from app.core.config import settings
from app.core.s3 import extract_text_from_s3_file, generate_s3_url, upload_file_to_s3


def test_upload_file_to_s3_success() -> None:
    """Test successful file upload to S3."""
    # Create a mock file
    file_content = b"test file content"
    mock_file = UploadFile(
        filename="test.pdf",
        file=io.BytesIO(file_content),
    )
    # Note: content_type is a read-only property, but it's not used in upload_file_to_s3

    user_id = "user-123"
    expected_key_pattern = f"documents/{user_id}/"

    # Mock S3 client
    mock_s3_client = MagicMock()
    mock_s3_client.upload_fileobj = MagicMock()

    with patch("app.core.s3.s3", mock_s3_client):
        key = upload_file_to_s3(mock_file, user_id)

    # Verify key format
    assert key.startswith(expected_key_pattern)
    assert key.endswith(".pdf")
    # Verify upload was called
    mock_s3_client.upload_fileobj.assert_called_once()
    call_args = mock_s3_client.upload_fileobj.call_args
    assert call_args[0][0] == mock_file.file  # file object


def test_upload_file_to_s3_without_extension() -> None:
    """Test file upload with no file extension."""
    mock_file = UploadFile(
        filename="testfile",
        file=io.BytesIO(b"content"),
    )
    # Note: content_type is a read-only property, but it's not used in upload_file_to_s3

    user_id = "user-123"

    mock_s3_client = MagicMock()
    mock_s3_client.upload_fileobj = MagicMock()

    with patch("app.core.s3.s3", mock_s3_client):
        key = upload_file_to_s3(mock_file, user_id)

    # Should still work, just no extension
    assert key.startswith(f"documents/{user_id}/")
    assert not key.endswith(".")
    mock_s3_client.upload_fileobj.assert_called_once()


def test_upload_file_to_s3_failure() -> None:
    """Test file upload failure handling."""
    mock_file = UploadFile(
        filename="test.pdf",
        file=io.BytesIO(b"content"),
    )
    mock_file.size = 7

    user_id = "user-123"

    # Mock S3 client to raise an error
    mock_s3_client = MagicMock()
    mock_s3_client.upload_fileobj.side_effect = ClientError(
        {"Error": {"Code": "AccessDenied", "Message": "Access Denied"}},
        "PutObject",
    )

    with patch("app.core.s3.s3", mock_s3_client):
        with pytest.raises(Exception) as exc_info:
            upload_file_to_s3(mock_file, user_id)

        assert "Failed to upload file to S3" in str(exc_info.value)


def test_upload_file_to_s3_empty_filename() -> None:
    """Test file upload with empty filename."""
    mock_file = UploadFile(
        filename="",
        file=io.BytesIO(b"content"),
    )
    mock_file.size = 7

    user_id = "user-123"

    mock_s3_client = MagicMock()
    mock_s3_client.upload_fileobj = MagicMock()

    with patch("app.core.s3.s3", mock_s3_client):
        key = upload_file_to_s3(mock_file, user_id)

    # Should still work, just no extension in key
    assert key.startswith(f"documents/{user_id}/")
    mock_s3_client.upload_fileobj.assert_called_once()


def test_generate_s3_url() -> None:
    """Test S3 URL generation."""
    key = "documents/user-123/test-file.pdf"
    url = generate_s3_url(key)

    assert url == f"https://{settings.S3_BUCKET}.s3.amazonaws.com/{key}"


def test_generate_s3_url_with_special_characters() -> None:
    """Test S3 URL generation with special characters in key."""
    key = "documents/user-123/file with spaces.pdf"
    url = generate_s3_url(key)

    assert url == f"https://{settings.S3_BUCKET}.s3.amazonaws.com/{key}"


def test_extract_text_from_s3_file_success() -> None:
    """Test successful text extraction from S3 file."""
    key = "documents/user-123/test-file.pdf"
    expected_text = "Extracted text content from PDF"

    # Mock S3 client download
    mock_s3_client = MagicMock()

    def mock_download_fileobj(bucket, key, file_obj):
        _ = bucket
        _ = key
        # Write expected text to the file object
        file_obj.write(expected_text.encode("utf-8"))
        file_obj.seek(0)

    mock_s3_client.download_fileobj = mock_download_fileobj

    # Mock textract to return the expected text
    mock_textract_process = MagicMock(return_value=expected_text.encode("utf-8"))

    with patch("app.core.s3.s3", mock_s3_client), patch(
        "textract.process", mock_textract_process
    ), patch("os.remove") as mock_remove:
        result = extract_text_from_s3_file(key)

    assert result == expected_text
    mock_s3_client.download_fileobj.assert_called_once()
    # Verify bucket and key were passed correctly
    call_args = mock_s3_client.download_fileobj.call_args
    assert call_args[0][0] == settings.S3_BUCKET
    assert call_args[0][1] == key
    # Verify textract was called with a file path
    mock_textract_process.assert_called_once()
    # Verify temp file cleanup was attempted
    mock_remove.assert_called_once()


def test_extract_text_from_s3_file_download_failure() -> None:
    """Test text extraction when S3 download fails."""
    key = "documents/user-123/nonexistent.pdf"

    # Mock S3 client to raise an error
    mock_s3_client = MagicMock()
    mock_s3_client.download_fileobj.side_effect = ClientError(
        {"Error": {"Code": "NoSuchKey", "Message": "The specified key does not exist"}},
        "GetObject",
    )

    with patch("app.core.s3.s3", mock_s3_client):
        with pytest.raises(ClientError):
            extract_text_from_s3_file(key)


def test_extract_text_from_s3_file_textract_failure() -> None:
    """Test text extraction when textract processing fails."""
    key = "documents/user-123/test-file.pdf"

    # Mock S3 client download (success)
    mock_s3_client = MagicMock()

    def mock_download_fileobj(bucket, key, file_obj):
        _ = bucket
        _ = key
        file_obj.write(b"some content")
        file_obj.seek(0)

    mock_s3_client.download_fileobj = mock_download_fileobj

    # Mock textract to raise an error
    mock_textract_process = MagicMock(
        side_effect=Exception("Textract processing failed")
    )

    with patch("app.core.s3.s3", mock_s3_client), patch(
        "textract.process", mock_textract_process
    ):
        with pytest.raises(Exception) as exc_info:
            extract_text_from_s3_file(key)

        assert "Textract processing failed" in str(exc_info.value)


def test_extract_text_from_s3_file_empty_text() -> None:
    """Test text extraction when textract returns empty text."""
    key = "documents/user-123/empty-file.pdf"

    # Mock S3 client download
    mock_s3_client = MagicMock()

    def mock_download_fileobj(bucket, key, file_obj):
        _ = bucket
        _ = key
        file_obj.write(b"")
        file_obj.seek(0)

    mock_s3_client.download_fileobj = mock_download_fileobj

    # Mock textract to return empty
    mock_textract_process = MagicMock(return_value=b"")

    with patch("app.core.s3.s3", mock_s3_client), patch(
        "textract.process", mock_textract_process
    ):
        result = extract_text_from_s3_file(key)

    assert result == ""


def test_extract_text_from_s3_file_cleanup_temp_file() -> None:
    """Test that temporary file is cleaned up after extraction."""
    key = "documents/user-123/test-file.pdf"
    expected_text = "Test content"

    # Mock S3 client
    mock_s3_client = MagicMock()

    def mock_download_fileobj(bucket, key, file_obj):
        _ = bucket
        _ = key
        file_obj.write(expected_text.encode("utf-8"))
        file_obj.seek(0)

    mock_s3_client.download_fileobj = mock_download_fileobj

    # Mock textract
    mock_textract_process = MagicMock(return_value=expected_text.encode("utf-8"))

    # Track temp file path
    temp_file_path = None

    original_named_temporary_file = tempfile.NamedTemporaryFile

    def mock_named_temporary_file(*args, **kwargs):
        kwargs["delete"] = False  # Ensure delete=False so we can track it
        tmp_file = original_named_temporary_file(*args, **kwargs)
        nonlocal temp_file_path
        temp_file_path = tmp_file.name
        return tmp_file

    with patch("app.core.s3.s3", mock_s3_client), patch(
        "textract.process", mock_textract_process
    ), patch(
        "tempfile.NamedTemporaryFile", side_effect=mock_named_temporary_file
    ), patch("os.remove") as mock_remove:
        result = extract_text_from_s3_file(key)

    assert result == expected_text
    # Verify temp file cleanup was called
    mock_remove.assert_called_once()
    if temp_file_path:
        assert mock_remove.call_args[0][0] == temp_file_path
