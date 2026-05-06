from io import BytesIO
import base64
import os

from django.core.files.base import ContentFile
from PIL import Image
from rest_framework import serializers
from openai import OpenAI

from .models import Tree


class TreeSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)

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

        print("IMAGE FOUND:", bool(image))

        if image:
            print("COMPRESSING IMAGE...")
            compressed = self._compress_image(image)
            validated_data["image"] = compressed

            print("CALLING AI...")
            try:
                score = self._analyze_image(compressed)
                print("AI RESPONSE:", score)

                validated_data["risk_score"] = score

                if score > 70:
                    validated_data["risk_category"] = "HIGH"
                elif score > 40:
                    validated_data["risk_category"] = "MEDIUM"
                else:
                    validated_data["risk_category"] = "LOW"

                validated_data["ai_description"] = getattr(self, "_ai_description", "")
                validated_data["is_dangerous"] = score > 70

            except Exception as e:
                print("AI ERROR:", e)
                validated_data["risk_score"] = 50
                validated_data["risk_category"] = "MEDIUM"
                validated_data["ai_description"] = "AI analysis failed."
                validated_data["is_dangerous"] = False

        if not validated_data.get("risk_score"):
            height = float(validated_data.get("height", 0))
            tilt = float(validated_data.get("tilt", 0))
            health = validated_data.get("health_condition", "GOOD")

            health_factor = {
                "GOOD": 0,
                "FAIR": 20,
                "POOR": 40,
            }.get(health, 0)

            score = min(100, round((height * 0.8) + (tilt * 0.9) + health_factor))

            validated_data["risk_score"] = score

            if score <= 33:
                validated_data["risk_category"] = "LOW"
            elif score <= 66:
                validated_data["risk_category"] = "MEDIUM"
            else:
                validated_data["risk_category"] = "HIGH"

            validated_data["is_dangerous"] = score >= 67

        return super().create(validated_data)

    def _compress_image(self, image):
        img = Image.open(image).convert("RGB")

        output = BytesIO()
        img.save(output, format="JPEG", quality=70, optimize=True)

        return ContentFile(
            output.getvalue(),
            name=f"{image.name.split('.')[0]}.jpg"
        )

    def _analyze_image(self, image):
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        image_bytes = image.read()
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "You are a tree risk assessment AI.\n"
                                "Evaluate the tree risk based on:\n"
                                "- leaning angle\n"
                                "- broken branches\n"
                                "- trunk damage\n"
                                "- instability\n\n"
                                "Return ONLY in format:\n"
                                "number|reason\n\n"
                                "Example:\n"
                                "80|Tree is leaning heavily and unstable\n\n"
                                "NO extra text."
                            ),
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            },
                        },
                    ],
                }
            ],
            max_tokens=50,
        )

        result = response.choices[0].message.content.strip()
        print("RAW AI:", result)

        try:
            if "|" in result:
                score_str, description = result.split("|", 1)
                score = float(score_str.strip())
                self._ai_description = description.strip()
            else:
                score = 50.0
                self._ai_description = "AI could not analyze properly."
        except Exception as e:
            print("PARSE ERROR:", e)
            score = 50.0
            self._ai_description = "AI parsing failed."

        return score