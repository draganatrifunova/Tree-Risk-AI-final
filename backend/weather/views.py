from rest_framework import generics, permissions

from users.permissions import IsAdminRole

from .models import Weather
from .serializers import WeatherSerializer


class WeatherListCreateView(generics.ListCreateAPIView):
    queryset = Weather.objects.all()
    serializer_class = WeatherSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsAdminRole()]
        return [permissions.IsAuthenticated()]
