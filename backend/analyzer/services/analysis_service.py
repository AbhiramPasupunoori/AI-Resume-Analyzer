from decimal import Decimal, ROUND_HALF_UP
from time import perf_counter

from django.db import transaction

from analyzer.models import (
    JobDescription,
    Resume,
    ResumeAnalysis,
)
from analyzer.services.achievement_detector import analyze_achievements
from analyzer.services.readability_service import analyze_readability
from analyzer.services.recommendation_service import generate_recommendations
from analyzer.services.section_detector import (
    analyze_resume_sections,
)
from analyzer.services.similarity_service import (
    SemanticSimilarityError,
    calculate_semantic_score,
    calculate_semantic_similarity,
)
from analyzer.services.skill_extractor import (
    compare_resume_with_job,
)


class ResumeAnalysisProcessingError(Exception):
    """Raised when a resume analysis cannot be completed."""


def calculate_skill_score(
    skill_coverage_percentage: float,
) -> Decimal:
    """
    Convert skill coverage percentage into a score out of 45.
    """

    coverage = Decimal(
        str(skill_coverage_percentage)
    )

    score = coverage * Decimal("0.45")

    return score.quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )


def calculate_processing_time_ms(
    started_at: float,
) -> int:
    elapsed_seconds = perf_counter() - started_at

    return max(
        1,
        round(elapsed_seconds * 1000),
    )


