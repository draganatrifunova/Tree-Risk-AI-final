from io import BytesIO

from django.core.files.base import ContentFile
from PIL import Image
from rest_framework import serializers

from .models import Tree


class TreeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tree
        fields = "__all__"
        read_only_fields = ("risk_score", "risk_category", "created_at")

    def validate(self, attrs):
        for field in ("height", "tilt"):
            if attrs.get(field, 0) < 0:
                raise serializers.ValidationError({field: "Cannot be negative."})
        return attrs

    def create(self, validated_data):
        image = validated_data.get("image")
        if image:
            validated_data["image"] = self._compress_image(image)
        return super().create(validated_data)

    def _compress_image(self, image):
        img = Image.open(image).convert("RGB")
        output = BytesIO()
        img.save(output, format="JPEG", quality=70, optimize=True)
        return ContentFile(output.getvalue(), name=f"{image.name.split('.')[0]}.jpg")
