from django.core.exceptions import ValidationError
from django.db import models


class Tree(models.Model):
    class HealthCondition(models.TextChoices):
        GOOD = "GOOD", "Good"
        FAIR = "FAIR", "Fair"
        POOR = "POOR", "Poor"

    class RiskCategory(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"

    species = models.CharField(max_length=120)
    latitude = models.FloatField()
    longitude = models.FloatField()
    height = models.FloatField()
    tilt = models.FloatField()
    health_condition = models.CharField(max_length=16, choices=HealthCondition.choices)
    image = models.ImageField(upload_to="trees/", blank=True, null=True)
    risk_score = models.FloatField(default=0)
    risk_category = models.CharField(
        max_length=16, choices=RiskCategory.choices, default=RiskCategory.LOW
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        for field in ("height", "tilt"):
            if getattr(self, field) < 0:
                raise ValidationError(f"{field} cannot be negative.")
