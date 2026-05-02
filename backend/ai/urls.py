from django.urls import path

from .views import DetectTreesView

urlpatterns = [
    path("detect-trees", DetectTreesView.as_view(), name="detect-trees"),
]
