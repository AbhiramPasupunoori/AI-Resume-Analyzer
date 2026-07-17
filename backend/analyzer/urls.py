from django.urls import path

from analyzer.views import (
    JobDescriptionDetailView,
    JobDescriptionListCreateView,
    ResumeAnalysisDetailView,
    ResumeAnalysisListCreateView,
    ResumeDetailView,
    ResumeListView,
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
        "resumes/",
        ResumeListView.as_view(),
        name="resume-list",
    ),
    path(
        "resumes/upload/",
        ResumeUploadView.as_view(),
        name="resume-upload",
    ),
    path(
        "resumes/<int:pk>/",
        ResumeDetailView.as_view(),
        name="resume-detail",
    ),
    path(
        "job-descriptions/",
        JobDescriptionListCreateView.as_view(),
        name="job-description-list-create",
    ),
    path(
        "job-descriptions/<int:pk>/",
        JobDescriptionDetailView.as_view(),
        name="job-description-detail",
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
