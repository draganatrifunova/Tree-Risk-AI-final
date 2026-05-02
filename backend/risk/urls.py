from django.urls import path

from .views import RiskCalculateView, RiskHistoryListView

urlpatterns = [
    path("calculate", RiskCalculateView.as_view(), name="risk-calculate"),
    path("history", RiskHistoryListView.as_view(), name="risk-history"),
]
