from pathlib import Path
from zipfile import BadZipFile, ZipFile

from django.conf import settings
from rest_framework.exceptions import ValidationError


ALLOWED_EXTENSIONS = {
    ".pdf": "pdf",
    ".docx": "docx",
}

ALLOWED_CONTENT_TYPES = {
    ".pdf": {
        "application/pdf",
        "application/octet-stream",
    },
    ".docx": {
        (
            "application/vnd.openxmlformats-officedocument."
            "wordprocessingml.document"
        ),
        "application/zip",
        "application/octet-stream",
    },
}


def validate_pdf_file(uploaded_file) -> None:
    """Check whether the uploaded file has a valid PDF signature."""

    uploaded_file.seek(0)
    header = uploaded_file.read(5)
    uploaded_file.seek(0)

    if header != b"%PDF-":
        raise ValidationError(
            "The uploaded file is not a valid PDF document."
        )


def validate_docx_file(uploaded_file) -> None:
    """Check whether the uploaded file is a valid DOCX archive."""

    uploaded_file.seek(0)

    try:
        with ZipFile(uploaded_file) as archive:
            archive_files = set(archive.namelist())

            required_files = {
                "[Content_Types].xml",
                "word/document.xml",
            }

            if not required_files.issubset(archive_files):
                raise ValidationError(
                    "The uploaded file is not a valid DOCX document."
                )

    except BadZipFile as error:
        raise ValidationError(
            "The uploaded file is not a valid DOCX document."
        ) from error

    finally:
        uploaded_file.seek(0)


def validate_resume_file(uploaded_file):
    """Validate a PDF or DOCX resume upload."""

    if uploaded_file is None:
        raise ValidationError("Please select a resume file.")

    if uploaded_file.size == 0:
        raise ValidationError("The uploaded resume is empty.")

    extension = Path(uploaded_file.name).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValidationError(
            "Only PDF and DOCX resume files are supported."
        )

    maximum_size = getattr(
        settings,
        "MAX_RESUME_SIZE",
        5 * 1024 * 1024,
    )

    if uploaded_file.size > maximum_size:
        maximum_size_mb = maximum_size // (1024 * 1024)

        raise ValidationError(
            f"The resume must be smaller than {maximum_size_mb} MB."
        )

    content_type = getattr(
        uploaded_file,
        "content_type",
        "",
    )

    allowed_types = ALLOWED_CONTENT_TYPES[extension]

    if content_type and content_type not in allowed_types:
        raise ValidationError(
            f"Invalid file content type: {content_type}."
        )

    if extension == ".pdf":
        validate_pdf_file(uploaded_file)

    if extension == ".docx":
        validate_docx_file(uploaded_file)

    uploaded_file.seek(0)

    return uploaded_file