from pathlib import Path

from rest_framework import serializers

from analyzer.models import (
    JobDescription,
    Resume,
    ResumeAnalysis,
)
from analyzer.services.analysis_service import (
    ResumeAnalysisProcessingError,
    create_resume_analysis,
)
from analyzer.services.skill_extractor import extract_skills
from analyzer.services.text_extractor import (
    ResumeTextExtractionError,
    extract_resume_text,
)
from analyzer.validators import (
    ALLOWED_EXTENSIONS,
    validate_resume_file,
)


class ResumeUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField(
        write_only=True,
        required=True,
    )

    file_url = serializers.SerializerMethodField(
        read_only=True,
    )

    text_extracted = serializers.SerializerMethodField(
        read_only=True,
    )

    word_count = serializers.SerializerMethodField(
        read_only=True,
    )

    character_count = serializers.SerializerMethodField(
        read_only=True,
    )

    detected_skills = serializers.SerializerMethodField(
        read_only=True,
    )

    class Meta:
        model = Resume

        fields = (
            "id",
            "file",
            "file_url",
            "original_filename",
            "file_type",
            "file_size",
            "text_extracted",
            "word_count",
            "character_count",
            "detected_skills",
            "created_at",
        )

        read_only_fields = (
            "id",
            "file_url",
            "original_filename",
            "file_type",
            "file_size",
            "text_extracted",
            "word_count",
            "character_count",
            "detected_skills",
            "created_at",
        )

    def validate_file(self, uploaded_file):
        return validate_resume_file(uploaded_file)

    def create(self, validated_data):
        uploaded_file = validated_data["file"]

        extension = Path(
            uploaded_file.name
        ).suffix.lower()

        file_type = ALLOWED_EXTENSIONS[extension]

        resume = Resume.objects.create(
            file=uploaded_file,
            original_filename=uploaded_file.name,
            file_type=file_type,
            file_size=uploaded_file.size,
            extracted_text="",
        )

        try:
            extracted_text = extract_resume_text(
                file_path=resume.file.path,
                file_type=resume.file_type,
            )

        except ResumeTextExtractionError as error:
            if resume.file:
                resume.file.delete(save=False)

            resume.delete()

            raise serializers.ValidationError(
                {
                    "file": [str(error)],
                }
            ) from error

        resume.extracted_text = extracted_text

        resume.save(
            update_fields=[
                "extracted_text",
                "updated_at",
            ]
        )

        return resume

    def get_file_url(self, resume):
        if not resume.file:
            return None

        relative_url = resume.file.url
        request = self.context.get("request")

        if request is not None:
            return request.build_absolute_uri(
                relative_url
            )

        return relative_url

    def get_text_extracted(self, resume) -> bool:
        return bool(
            resume.extracted_text
            and resume.extracted_text.strip()
        )

    def get_word_count(self, resume) -> int:
        if not resume.extracted_text:
            return 0

        return len(resume.extracted_text.split())

    def get_character_count(self, resume) -> int:
        if not resume.extracted_text:
            return 0

        return len(resume.extracted_text)

    def get_detected_skills(
        self,
        resume,
    ) -> list[str]:
        return extract_skills(
            resume.extracted_text
        )


class JobDescriptionSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = JobDescription

        fields = (
            "id",
            "job_title",
            "company_name",
            "description",
            "required_skills",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "required_skills",
            "created_at",
            "updated_at",
        )

    def validate_job_title(
        self,
        job_title: str,
    ) -> str:
        job_title = job_title.strip()

        if not job_title:
            raise serializers.ValidationError(
                "Please enter a job title."
            )

        return job_title

    def validate_description(
        self,
        description: str,
    ) -> str:
        description = description.strip()

        if len(description) < 30:
            raise serializers.ValidationError(
                "Please enter a more detailed job description."
            )

        return description

    def create(self, validated_data):
        description = validated_data["description"]

        validated_data["required_skills"] = (
            extract_skills(description)
        )

        return JobDescription.objects.create(
            **validated_data
        )

    def update(
        self,
        instance,
        validated_data,
    ):
        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.required_skills = extract_skills(
            instance.description
        )

        instance.save()

        return instance


class ResumeSummarySerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = Resume

        fields = (
            "id",
            "original_filename",
            "file_type",
            "file_size",
            "created_at",
        )


class JobDescriptionSummarySerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = JobDescription

        fields = (
            "id",
            "job_title",
            "company_name",
            "required_skills",
            "created_at",
        )


class ResumeAnalysisSerializer(
    serializers.ModelSerializer
):
    resume_id = serializers.PrimaryKeyRelatedField(
        queryset=Resume.objects.all(),
        source="resume",
        write_only=True,
        error_messages={
            "does_not_exist": "No resume exists with ID {pk_value}.",
            "incorrect_type": "Resume ID must be an integer.",
        },
    )

    job_description_id = (
        serializers.PrimaryKeyRelatedField(
            queryset=JobDescription.objects.all(),
            source="job_description",
            write_only=True,
            error_messages={
                "does_not_exist": (
                    "No job description exists with ID {pk_value}."
                ),
                "incorrect_type": "Job description ID must be an integer.",
            },
        )
    )

    resume = ResumeSummarySerializer(
        read_only=True,
    )

    job_description = (
        JobDescriptionSummarySerializer(
            read_only=True,
        )
    )

    skill_coverage_percentage = (
        serializers.SerializerMethodField(
            read_only=True,
        )
    )

    score_breakdown = (
        serializers.SerializerMethodField(
            read_only=True,
        )
    )

    class Meta:
        model = ResumeAnalysis

        fields = (
            "id",
            "resume_id",
            "job_description_id",
            "resume",
            "job_description",
            "status",
            "overall_score",
            "skill_score",
            "semantic_score",
            "section_score",
            "achievement_score",
            "readability_score",
            "semantic_similarity",
            "skill_coverage_percentage",
            "score_breakdown",
            "resume_skills",
            "job_skills",
            "matched_skills",
            "missing_skills",
            "section_results",
            "achievement_results",
            "readability_results",
            "recommendations",
            "error_message",
            "analysis_time_ms",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "resume",
            "job_description",
            "status",
            "overall_score",
            "skill_score",
            "semantic_score",
            "section_score",
            "achievement_score",
            "readability_score",
            "semantic_similarity",
            "skill_coverage_percentage",
            "score_breakdown",
            "resume_skills",
            "job_skills",
            "matched_skills",
            "missing_skills",
            "section_results",
            "achievement_results",
            "readability_results",
            "recommendations",
            "error_message",
            "analysis_time_ms",
            "created_at",
            "updated_at",
        )

    def validate(self, attributes):
        resume = attributes["resume"]
        job_description = attributes[
            "job_description"
        ]

        if not resume.extracted_text.strip():
            raise serializers.ValidationError(
                {
                    "resume_id": (
                        "This resume does not contain "
                        "extracted text. Upload it again "
                        "or extract its text first."
                    )
                }
            )

        if not job_description.description.strip():
            raise serializers.ValidationError(
                {
                    "job_description_id": (
                        "The selected job description "
                        "does not contain any text."
                    )
                }
            )

        return attributes

    def create(self, validated_data):
        try:
            return create_resume_analysis(
                resume=validated_data["resume"],
                job_description=validated_data[
                    "job_description"
                ],
            )

        except ResumeAnalysisProcessingError as error:
            raise serializers.ValidationError(
                {
                    "analysis": str(error),
                }
            ) from error

    def get_skill_coverage_percentage(
        self,
        analysis,
    ) -> float:
        job_skills = analysis.job_skills or []
        matched_skills = (
            analysis.matched_skills or []
        )

        if not job_skills:
            return 0.0

        return round(
            len(matched_skills)
            / len(job_skills)
            * 100,
            2,
        )

    def get_score_breakdown(
        self,
        analysis,
    ) -> dict[str, object]:
        return {
            "skill": {
                "score": float(
                    analysis.skill_score
                ),
                "maximum": 45,
            },
            "semantic": {
                "score": float(
                    analysis.semantic_score
                ),
                "maximum": 25,
            },
            "sections": {
                "score": float(
                    analysis.section_score
                ),
                "maximum": 15,
            },
            "achievements": {
                "score": float(
                    analysis.achievement_score
                ),
                "maximum": 10,
            },
            "readability": {
                "score": float(
                    analysis.readability_score
                ),
                "maximum": 5,
            },
            "overall": {
                "score": float(
                    analysis.overall_score
                ),
                "maximum": 100,
            },
        }
