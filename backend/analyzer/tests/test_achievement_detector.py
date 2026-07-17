from decimal import Decimal

from django.test import SimpleTestCase

from analyzer.services.achievement_detector import analyze_achievements


class AchievementDetectorTests(SimpleTestCase):
    def test_scores_measurable_impact(self):
        result = analyze_achievements(
            "• Improved API performance by 35% and saved 120 hours."
        )

        self.assertEqual(result["score"], Decimal("10.00"))
        self.assertTrue(all(result["checks"].values()))

    def test_plain_description_has_no_achievement_score(self):
        result = analyze_achievements("Responsible for the application.")

        self.assertEqual(result["score"], Decimal("0.00"))
