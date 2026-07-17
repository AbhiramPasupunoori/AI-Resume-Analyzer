def generate_recommendations(
    *,
    missing_skills: list[str],
    missing_sections: list[str],
    achievement_score: float,
    readability_score: float,
    semantic_similarity: float,
) -> list[str]:
    """Build deterministic, actionable recommendations from an analysis."""

    recommendations: list[str] = []

    if missing_skills:
        recommendations.append(
            "Add missing job-related skills where genuinely applicable: "
            + ", ".join(missing_skills)
            + "."
        )
    if missing_sections:
        recommendations.append(
            "Add these missing resume sections where relevant: "
            + ", ".join(missing_sections)
            + "."
        )
    if achievement_score < 7:
        recommendations.append(
            "Add measurable achievements using action verbs, numbers, "
            "percentages, and clear business results."
        )
    if readability_score < 4:
        recommendations.append(
            "Improve readability with concise sentences, clear headings, "
            "consistent spacing, and an appropriate resume length."
        )
    if semantic_similarity < 65:
        recommendations.append(
            "Tailor the summary and experience bullets more closely to "
            "the target role and its responsibilities."
        )
    if not recommendations:
        recommendations.append(
            "Your resume is well aligned; review it for role-specific "
            "wording and accuracy before applying."
        )

    return recommendations
