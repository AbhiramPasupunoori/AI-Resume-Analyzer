from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import FileResponse
from django.urls import include, path, re_path


def react_app(request):
    index_path = (
        settings.BASE_DIR
        / "static"
        / "frontend"
        / "index.html"
    )

    return FileResponse(
        index_path.open("rb"),
        content_type="text/html",
    )


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("analyzer.urls")),
    re_path(
        r"^(?!api(?:/|$)|admin(?:/|$)|static(?:/|$)|media(?:/|$)).*$",
        react_app,
        name="react-app",
    ),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )
