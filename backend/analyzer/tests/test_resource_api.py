import tempfile
from pathlib import Path

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from analyzer.models import JobDescription, Resume, ResumeAnalysis


class ResourceApiTests(APITestCase):
    def setUp(self):
        self.media_directory = tempfile.TemporaryDirectory()
        self.override = override_settings(MEDIA_ROOT=self.media_directory.name)
        self.override.enable()
        self.resume = Resume.objects.create(
            file=SimpleUploadedFile("resume.pdf", b"stored resume"),
            original_filename="resume.pdf",
            file_type=Resume.FileType.PDF,
            file_size=13,
            extracted_text="Python developer",
        )
        self.job = JobDescription.objects.create(
            job_title="Backend Developer",
            description="Build Python and Django services for production.",
            required_skills=["Python", "Django"],
        )

    def tearDown(self):
        self.override.disable()
        self.media_directory.cleanup()

    def test_resume_list_and_detail(self):
        list_response = self.client.get(reverse("analyzer:resume-list"))
        detail_response = self.client.get(
            reverse("analyzer:resume-detail", args=[self.resume.pk])
        )

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data["original_filename"], "resume.pdf")
        self.assertTrue(detail_response.data["text_extracted"])
        self.assertIn("Python", detail_response.data["detected_skills"])

    def test_job_description_list_detail_and_create(self):
        self.assertEqual(
            self.client.get(reverse("analyzer:job-description-list-create")).status_code,
            status.HTTP_200_OK,
        )
        detail = self.client.get(
            reverse("analyzer:job-description-detail", args=[self.job.pk])
        )
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data["job_title"], "Backend Developer")

        created = self.client.post(
            reverse("analyzer:job-description-list-create"),
            {
                "job_title": "Frontend Developer",
                "description": "Build React and JavaScript interfaces for customers.",
            },
            format="json",
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        self.assertIn("React", created.data["required_skills"])

    def test_delete_resume_removes_database_and_physical_file(self):
        file_path = Path(self.resume.file.path)
        self.assertTrue(file_path.exists())

        response = self.client.delete(
            reverse("analyzer:resume-detail", args=[self.resume.pk])
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Resume.objects.filter(pk=self.resume.pk).exists())
        self.assertFalse(file_path.exists())

    def test_delete_job_description_and_analysis(self):
        analysis = ResumeAnalysis.objects.create(
            resume=self.resume,
            job_description=self.job,
        )
        analysis_response = self.client.delete(
            reverse("analyzer:analysis-detail", args=[analysis.pk])
        )
        job_response = self.client.delete(
            reverse("analyzer:job-description-detail", args=[self.job.pk])
        )

        self.assertEqual(analysis_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(job_response.status_code, status.HTTP_204_NO_CONTENT)

    def test_missing_resource_returns_404(self):
        response = self.client.get(reverse("analyzer:resume-detail", args=[99999]))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
