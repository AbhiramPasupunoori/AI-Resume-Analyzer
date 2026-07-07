from django.urls import path

from analyzer.views import database_health_check, health_check


urlpatterns = [
    path("health/", health_check, name="health-check"),
    path(
        "health/database/",
        database_health_check,
        name="database-health-check",
    ),
]