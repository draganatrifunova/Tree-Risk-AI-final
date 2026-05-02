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
