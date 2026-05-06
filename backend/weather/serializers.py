from rest_framework import serializers

from .models import Weather


class WeatherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Weather
        fields = "__all__"

    def validate_wind_speed(self, value):
        if value < 0:
            raise serializers.ValidationError("Wind speed cannot be negative.")
        return value

    def validate_precipitation(self, value):
        if value < 0:
            raise serializers.ValidationError("Precipitation cannot be negative.")
        return value
