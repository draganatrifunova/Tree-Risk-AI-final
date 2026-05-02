from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("users.urls")),
    path("api/trees/", include("trees.urls")),
    path("api/weather/", include("weather.urls")),
    path("api/risk/", include("risk.urls")),
    path("api/reports/", include("reports.urls")),
    path("api/ai/", include("ai.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
