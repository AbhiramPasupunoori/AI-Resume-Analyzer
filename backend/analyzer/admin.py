from django.contrib import admin

from analyzer.models import (
    JobDescription,
    Resume,
    ResumeAnalysis,
)


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "original_filename",
        "file_type",
        "file_size",
        "created_at",
    )

    list_filter = (
        "file_type",
        "created_at",
    )

    search_fields = (
        "original_filename",
        "extracted_text",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )


@admin.register(JobDescription)
class JobDescriptionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "job_title",
        "company_name",
        "created_at",
    )

    list_filter = (
        "created_at",
    )

    search_fields = (
        "job_title",
        "company_name",
        "description",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )


@admin.register(ResumeAnalysis)
class ResumeAnalysisAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "resume",
        "job_description",
        "status",
        "overall_score",
        "created_at",
    )

    list_filter = (
        "status",
        "created_at",
    )

    search_fields = (
        "resume__original_filename",
        "job_description__job_title",
        "job_description__company_name",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )