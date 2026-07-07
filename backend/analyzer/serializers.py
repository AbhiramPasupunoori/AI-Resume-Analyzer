from pathlib import Path

from rest_framework import serializers

from analyzer.models import Resume
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
            # Delete the physical file if extraction fails.
            if resume.file:
                resume.file.delete(save=False)

            # Delete the incomplete database record.
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
        return bool(resume.extracted_text.strip())

    def get_word_count(self, resume) -> int:
        return len(resume.extracted_text.split())

    def get_character_count(self, resume) -> int:
        return len(resume.extracted_text)