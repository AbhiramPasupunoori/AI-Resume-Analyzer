from django.test import SimpleTestCase

from analyzer.services.built_resume_text import (
    build_resume_text_from_data,
)


class BuiltResumeTextTests(SimpleTestCase):
    def test_builds_plain_text_resume_from_builder_data(self):
        resume_text = build_resume_text_from_data(
            {
                "full_name": "  Ada Lovelace  ",
                "email": "ada@example.com",
                "phone": "+44 1234",
                "location": "London",
                "linkedin": "https://linkedin.com/in/ada",
                "github": "",
                "portfolio": "",
                "summary": "Computing pioneer.",
                "skills": [
                    "Python",
                    "  Django  ",
                    "",
                ],
                "education": [
                    {
                        "degree": "Mathematics",
                        "institution": "University of London",
                        "year": "1835",
                        "description": "Studied advanced mathematics.",
                    },
                    "ignore malformed item",
                ],
                "experience": [
                    {
                        "role": "Analyst",
                        "company": "Babbage Engines",
                        "duration": "1842-1843",
                        "bullets": [
                            "Published the first algorithm",
                            " ",
                        ],
                    }
                ],
                "projects": [],
                "certifications": [],
                "achievements": ["First programmer"],
            }
        )

        self.assertEqual(
            resume_text,
            "\n".join(
                [
                    "Ada Lovelace",
                    (
                        "ada@example.com | +44 1234 | London | "
                        "https://linkedin.com/in/ada"
                    ),
                    "",
                    "Professional Summary",
                    "Computing pioneer.",
                    "",
                    "Skills",
                    "- Python",
                    "- Django",
                    "",
                    "Education",
                    "Mathematics | University of London | 1835",
                    "Studied advanced mathematics.",
                    "",
                    "Experience",
                    "Analyst | Babbage Engines | 1842-1843",
                    "- Published the first algorithm",
                    "",
                    "Achievements",
                    "- First programmer",
                ]
            ),
        )

    def test_omits_empty_sections(self):
        self.assertEqual(
            build_resume_text_from_data(
                {
                    "full_name": "Grace Hopper",
                    "email": "grace@example.com",
                }
            ),
            "Grace Hopper\ngrace@example.com",
        )
