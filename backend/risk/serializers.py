from rest_framework import serializers

from .models import RiskHistory


class RiskHistorySerializer(serializers.ModelSerializer):
    tree_species = serializers.CharField(source="tree.species", read_only=True)

    class Meta:
        model = RiskHistory
        fields = "__all__"
