from rest_framework import serializers

from .models import Weather, WeatherSnapshot


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


class WeatherSnapshotSerializer(serializers.ModelSerializer):
    tree_species = serializers.CharField(source="tree.species", read_only=True, default=None)

    class Meta:
        model = WeatherSnapshot
        fields = "__all__"
        read_only_fields = ("timestamp",)
