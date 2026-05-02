from django.db import models

from trees.models import Tree


class RiskHistory(models.Model):
    tree = models.ForeignKey(Tree, on_delete=models.CASCADE, related_name="risk_history")
    old_score = models.FloatField()
    new_score = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
