from rest_framework import serializers

from .models import RiskHistory


class RiskHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskHistory
        fields = "__all__"
