from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response


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