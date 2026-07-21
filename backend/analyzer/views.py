from django.db import connection, transaction
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from analyzer.models import (
    BuiltResume,
    JobDescription,
    Resume,
    ResumeAnalysis,
)
from analyzer.serializers import (
    BuiltResumePrepareAnalysisSerializer,
    BuiltResumeSerializer,
    JobDescriptionSerializer,
    ResumeAnalysisSerializer,
    ResumeSummarySerializer,
    ResumeUploadSerializer,
)
from analyzer.services.built_resume_text import (
    build_resume_text,
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
            status=status.HTTP_204_NO_CONTENT,
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
            status=status.HTTP_204_NO_CONTENT,
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
            status=status.HTTP_204_NO_CONTENT,
        )


class BuiltResumeListCreateView(
    generics.ListCreateAPIView
):
    queryset = BuiltResume.objects.all()
    serializer_class = BuiltResumeSerializer
    permission_classes = [
        AllowAny,
    ]


class BuiltResumeDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = BuiltResume.objects.all()
    serializer_class = BuiltResumeSerializer
    permission_classes = [
        AllowAny,
    ]


class BuiltResumePrepareAnalysisView(APIView):
    permission_classes = [
        AllowAny,
    ]

    def post(self, request, pk):
        built_resume = generics.get_object_or_404(
            BuiltResume,
            pk=pk,
        )

        serializer = (
            BuiltResumePrepareAnalysisSerializer(
                data=request.data,
            )
        )

        serializer.is_valid(
            raise_exception=True,
        )

        resume_text = build_resume_text(
            built_resume,
        )

        with transaction.atomic():
            resume = Resume.objects.create(
                original_filename=(
                    f"{built_resume.full_name} Built Resume.docx"
                ),
                file_type=Resume.FileType.DOCX,
                file_size=len(
                    resume_text.encode("utf-8"),
                ),
                extracted_text=resume_text,
            )

            job_description = (
                JobDescription.objects.create(
                    job_title=(
                        serializer.validated_data[
                            "job_title"
                        ]
                    ),
                    company_name=(
                        serializer.validated_data.get(
                            "company_name",
                            "",
                        )
                    ),
                    description=(
                        serializer.validated_data[
                            "description"
                        ]
                    ),
                )
            )

        return Response(
            {
                "resume_id": resume.id,
                "job_description_id": (
                    job_description.id
                ),
                "resume": ResumeSummarySerializer(
                    resume
                ).data,
                "job_description": (
                    JobDescriptionSerializer(
                        job_description
                    ).data
                ),
            },
            status=status.HTTP_201_CREATED,
        )
