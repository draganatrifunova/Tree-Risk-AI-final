from rest_framework import generics, permissions

from users.permissions import IsAdminRole

from .models import Weather, WeatherSnapshot
from .serializers import WeatherSerializer, WeatherSnapshotSerializer


class WeatherListCreateView(generics.ListCreateAPIView):
    queryset = Weather.objects.all()
    serializer_class = WeatherSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsAdminRole()]
        return [permissions.IsAuthenticated()]


class WeatherSnapshotListView(generics.ListAPIView):
    queryset = WeatherSnapshot.objects.select_related("tree").all()
    serializer_class = WeatherSnapshotSerializer
    permission_classes = [permissions.IsAuthenticated]
