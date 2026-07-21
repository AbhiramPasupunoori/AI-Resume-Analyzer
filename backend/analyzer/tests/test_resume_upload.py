from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from analyzer.models import Resume


@override_settings(MEDIA_ROOT="/tmp/ai-resume-analyzer-tests")
class ResumeUploadApiTests(APITestCase):
    @patch("analyzer.serializers.extract_resume_text")
    def test_uploads_and_extracts_valid_pdf(self, mocked_extract):
        mocked_extract.return_value = "Python and Django developer"
        upload = SimpleUploadedFile(
            "resume.pdf",
            b"%PDF-valid-for-upload-validation",
            content_type="application/pdf",
        )

        response = self.client.post(
            reverse("analyzer:resume-upload"),
            {"file": upload},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Resume.objects.count(), 1)
        self.assertTrue(response.data["resume"]["text_extracted"])
        self.assertEqual(
            response.data["resume"]["extracted_text"],
            "Python and Django developer",
        )

    def test_rejects_unsupported_file_type(self):
        upload = SimpleUploadedFile(
            "resume.txt", b"plain text", content_type="text/plain"
        )

        response = self.client.post(
            reverse("analyzer:resume-upload"),
            {"file": upload},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Only PDF and DOCX", str(response.data))
