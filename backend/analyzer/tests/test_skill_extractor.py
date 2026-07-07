from django.test import SimpleTestCase

from analyzer.services.skill_extractor import (
    compare_resume_with_job,
    extract_skills,
)


class SkillExtractorTests(SimpleTestCase):
    def test_extracts_case_insensitive_skills(self):
        text = (
            "Experience with PYTHON, django, "
            "React and POSTGRES."
        )

        result = extract_skills(text)

        self.assertIn("Python", result)
        self.assertIn("Django", result)
        self.assertIn("React", result)
        self.assertIn("PostgreSQL", result)

    def test_extracts_skill_aliases(self):
        text = (
            "Built APIs using DRF and deployed "
            "applications with K8s."
        )

        result = extract_skills(text)

        self.assertIn(
            "Django REST Framework",
            result,
        )
        self.assertIn(
            "Kubernetes",
            result,
        )

    def test_compares_resume_and_job_skills(self):
        resume_text = (
            "Python, Django, React and PostgreSQL"
        )

        job_text = (
            "Python, Django, React, PostgreSQL "
            "and Docker"
        )

        result = compare_resume_with_job(
            resume_text,
            job_text,
        )

        self.assertEqual(
            result["missing_skills"],
            ["Docker"],
        )

        self.assertEqual(
            result["skill_coverage_percentage"],
            80.0,
        )