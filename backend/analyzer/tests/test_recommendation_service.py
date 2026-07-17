from django.test import SimpleTestCase

from analyzer.services.recommendation_service import generate_recommendations


class RecommendationServiceTests(SimpleTestCase):
    def test_recommends_missing_skills_sections_and_metrics(self):
        recommendations = generate_recommendations(
            missing_skills=["AWS"],
            missing_sections=["Certifications"],
            achievement_score=2,
            readability_score=3,
            semantic_similarity=50,
        )

        combined = " ".join(recommendations)
        self.assertIn("AWS", combined)
        self.assertIn("Certifications", combined)
        self.assertIn("measurable achievements", combined)
        self.assertIn("readability", combined)
        self.assertIn("Tailor", combined)
