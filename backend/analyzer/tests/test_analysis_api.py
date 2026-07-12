from decimal import Decimal
from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from analyzer.models import (
    JobDescription,
    Resume,
    ResumeAnalysis,
)


class ResumeAnalysisApiTests(APITestCase):
    def setUp(self):
        self.resume = Resume.objects.create(
            file="resumes/test-resume.pdf",
            original_filename="test-resume.pdf",
            file_type=Resume.FileType.PDF,
            file_size=1000,
            extracted_text=(
                "Python developer with Django, React, "
                "PostgreSQL, Git and Docker experience."
            ),
        )

        self.job_description = (
            JobDescription.objects.create(
                job_title="Python Developer",
                company_name="Example Company",
                description=(
                    "Looking for a Python developer with "
                    "Django, React, PostgreSQL, Docker, "
                    "Git and AWS."
                ),
            )
        )

    @patch(
        "analyzer.services.analysis_service."
        "calculate_semantic_similarity"
    )
    def test_create_resume_analysis(
        self,
        mocked_similarity,
    ):
        mocked_similarity.return_value = {
            "similarity": 0.72,
            "percentage": 72.0,
        }

        url = reverse(
            "analyzer:analysis-list-create"
        )

        response = self.client.post(
            url,
            {
                "resume_id": self.resume.id,
                "job_description_id": (
                    self.job_description.id
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            ResumeAnalysis.objects.count(),
            1,
        )

        analysis = ResumeAnalysis.objects.first()

        self.assertEqual(
            analysis.status,
            ResumeAnalysis.Status.COMPLETED,
        )

        self.assertIn(
            "Python",
            analysis.matched_skills,
        )

        self.assertIn(
            "AWS",
            analysis.missing_skills,
        )

        self.assertGreater(
            analysis.skill_score,
            Decimal("0.00"),
        )

        self.assertEqual(
            analysis.semantic_similarity,
            Decimal("72.00"),
        )

        self.assertEqual(
            analysis.semantic_score,
            Decimal("18.00"),
        )

        self.assertEqual(
            analysis.overall_score,
            analysis.skill_score
            + analysis.semantic_score,
        )

    def test_rejects_resume_without_text(self):
        self.resume.extracted_text = ""

        self.resume.save(
            update_fields=[
                "extracted_text",
                "updated_at",
            ]
        )

        url = reverse(
            "analyzer:analysis-list-create"
        )

        response = self.client.post(
            url,
            {
                "resume_id": self.resume.id,
                "job_description_id": (
                    self.job_description.id
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )