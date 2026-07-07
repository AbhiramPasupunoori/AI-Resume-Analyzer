from django.urls import path

from analyzer.views import (
    JobDescriptionCreateView,
    ResumeUploadView,
    database_health_check,
    health_check,
)


app_name = "analyzer"

urlpatterns = [
    path(
        "health/",
        health_check,
        name="health-check",
    ),
    path(
        "health/database/",
        database_health_check,
        name="database-health-check",
    ),
    path(
        "resumes/upload/",
        ResumeUploadView.as_view(),
        name="resume-upload",
    ),
    path(
        "job-descriptions/",
        JobDescriptionCreateView.as_view(),
        name="job-description-create",
    ),
]