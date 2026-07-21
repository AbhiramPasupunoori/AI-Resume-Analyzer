from unittest.mock import patch

from django.db import IntegrityError
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from analyzer.models import (
    BuiltResume,
    JobDescription,
    Resume,
)


class BuiltResumeApiTests(APITestCase):
    def setUp(self):
        self.payload = {
            "full_name": "Ada Lovelace",
            "email": "ada@example.com",
            "phone": "+44 1234",
            "location": "London",
            "linkedin": "https://linkedin.com/in/ada",
            "github": "https://github.com/ada",
            "portfolio": "https://ada.example.com",
            "summary": "Python and Django engineer.",
            "skills": ["Python", "Django"],
            "education": [
                {
                    "degree": "Mathematics",
                    "institution": "University of London",
                    "year": "1835",
                    "description": "Advanced mathematics.",
                }
            ],
            "experience": [
                {
                    "role": "Engineer",
                    "company": "Analytical Engines",
                    "duration": "1842-1843",
                    "description": "Designed algorithms.",
                    "bullets": ["Documented the engine"],
                }
            ],
            "projects": [
                {
                    "title": "Bernoulli Algorithm",
                    "technologies": "Python",
                    "description": "Computed Bernoulli numbers.",
                }
            ],
            "certifications": ["Django Developer"],
            "achievements": ["Published the first algorithm"],
        }

    def create_built_resume(self):
        response = self.client.post(
            reverse(
                "analyzer:built-resume-list-create"
            ),
            self.payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        return response

    def test_create_list_retrieve_update_and_delete(self):
        created = self.create_built_resume()
        resume_id = created.data["id"]

        self.assertEqual(
            created.data["skills"],
            ["Python", "Django"],
        )
        self.assertIn("created_at", created.data)
        self.assertIn("updated_at", created.data)

        list_response = self.client.get(
            reverse(
                "analyzer:built-resume-list-create"
            )
        )
        detail_url = reverse(
            "analyzer:built-resume-detail",
            args=[resume_id],
        )
        detail_response = self.client.get(detail_url)

        self.assertEqual(
            list_response.status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(
            detail_response.data["full_name"],
            "Ada Lovelace",
        )

        update_response = self.client.patch(
            detail_url,
            {"summary": "Updated professional summary."},
            format="json",
        )

        self.assertEqual(
            update_response.status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(
            update_response.data["summary"],
            "Updated professional summary.",
        )

        delete_response = self.client.delete(detail_url)

        self.assertEqual(
            delete_response.status_code,
            status.HTTP_204_NO_CONTENT,
        )
        self.assertFalse(
            BuiltResume.objects.filter(
                pk=resume_id
            ).exists()
        )

    def test_create_rejects_invalid_contact_details(self):
        payload = {
            **self.payload,
            "email": "not-an-email",
            "linkedin": "not-a-url",
        }

        response = self.client.post(
            reverse(
                "analyzer:built-resume-list-create"
            ),
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertIn("email", response.data)
        self.assertIn("linkedin", response.data)
        self.assertEqual(BuiltResume.objects.count(), 0)

    def test_create_rejects_malformed_json_collections(self):
        invalid_fields = [
            ("skills", "Python"),
            ("certifications", {"name": "Django"}),
            ("achievements", [42]),
            ("education", ["Mathematics"]),
            (
                "experience",
                [{"role": ["Engineer"]}],
            ),
            (
                "projects",
                [
                    {
                        "title": "Analyzer",
                        "unexpected": "value",
                    }
                ],
            ),
            (
                "projects",
                [
                    {
                        "title": "Analyzer",
                        "bullets": "Built an API",
                    }
                ],
            ),
        ]

        for field, invalid_value in invalid_fields:
            with self.subTest(field=field, value=invalid_value):
                response = self.client.post(
                    reverse(
                        "analyzer:built-resume-list-create"
                    ),
                    {
                        **self.payload,
                        field: invalid_value,
                    },
                    format="json",
                )

                self.assertEqual(
                    response.status_code,
                    status.HTTP_400_BAD_REQUEST,
                )
                self.assertIn(field, response.data)

        self.assertEqual(BuiltResume.objects.count(), 0)

    def test_create_allows_partial_rows_and_trims_text(self):
        payload = {
            **self.payload,
            "skills": ["  Python  ", "Django"],
            "education": [
                {},
                {
                    "degree": "  Mathematics  ",
                    "institution": "",
                },
            ],
            "experience": [
                {
                    "company": "  Analytical Engines  ",
                    "description": " ",
                }
            ],
            "projects": [
                {
                    "title": "  Analyzer  ",
                    "bullets": ["  Built an API  "],
                }
            ],
            "certifications": ["  Django Developer  "],
            "achievements": ["  First algorithm  "],
        }

        response = self.client.post(
            reverse(
                "analyzer:built-resume-list-create"
            ),
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )
        self.assertEqual(
            response.data["skills"],
            ["Python", "Django"],
        )
        self.assertEqual(response.data["education"][0], {})
        self.assertEqual(
            response.data["education"][1],
            {
                "degree": "Mathematics",
                "institution": "",
            },
        )
        self.assertEqual(
            response.data["experience"][0],
            {
                "company": "Analytical Engines",
                "description": "",
            },
        )
        self.assertEqual(
            response.data["projects"][0],
            {
                "title": "Analyzer",
                "bullets": ["Built an API"],
            },
        )
        self.assertEqual(
            response.data["certifications"],
            ["Django Developer"],
        )
        self.assertEqual(
            response.data["achievements"],
            ["First algorithm"],
        )

    def test_prepare_analysis_creates_resume_and_job_description(self):
        built_resume_id = self.create_built_resume().data[
            "id"
        ]
        description = (
            "Build Python and Django services with REST APIs "
            "for production systems."
        )

        response = self.client.post(
            reverse(
                "analyzer:built-resume-prepare-analysis",
                args=[built_resume_id],
            ),
            {
                "job_title": "Backend Developer",
                "company_name": "Example Company",
                "description": description,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        resume = Resume.objects.get(
            pk=response.data["resume_id"]
        )
        job_description = JobDescription.objects.get(
            pk=response.data["job_description_id"]
        )

        self.assertEqual(
            resume.original_filename,
            "Ada Lovelace Built Resume.docx",
        )
        self.assertEqual(
            resume.file_type,
            Resume.FileType.DOCX,
        )
        self.assertEqual(
            resume.file_size,
            len(resume.extracted_text.encode("utf-8")),
        )
        self.assertIn(
            "Professional Summary\nPython and Django engineer.",
            resume.extracted_text,
        )
        self.assertIn(
            "Projects\nBernoulli Algorithm | Python",
            resume.extracted_text,
        )
        self.assertEqual(
            job_description.job_title,
            "Backend Developer",
        )
        self.assertEqual(
            job_description.description,
            description,
        )
        self.assertEqual(
            response.data["resume"]["id"],
            resume.id,
        )
        self.assertEqual(
            response.data["job_description"]["id"],
            job_description.id,
        )

    def test_prepare_analysis_validates_request_before_creating_records(self):
        built_resume_id = self.create_built_resume().data[
            "id"
        ]

        response = self.client.post(
            reverse(
                "analyzer:built-resume-prepare-analysis",
                args=[built_resume_id],
            ),
            {
                "job_title": "Backend Developer",
                "description": "Too short",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertIn("description", response.data)
        self.assertEqual(Resume.objects.count(), 0)
        self.assertEqual(
            JobDescription.objects.count(),
            0,
        )

    @patch(
        "analyzer.views.JobDescription.objects.create",
        side_effect=IntegrityError("forced failure"),
    )
    def test_prepare_analysis_rolls_back_resume_if_job_creation_fails(
        self,
        mocked_create,
    ):
        built_resume_id = self.create_built_resume().data[
            "id"
        ]

        with self.assertRaises(IntegrityError):
            self.client.post(
                reverse(
                    "analyzer:built-resume-prepare-analysis",
                    args=[built_resume_id],
                ),
                {
                    "job_title": "Backend Developer",
                    "description": (
                        "Build Python and Django services for "
                        "production systems."
                    ),
                },
                format="json",
            )

        mocked_create.assert_called_once()
        self.assertEqual(Resume.objects.count(), 0)
        self.assertEqual(
            JobDescription.objects.count(),
            0,
        )

    def test_prepare_analysis_returns_not_found_for_missing_resume(self):
        response = self.client.post(
            reverse(
                "analyzer:built-resume-prepare-analysis",
                args=[99999],
            ),
            {
                "job_title": "Backend Developer",
                "description": (
                    "Build Python and Django services for "
                    "production systems."
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )
