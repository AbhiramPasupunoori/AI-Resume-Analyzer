from django.urls import path

from analyzer.views import (
    JobDescriptionCreateView,
    ResumeAnalysisDetailView,
    ResumeAnalysisListCreateView,
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
    path(
        "analyses/",
        ResumeAnalysisListCreateView.as_view(),
        name="analysis-list-create",
    ),
    path(
        "analyses/<int:pk>/",
        ResumeAnalysisDetailView.as_view(),
        name="analysis-detail",
    ),
]