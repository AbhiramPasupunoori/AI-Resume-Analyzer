from django.db import connection
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from analyzer.models import Resume
from analyzer.serializers import ResumeUploadSerializer


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