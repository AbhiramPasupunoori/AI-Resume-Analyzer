from decimal import Decimal

from django.test import SimpleTestCase

from analyzer.services.section_detector import (
    analyze_resume_sections,
    detect_resume_sections,
)


class SectionDetectorTests(SimpleTestCase):
    def test_detects_resume_sections(self):
        resume_text = """
        PROFESSIONAL SUMMARY

        Python developer experienced in backend
        and frontend development.

        TECHNICAL SKILLS

        Python, Django, React and PostgreSQL.

        WORK EXPERIENCE

        Software Development Intern.

        EDUCATION

        Bachelor of Technology.

        PROJECTS

        AI-Based Resume Analyzer.
        """

        result = analyze_resume_sections(
            resume_text
        )

        self.assertTrue(
            result["sections"]["summary"][
                "present"
            ]
        )

        self.assertTrue(
            result["sections"]["skills"][
                "present"
            ]
        )

        self.assertTrue(
            result["sections"]["experience"][
                "present"
            ]
        )

        self.assertTrue(
            result["sections"]["education"][
                "present"
            ]
        )

        self.assertTrue(
            result["sections"]["projects"][
                "present"
            ]
        )

        self.assertFalse(
            result["sections"][
                "certifications"
            ]["present"]
        )

        self.assertEqual(
            result["score"],
            Decimal("12.50"),
        )

        self.assertEqual(
            result["completeness_percentage"],
            83.33,
        )

    def test_detects_heading_with_colon(self):
        resume_text = """
        Skills: Python, Django and React
        Education: Bachelor of Technology
        """

        result = detect_resume_sections(
            resume_text
        )

        self.assertTrue(
            result["skills"]["present"]
        )

        self.assertTrue(
            result["education"]["present"]
        )

    def test_does_not_match_words_inside_sentence(self):
        resume_text = """
        I developed technical skills while
        working on several applications.
        """

        result = detect_resume_sections(
            resume_text
        )

        self.assertFalse(
            result["skills"]["present"]
        )