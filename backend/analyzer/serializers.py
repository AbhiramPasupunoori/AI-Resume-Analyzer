from pathlib import Path

from rest_framework import serializers

from analyzer.models import Resume
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

    class Meta:
        model = Resume

        fields = (
            "id",
            "file",
            "file_url",
            "original_filename",
            "file_type",
            "file_size",
            "created_at",
        )

        read_only_fields = (
            "id",
            "file_url",
            "original_filename",
            "file_type",
            "file_size",
            "created_at",
        )

    def validate_file(self, uploaded_file):
        return validate_resume_file(uploaded_file)

    def create(self, validated_data):
        uploaded_file = validated_data["file"]

        extension = Path(
            uploaded_file.name
        ).suffix.lower()

        resume = Resume.objects.create(
            file=uploaded_file,
            original_filename=uploaded_file.name,
            file_type=ALLOWED_EXTENSIONS[extension],
            file_size=uploaded_file.size,
            extracted_text="",
        )

        return resume

    def get_file_url(self, resume):
        if not resume.file:
            return None

        relative_url = resume.file.url
        request = self.context.get("request")

        if request is not None:
            return request.build_absolute_uri(relative_url)

        return relative_url