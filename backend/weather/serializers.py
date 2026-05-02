from rest_framework import serializers

from .models import Weather


class WeatherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Weather
        fields = "__all__"

    def validate(self, attrs):
        if attrs.get("wind_speed", 0) < 0 or attrs.get("precipitation", 0) < 0:
            raise serializers.ValidationError("Weather values cannot be negative.")
        return attrs
