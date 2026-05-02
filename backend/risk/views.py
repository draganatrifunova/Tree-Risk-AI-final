from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from trees.models import Tree
from weather.models import Weather

from .models import RiskHistory
from .serializers import RiskHistorySerializer
from .services import ml_score, score_to_category


class RiskCalculateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        tree_id = request.data.get("tree_id")
        try:
            tree = Tree.objects.get(pk=tree_id)
        except Tree.DoesNotExist:
            return Response({"detail": "Tree not found."}, status=status.HTTP_404_NOT_FOUND)

        weather = Weather.objects.order_by("-date").first()
        if not weather:
            return Response({"detail": "Weather data is required."}, status=status.HTTP_400_BAD_REQUEST)

        old_score = tree.risk_score
        new_score = ml_score(
            tree.height, tree.tilt, tree.health_condition, weather.wind_speed, weather.precipitation
        )
        tree.risk_score = new_score
        tree.risk_category = score_to_category(new_score)
        tree.save(update_fields=["risk_score", "risk_category"])

        RiskHistory.objects.create(tree=tree, old_score=old_score, new_score=new_score)
        return Response({"tree_id": tree.id, "risk_score": new_score, "risk_category": tree.risk_category})


class RiskHistoryListView(generics.ListAPIView):
    queryset = RiskHistory.objects.select_related("tree").all()
    serializer_class = RiskHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
