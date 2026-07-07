from pathlib import Path

import pymupdf
from docx import Document
from docx.table import Table
from docx.text.paragraph import Paragraph

from analyzer.services.text_cleaner import clean_extracted_text


class ResumeTextExtractionError(Exception):
    """Raised when readable text cannot be extracted from a resume."""


def extract_pdf_text(file_path: str | Path) -> str:
    """
    Extract selectable text from every page of a PDF resume.
    """

    path = Path(file_path)

    try:
        extracted_pages: list[str] = []

        with pymupdf.open(path) as document:
            if document.page_count == 0:
                raise ResumeTextExtractionError(
                    "The PDF does not contain any pages."
                )

            for page in document:
                page_text = page.get_text(
                    "text",
                    sort=True,
                )

                if page_text.strip():
                    extracted_pages.append(page_text.strip())

        extracted_text = "\n\n".join(extracted_pages)
        extracted_text = clean_extracted_text(extracted_text)

        if not extracted_text:
            raise ResumeTextExtractionError(
                "No readable text was found in this PDF. "
                "The file may be a scanned or image-only resume."
            )

        return extracted_text

    except ResumeTextExtractionError:
        raise

    except Exception as error:
        raise ResumeTextExtractionError(
            "The PDF could not be read or may be corrupted."
        ) from error


def extract_table_text(table: Table) -> list[str]:
    """
    Extract text from a DOCX table.
    """

    extracted_rows: list[str] = []

    for row in table.rows:
        row_values: list[str] = []

        for cell in row.cells:
            cell_text = " ".join(
                paragraph.text.strip()
                for paragraph in cell.paragraphs
                if paragraph.text.strip()
            )

            # Merged cells may sometimes produce repeated values.
            if cell_text and (
                not row_values
                or cell_text != row_values[-1]
            ):
                row_values.append(cell_text)

        if row_values:
            extracted_rows.append(" | ".join(row_values))

    return extracted_rows


def extract_docx_text(file_path: str | Path) -> str:
    """
    Extract paragraphs and top-level table text from a DOCX resume.
    """

    path = Path(file_path)

    try:
        document = Document(path)

        extracted_blocks: list[str] = []

        for block in document.iter_inner_content():
            if isinstance(block, Paragraph):
                paragraph_text = block.text.strip()

                if paragraph_text:
                    extracted_blocks.append(paragraph_text)

            elif isinstance(block, Table):
                extracted_blocks.extend(
                    extract_table_text(block)
                )

        extracted_text = "\n".join(extracted_blocks)
        extracted_text = clean_extracted_text(extracted_text)

        if not extracted_text:
            raise ResumeTextExtractionError(
                "No readable text was found in this DOCX file."
            )

        return extracted_text

    except ResumeTextExtractionError:
        raise

    except Exception as error:
        raise ResumeTextExtractionError(
            "The DOCX file could not be read or may be corrupted."
        ) from error


def extract_resume_text(
    file_path: str | Path,
    file_type: str,
) -> str:
    """
    Select the correct extraction method using the resume file type.
    """

    path = Path(file_path)

    if not path.exists():
        raise ResumeTextExtractionError(
            "The uploaded resume file could not be found."
        )

    normalized_file_type = file_type.lower().lstrip(".")

    if normalized_file_type == "pdf":
        return extract_pdf_text(path)

    if normalized_file_type == "docx":
        return extract_docx_text(path)

    raise ResumeTextExtractionError(
        "Text extraction is only supported for PDF and DOCX files."
    )