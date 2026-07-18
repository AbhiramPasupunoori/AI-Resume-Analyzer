from django.db import connection
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from analyzer.models import (
    JobDescription,
    Resume,
    ResumeAnalysis,
)
from analyzer.serializers import (
    JobDescriptionSerializer,
    ResumeAnalysisSerializer,
    ResumeSummarySerializer,
    ResumeUploadSerializer,
)


@api_view(["GET"])
def health_check(request):
    return Response(
        {
            "status": "healthy",
            "application": "AI Resume Analyzer",
            "framework": "Django REST Framework",
        }
    )


@api_view(["GET"])
def database_health_check(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        result = cursor.fetchone()

    return Response(
        {
            "status": "healthy",
            "database": "PostgreSQL",
            "connected": result == (1,),
        }
    )


class ResumeUploadView(generics.CreateAPIView):
    queryset = Resume.objects.all()
    serializer_class = ResumeUploadSerializer
    parser_classes = [
        MultiPartParser,
        FormParser,
    ]
    permission_classes = [
        AllowAny,
    ]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        self.perform_create(serializer)

        return Response(
            {
                "message": "Resume uploaded successfully.",
                "resume": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


class ResumeListView(generics.ListAPIView):
    queryset = Resume.objects.all()
    serializer_class = ResumeSummarySerializer
    permission_classes = [
        AllowAny,
    ]


class ResumeDetailDeleteView(
    generics.RetrieveDestroyAPIView
):
    queryset = Resume.objects.all()
    serializer_class = ResumeSummarySerializer
    permission_classes = [
        AllowAny,
    ]

    def destroy(self, request, *args, **kwargs):
        resume = self.get_object()

        if resume.file:
            resume.file.delete(save=False)

        resume.delete()

        return Response(
            {
                "message": "Resume deleted successfully."
            },
            status=status.HTTP_200_OK,
        )


class JobDescriptionListCreateView(
    generics.ListCreateAPIView
):
    queryset = JobDescription.objects.all()
    serializer_class = JobDescriptionSerializer
    permission_classes = [
        AllowAny,
    ]


class JobDescriptionDetailDeleteView(
    generics.RetrieveDestroyAPIView
):
    queryset = JobDescription.objects.all()
    serializer_class = JobDescriptionSerializer
    permission_classes = [
        AllowAny,
    ]

    def destroy(self, request, *args, **kwargs):
        job_description = self.get_object()
        job_description.delete()

        return Response(
            {
                "message": "Job description deleted successfully."
            },
            status=status.HTTP_200_OK,
        )


class ResumeAnalysisListCreateView(
    generics.ListCreateAPIView
):
    queryset = (
        ResumeAnalysis.objects
        .select_related(
            "resume",
            "job_description",
        )
        .all()
    )

    serializer_class = ResumeAnalysisSerializer
    permission_classes = [
        AllowAny,
    ]


class ResumeAnalysisDetailDeleteView(
    generics.RetrieveDestroyAPIView
):
    queryset = (
        ResumeAnalysis.objects
        .select_related(
            "resume",
            "job_description",
        )
        .all()
    )

    serializer_class = ResumeAnalysisSerializer
    permission_classes = [
        AllowAny,
    ]

    def destroy(self, request, *args, **kwargs):
        analysis = self.get_object()
        analysis.delete()

        return Response(
            {
                "message": "Analysis deleted successfully."
            },
            status=status.HTTP_200_OK,
        )