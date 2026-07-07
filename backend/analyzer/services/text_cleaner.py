import re


def clean_extracted_text(text: str) -> str:
    """
    Normalize extracted resume text without removing useful
    characters such as +, #, periods or hyphens.
    """

    if not text:
        return ""

    text = text.replace("\x00", " ")
    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # Replace repeated spaces and tabs with one space.
    text = re.sub(r"[ \t]+", " ", text)

    # Remove spaces at the beginning and end of lines.
    text = re.sub(r" *\n *", "\n", text)

    # Keep no more than two consecutive new lines.
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()