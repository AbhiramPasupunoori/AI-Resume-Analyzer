from decimal import Decimal

from django.test import SimpleTestCase

from analyzer.services.readability_service import analyze_readability


class ReadabilityServiceTests(SimpleTestCase):
    def test_well_structured_resume_receives_full_score(self):
        text = "SUMMARY\n" + " ".join(["clear"] * 105) + "."
        result = analyze_readability(text)

        self.assertEqual(result["score"], Decimal("5.00"))
        self.assertEqual(result["word_count"], 106)

    def test_short_resume_loses_length_point(self):
        result = analyze_readability("SUMMARY\nPython developer.")

        self.assertFalse(result["checks"]["minimum_length"])
        self.assertLess(result["score"], Decimal("5.00"))
