from rest_framework.routers import DefaultRouter

from .views import TreeViewSet

router = DefaultRouter()
router.trailing_slash = ""
router.register("", TreeViewSet, basename="trees")

urlpatterns = router.urls
