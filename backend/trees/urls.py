from rest_framework.routers import DefaultRouter
from .views import TreeViewSet, TreeReportViewSet

router = DefaultRouter()
router.register("", TreeViewSet, basename="trees")
router.register("reports", TreeReportViewSet, basename="tree-reports")

urlpatterns = router.urls