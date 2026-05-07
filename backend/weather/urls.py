from django.urls import path

from .views import WeatherListCreateView, WeatherSnapshotListView

urlpatterns = [
    path("", WeatherListCreateView.as_view(), name="weather-list-create"),
    path("snapshots/", WeatherSnapshotListView.as_view(), name="weather-snapshots"),
]
