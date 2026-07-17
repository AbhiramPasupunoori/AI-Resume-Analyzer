import re
from decimal import Decimal


ACTION_VERBS = {
    "achieved", "built", "created", "delivered", "designed",
    "developed", "drove", "implemented", "improved", "increased",
    "launched", "led", "optimized", "reduced", "saved", "streamlined",
}
IMPACT_WORDS = {
    "efficiency", "growth", "impact", "performance", "productivity",
    "revenue", "savings", "scalability", "success", "throughput",
}


def analyze_achievements(resume_text: str) -> dict[str, object]:
    """Score evidence of outcome-focused resume writing out of 10."""

    text = resume_text or ""
    lowered = text.casefold()
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    action_verbs = sorted(
        verb for verb in ACTION_VERBS
        if re.search(rf"\b{re.escape(verb)}\b", lowered)
    )
    impact_words = sorted(
        word for word in IMPACT_WORDS
        if re.search(rf"\b{re.escape(word)}\b", lowered)
    )
    number_matches = re.findall(r"\b\d+(?:[.,]\d+)?\b", text)
    percentage_matches = re.findall(r"\b\d+(?:\.\d+)?\s*%", text)
    strong_bullets = [
        line for line in lines
        if (
            re.match(r"^[•▪●*\-–—]", line)
            and any(re.search(rf"\b{verb}\b", line, re.IGNORECASE) for verb in ACTION_VERBS)
            and bool(re.search(r"\d", line))
        )
    ]

    checks = {
        "action_verbs": bool(action_verbs),
        "numbers": bool(number_matches),
        "percentages": bool(percentage_matches),
        "impact_words": bool(impact_words),
        "strong_bullets": bool(strong_bullets),
    }
    score = Decimal(sum(checks.values()) * 2).quantize(Decimal("0.01"))

    return {
        "score": score,
        "maximum": 10,
        "checks": checks,
        "action_verbs_found": action_verbs,
        "number_count": len(number_matches),
        "percentage_count": len(percentage_matches),
        "impact_words_found": impact_words,
        "strong_bullet_count": len(strong_bullets),
    }
