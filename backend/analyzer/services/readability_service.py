import re
from decimal import Decimal


def analyze_readability(resume_text: str) -> dict[str, object]:
    """Evaluate practical resume readability and return a score out of 5."""

    text = (resume_text or "").strip()
    words = re.findall(r"\b[\w+#.-]+\b", text)
    sentences = [
        sentence.strip()
        for sentence in re.split(r"(?<=[.!?])\s+|\n+", text)
        if sentence.strip()
    ]
    sentence_lengths = [len(sentence.split()) for sentence in sentences]
    long_sentence_count = sum(length > 35 for length in sentence_lengths)
    repeated_blank_lines = bool(re.search(r"\n\s*\n\s*\n", text))
    heading_count = sum(
        1 for line in text.splitlines()
        if line.strip() and len(line.split()) <= 5 and line.strip().isupper()
    )
    word_count = len(words)

    checks = {
        "minimum_length": word_count >= 100,
        "maximum_length": word_count <= 1200,
        "sentence_clarity": long_sentence_count <= max(1, len(sentences) // 5),
        "basic_formatting": heading_count > 0 or len(text.splitlines()) >= 5,
        "spacing": not repeated_blank_lines,
    }
    score = Decimal(sum(checks.values())).quantize(Decimal("0.01"))

    return {
        "score": score,
        "maximum": 5,
        "checks": checks,
        "word_count": word_count,
        "sentence_count": len(sentences),
        "long_sentence_count": long_sentence_count,
        "average_sentence_words": round(
            sum(sentence_lengths) / len(sentence_lengths), 2
        ) if sentence_lengths else 0.0,
        "heading_count": heading_count,
        "repeated_blank_lines": repeated_blank_lines,
    }
