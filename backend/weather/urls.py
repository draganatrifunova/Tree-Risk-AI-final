from django.urls import path

from .views import WeatherListCreateView

urlpatterns = [
    path("", WeatherListCreateView.as_view(), name="weather-list-create"),
]
