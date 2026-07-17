import re
from decimal import Decimal, ROUND_HALF_UP


MAX_SECTION_SCORE = Decimal("15.00")


SECTION_DEFINITIONS = {
    "summary": {
        "label": "Summary",
        "aliases": [
            "summary",
            "professional summary",
            "career summary",
            "profile",
            "professional profile",
            "career objective",
            "objective",
            "about me",
        ],
    },
    "skills": {
        "label": "Skills",
        "aliases": [
            "skills",
            "technical skills",
            "key skills",
            "core skills",
            "skills summary",
            "core competencies",
            "technical competencies",
            "areas of expertise",
        ],
    },
    "experience": {
        "label": "Experience",
        "aliases": [
            "experience",
            "work experience",
            "professional experience",
            "employment history",
            "work history",
            "career history",
            "internship experience",
            "internships",
        ],
    },
    "education": {
        "label": "Education",
        "aliases": [
            "education",
            "educational qualifications",
            "academic qualifications",
            "academic background",
            "education details",
        ],
    },
    "projects": {
        "label": "Projects",
        "aliases": [
            "projects",
            "personal projects",
            "academic projects",
            "professional projects",
            "key projects",
            "project experience",
        ],
    },
    "certifications": {
        "label": "Certifications",
        "aliases": [
            "certifications",
            "certification",
            "certificates",
            "professional certifications",
            "licenses and certifications",
            "licences and certifications",
            "training and certifications",
            "courses and certifications",
        ],
    },
}


def normalize_heading(text: str) -> str:
    """
    Normalize a possible resume heading for comparison.
    """

    text = text.replace("\u00a0", " ")
    text = text.casefold()

    # Remove bullets and decorative characters.
    text = re.sub(
        r"^[\s•●▪■◆◇►▸\-–—|:]+",
        "",
        text,
    )

    # Keep characters that can appear in headings.
    text = re.sub(
        r"[^a-z0-9+#&/.\-\s]",
        " ",
        text,
    )

    text = re.sub(r"\s+", " ", text)

    return text.strip(" .:|-–—")


def get_heading_candidates(line: str) -> list[str]:
    """
    Return possible heading values from one resume line.

    Examples:
        "Technical Skills" -> "Technical Skills"
        "Skills: Python, Django" -> "Skills"
    """

    clean_line = line.strip()

    if not clean_line:
        return []

    candidates = [clean_line]

    separators = (
        ":",
        "|",
        "—",
        "–",
    )

    for separator in separators:
        if separator not in clean_line:
            continue

        prefix = clean_line.split(
            separator,
            maxsplit=1,
        )[0].strip()

        # Prevent a long sentence from being treated as a heading.
        if (
            prefix
            and len(prefix) <= 60
            and len(prefix.split()) <= 7
        ):
            candidates.append(prefix)

        break

    return candidates


def build_alias_lookup() -> dict[str, str]:
    """
    Map every normalized heading alias to its section key.
    """

    lookup: dict[str, str] = {}

    for section_key, definition in (
        SECTION_DEFINITIONS.items()
    ):
        for alias in definition["aliases"]:
            normalized_alias = normalize_heading(
                alias
            )

            lookup[normalized_alias] = section_key

    return lookup


SECTION_ALIAS_LOOKUP = build_alias_lookup()


def detect_resume_sections(
    resume_text: str,
) -> dict[str, dict[str, object]]:
    """
    Detect section headings from extracted resume text.
    """

    results: dict[str, dict[str, object]] = {
        section_key: {
            "label": definition["label"],
            "present": False,
            "matched_heading": None,
        }
        for section_key, definition in (
            SECTION_DEFINITIONS.items()
        )
    }

    if not resume_text or not resume_text.strip():
        return results

    for raw_line in resume_text.splitlines():
        line = raw_line.strip()

        if not line:
            continue

        for candidate in get_heading_candidates(
            line
        ):
            normalized_candidate = normalize_heading(
                candidate
            )

            section_key = SECTION_ALIAS_LOOKUP.get(
                normalized_candidate
            )

            if not section_key:
                continue

            if not results[section_key]["present"]:
                results[section_key]["present"] = True

                results[section_key][
                    "matched_heading"
                ] = candidate.strip()

    return results


def calculate_section_score(
    section_results: dict[
        str,
        dict[str, object],
    ],
) -> dict[str, object]:
    """
    Calculate section completeness and a score out of 15.
    """

    total_sections = len(
        SECTION_DEFINITIONS
    )

    present_sections = [
        result["label"]
        for result in section_results.values()
        if result["present"]
    ]

    missing_sections = [
        result["label"]
        for result in section_results.values()
        if not result["present"]
    ]

    present_count = len(present_sections)

    if total_sections == 0:
        completeness_percentage = Decimal(
            "0.00"
        )
        section_score = Decimal("0.00")

    else:
        completeness_percentage = (
            Decimal(present_count)
            / Decimal(total_sections)
            * Decimal("100")
        ).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        section_score = (
            Decimal(present_count)
            / Decimal(total_sections)
            * MAX_SECTION_SCORE
        ).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

    return {
        "sections": section_results,
        "present_sections": present_sections,
        "missing_sections": missing_sections,
        "present_count": present_count,
        "total_sections": total_sections,
        "completeness_percentage": float(
            completeness_percentage
        ),
        "score": section_score,
    }


def analyze_resume_sections(
    resume_text: str,
) -> dict[str, object]:
    """
    Detect sections and calculate completeness.
    """

    detected_sections = detect_resume_sections(
        resume_text
    )

    return calculate_section_score(
        detected_sections
    )