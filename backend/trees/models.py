from django.conf import settings
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

    # AI резултати
    risk_score = models.FloatField(default=0)
    risk_category = models.CharField(
        max_length=16,
        choices=RiskCategory.choices,
        default=RiskCategory.LOW
    )

    ai_description = models.TextField(blank=True, null=True)
    ai_vision_score = models.FloatField(null=True, blank=True)
    is_dangerous = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        for field in ("height", "tilt"):
            if getattr(self, field) < 0:
                raise ValidationError(f"{field} cannot be negative.")


class TreeReport(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        REVIEWED = "REVIEWED", "Reviewed"

    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tree_reports",
    )
    tree = models.ForeignKey(
        Tree,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reports",
    )
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    description = models.TextField()
    image = models.ImageField(upload_to="tree_reports/", null=True, blank=True)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)