def create_resume_analysis(
    resume: Resume,
    job_description: JobDescription,
) -> ResumeAnalysis:
    """
    Compare a resume with a job description and save the result.
    """

    if not resume.extracted_text.strip():
        raise ResumeAnalysisProcessingError(
            "The selected resume does not contain extracted text."
        )

    if not job_description.description.strip():
        raise ResumeAnalysisProcessingError(
            "The selected job description is empty."
        )

    started_at = perf_counter()

    analysis = ResumeAnalysis.objects.create(
        resume=resume,
        job_description=job_description,
        status=ResumeAnalysis.Status.PENDING,
    )

    try:
        analysis.status = (
            ResumeAnalysis.Status.PROCESSING
        )

        analysis.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        # -----------------------------------------
        # 1. Skill comparison: maximum 45 points
        # -----------------------------------------

        comparison = compare_resume_with_job(
            resume_text=resume.extracted_text,
            job_description_text=(
                job_description.description
            ),
        )

        if not comparison["job_skills"]:
            raise ResumeAnalysisProcessingError(
                "No supported skills were found in the job description. "
                "Add specific technical skills and try again."
            )

        skill_coverage_percentage = comparison[
            "skill_coverage_percentage"
        ]

        skill_score = calculate_skill_score(
            skill_coverage_percentage
        )

        # -----------------------------------------
        # 2. Semantic similarity: maximum 25 points
        # -----------------------------------------

        semantic_result = (
            calculate_semantic_similarity(
                resume_text=resume.extracted_text,
                job_description_text=(
                    job_description.description
                ),
            )
        )

        semantic_score = calculate_semantic_score(
            semantic_result["similarity"]
        )

        semantic_percentage = Decimal(
            str(semantic_result["percentage"])
        ).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        # -----------------------------------------
        # 3. Section completeness: maximum 15 points
        # -----------------------------------------

        section_analysis = analyze_resume_sections(
            resume.extracted_text
        )

        section_score = section_analysis["score"]

        # Decimal values should not be placed directly
        # inside section_results JSON.
        section_results_for_storage = {
            "sections": section_analysis[
                "sections"
            ],
            "present_sections": section_analysis[
                "present_sections"
            ],
            "missing_sections": section_analysis[
                "missing_sections"
            ],
            "present_count": section_analysis[
                "present_count"
            ],
            "total_sections": section_analysis[
                "total_sections"
            ],
            "completeness_percentage": (
                section_analysis[
                    "completeness_percentage"
                ]
            ),
        }

        # -----------------------------------------
        # 4. Achievement quality: maximum 10 points
        # -----------------------------------------

        achievement_analysis = analyze_achievements(
            resume.extracted_text
        )
        achievement_score = achievement_analysis["score"]
        achievement_results_for_storage = {
            **achievement_analysis,
            "score": float(achievement_score),
        }

        # -----------------------------------------
        # 5. Readability: maximum 5 points
        # -----------------------------------------

        readability_analysis = analyze_readability(
            resume.extracted_text
        )
        readability_score = readability_analysis["score"]
        readability_results_for_storage = {
            **readability_analysis,
            "score": float(readability_score),
        }

        recommendations = generate_recommendations(
            missing_skills=comparison["missing_skills"],
            missing_sections=section_analysis["missing_sections"],
            achievement_score=float(achievement_score),
            readability_score=float(readability_score),
            semantic_similarity=float(semantic_percentage),
        )

        # Full score maximum: 45 + 25 + 15 + 10 + 5 = 100.
        overall_score = (
            skill_score
            + semantic_score
            + section_score
            + achievement_score
            + readability_score
        ).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        overall_score = min(
            overall_score,
            Decimal("100.00"),
        )

        processing_time_ms = (
            calculate_processing_time_ms(
                started_at
            )
        )

        # -----------------------------------------
        # 6. Save the completed analysis
        # -----------------------------------------

        with transaction.atomic():
            job_description.required_skills = (
                comparison["job_skills"]
            )

            job_description.save(
                update_fields=[
                    "required_skills",
                    "updated_at",
                ]
            )

            analysis.resume_skills = comparison[
                "resume_skills"
            ]

            analysis.job_skills = comparison[
                "job_skills"
            ]

            analysis.matched_skills = comparison[
                "matched_skills"
            ]

            analysis.missing_skills = comparison[
                "missing_skills"
            ]

            analysis.skill_score = skill_score

            analysis.semantic_score = (
                semantic_score
            )

            analysis.semantic_similarity = (
                semantic_percentage
            )

            analysis.section_score = section_score

            analysis.section_results = (
                section_results_for_storage
            )

            analysis.achievement_score = achievement_score
            analysis.achievement_results = (
                achievement_results_for_storage
            )

            analysis.readability_score = readability_score
            analysis.readability_results = (
                readability_results_for_storage
            )

            analysis.recommendations = recommendations

            analysis.overall_score = overall_score

            analysis.status = (
                ResumeAnalysis.Status.COMPLETED
            )

            analysis.error_message = ""

            analysis.analysis_time_ms = (
                processing_time_ms
            )

            analysis.save(
                update_fields=[
                    "resume_skills",
                    "job_skills",
                    "matched_skills",
                    "missing_skills",
                    "skill_score",
                    "semantic_score",
                    "semantic_similarity",
                    "section_score",
                    "section_results",
                    "achievement_score",
                    "achievement_results",
                    "readability_score",
                    "readability_results",
                    "recommendations",
                    "overall_score",
                    "status",
                    "error_message",
                    "analysis_time_ms",
                    "updated_at",
                ]
            )

        return analysis

    except (SemanticSimilarityError, ResumeAnalysisProcessingError) as error:
        analysis.status = (
            ResumeAnalysis.Status.FAILED
        )

        analysis.error_message = str(error)

        analysis.analysis_time_ms = (
            calculate_processing_time_ms(
                started_at
            )
        )

        analysis.save(
            update_fields=[
                "status",
                "error_message",
                "analysis_time_ms",
                "updated_at",
            ]
        )

        if isinstance(error, ResumeAnalysisProcessingError):
            raise

        raise ResumeAnalysisProcessingError(str(error)) from error

    except Exception as error:
        analysis.status = (
            ResumeAnalysis.Status.FAILED
        )

        analysis.error_message = str(error)[
            :2000
        ]

        analysis.analysis_time_ms = (
            calculate_processing_time_ms(
                started_at
            )
        )

        analysis.save(
            update_fields=[
                "status",
                "error_message",
                "analysis_time_ms",
                "updated_at",
            ]
        )

        raise ResumeAnalysisProcessingError(
            "The resume analysis could not be completed."
        ) from error
