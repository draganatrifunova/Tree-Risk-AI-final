from django.core.exceptions import ValidationError
from django.db import models


class Weather(models.Model):
    wind_speed = models.FloatField()
    precipitation = models.FloatField()
    date = models.DateField()

    class Meta:
        ordering = ["-date"]

    def clean(self):
        if self.wind_speed < 0 or self.precipitation < 0:
            raise ValidationError("Weather values cannot be negative.")


class WeatherSnapshot(models.Model):
    tree = models.ForeignKey(
        "trees.Tree",
        on_delete=models.CASCADE,
        related_name="weather_snapshots",
        null=True,
        blank=True,
    )
    wind_speed = models.FloatField()
    wind_gust = models.FloatField(null=True, blank=True)
    precipitation = models.FloatField()
    temperature = models.FloatField(null=True, blank=True)
    storm_indicator = models.BooleanField(default=False)
    forecast_max_wind_24h = models.FloatField(null=True, blank=True)
    weather_code = models.IntegerField(null=True, blank=True)
    source = models.CharField(max_length=20, default="manual")
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
