from django.db import models


class Resume(models.Model):
    class FileType(models.TextChoices):
        PDF = "pdf", "PDF"
        DOCX = "docx", "DOCX"

    file = models.FileField(
        upload_to="resumes/%Y/%m/%d/",
    )

    original_filename = models.CharField(
        max_length=255,
    )

    file_type = models.CharField(
        max_length=10,
        choices=FileType.choices,
    )

    file_size = models.PositiveBigIntegerField(
        help_text="File size in bytes.",
    )

    extracted_text = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.original_filename


class JobDescription(models.Model):
    job_title = models.CharField(
        max_length=200,
    )

    company_name = models.CharField(
        max_length=200,
        blank=True,
    )

    description = models.TextField()

    required_skills = models.JSONField(
        default=list,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        if self.company_name:
            return f"{self.job_title} at {self.company_name}"

        return self.job_title


class ResumeAnalysis(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name="analyses",
    )

    job_description = models.ForeignKey(
        JobDescription,
        on_delete=models.CASCADE,
        related_name="analyses",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    overall_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )

    skill_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )

    semantic_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )

    section_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )

    achievement_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )

    readability_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )

    semantic_similarity = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )

    resume_skills = models.JSONField(
        default=list,
        blank=True,
    )

    job_skills = models.JSONField(
        default=list,
        blank=True,
    )

    matched_skills = models.JSONField(
        default=list,
        blank=True,
    )

    missing_skills = models.JSONField(
        default=list,
        blank=True,
    )

    section_results = models.JSONField(
        default=dict,
        blank=True,
    )

    recommendations = models.JSONField(
        default=list,
        blank=True,
    )

    error_message = models.TextField(
        blank=True,
    )

    analysis_time_ms = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Processing time in milliseconds.",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Resume analyses"

    def __str__(self) -> str:
        return (
            f"Analysis #{self.pk}: "
            f"{self.resume.original_filename} "
            f"for {self.job_description.job_title}"
        )