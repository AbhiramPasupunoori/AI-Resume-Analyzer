import json
from functools import lru_cache
from pathlib import Path
from typing import Any

import spacy
from spacy.matcher import PhraseMatcher


SKILLS_FILE = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "skills.json"
)


@lru_cache(maxsize=1)
def load_skill_entries() -> list[dict[str, Any]]:
    """Load skill names and aliases from the JSON dataset."""

    if not SKILLS_FILE.exists():
        raise FileNotFoundError(
            f"Skills dataset not found: {SKILLS_FILE}"
        )

    with SKILLS_FILE.open("r", encoding="utf-8") as file:
        skill_groups = json.load(file)

    entries: list[dict[str, Any]] = []

    for category, skills in skill_groups.items():
        for skill in skills:
            name = str(skill.get("name", "")).strip()
            aliases = skill.get("aliases", [])

            if not name:
                continue

            entries.append(
                {
                    "name": name,
                    "category": category,
                    "aliases": [
                        str(alias).strip()
                        for alias in aliases
                        if str(alias).strip()
                    ],
                }
            )

    return entries


NLP = spacy.blank("en")

MATCHER = PhraseMatcher(
    NLP.vocab,
    attr="LOWER",
)

RULE_DETAILS: dict[str, dict[str, str]] = {}


def build_skill_matcher() -> None:
    """Create spaCy matching patterns for every skill."""

    for index, entry in enumerate(load_skill_entries()):
        rule_name = f"SKILL_{index}"

        terms = {
            entry["name"],
            *entry["aliases"],
        }

        patterns = [
            NLP.make_doc(term)
            for term in terms
            if term.strip()
        ]

        if not patterns:
            continue

        MATCHER.add(rule_name, patterns)

        RULE_DETAILS[rule_name] = {
            "name": entry["name"],
            "category": entry["category"],
        }


build_skill_matcher()


def extract_skills(text: str) -> list[str]:
    """Return canonical skill names detected in the text."""

    if not text or not text.strip():
        return []

    document = NLP.make_doc(text)
    matches = MATCHER(document)

    detected_skills: set[str] = set()

    for match_id, _start, _end in matches:
        rule_name = NLP.vocab.strings[match_id]
        details = RULE_DETAILS.get(rule_name)

        if details:
            detected_skills.add(details["name"])

    return sorted(
        detected_skills,
        key=str.casefold,
    )


def extract_skill_details(
    text: str,
) -> list[dict[str, str]]:
    """Return skill names, categories and matched text."""

    if not text or not text.strip():
        return []

    document = NLP.make_doc(text)
    matches = MATCHER(document)

    detected: dict[str, dict[str, str]] = {}

    for match_id, start, end in matches:
        rule_name = NLP.vocab.strings[match_id]
        details = RULE_DETAILS.get(rule_name)

        if not details:
            continue

        skill_name = details["name"]

        if skill_name not in detected:
            detected[skill_name] = {
                "name": skill_name,
                "category": details["category"],
                "matched_text": document[start:end].text,
            }

    return sorted(
        detected.values(),
        key=lambda item: item["name"].casefold(),
    )


def compare_resume_with_job(
    resume_text: str,
    job_description_text: str,
) -> dict[str, object]:
    """Compare resume skills with job-description skills."""

    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_description_text)

    resume_skill_set = set(resume_skills)
    job_skill_set = set(job_skills)

    matched_skills = sorted(
        resume_skill_set & job_skill_set,
        key=str.casefold,
    )

    missing_skills = sorted(
        job_skill_set - resume_skill_set,
        key=str.casefold,
    )

    additional_resume_skills = sorted(
        resume_skill_set - job_skill_set,
        key=str.casefold,
    )

    skill_coverage_percentage = (
        round(
            len(matched_skills) / len(job_skills) * 100,
            2,
        )
        if job_skills
        else 0.0
    )

    return {
        "resume_skills": resume_skills,
        "job_skills": job_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "additional_resume_skills": additional_resume_skills,
        "skill_coverage_percentage": skill_coverage_percentage,
    }