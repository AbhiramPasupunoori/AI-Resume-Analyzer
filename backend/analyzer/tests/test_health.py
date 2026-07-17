from django.test import TestCase
from django.urls import reverse


class HealthCheckTests(TestCase):
    def test_root_redirects_to_health_check(self):
        response = self.client.get(reverse("home"))

        self.assertRedirects(
            response,
            reverse("analyzer:health-check"),
            fetch_redirect_response=False,
        )

    def test_health_check_reports_application_status(self):
        response = self.client.get(
            reverse("analyzer:health-check")
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "healthy")
        self.assertEqual(
            response.json()["application"],
            "AI Resume Analyzer",
        )
