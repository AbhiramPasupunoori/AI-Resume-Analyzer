from django.test import TestCase
from django.urls import reverse


class HealthCheckTests(TestCase):
    def test_root_serves_react_application(self):
        response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '<div id="root"></div>')

    def test_client_route_serves_react_application(self):
        response = self.client.get("/analyze")

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '<div id="root"></div>')

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
