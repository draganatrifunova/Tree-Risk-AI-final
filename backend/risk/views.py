from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from trees.models import Tree
from weather.services import OpenWeatherService

from .models import RiskHistory
from .serializers import RiskHistorySerializer
from .services import hybrid_risk_score, score_breakdown, score_to_category


class RiskCalculateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        tree_id = request.data.get("tree_id")
        try:
            tree = Tree.objects.get(pk=tree_id)
        except Tree.DoesNotExist:
            return Response({"detail": "Tree not found."}, status=status.HTTP_404_NOT_FOUND)

        snapshot = OpenWeatherService().create_snapshot(tree)

        old_score = tree.risk_score
        new_score = hybrid_risk_score(tree, snapshot)
        new_category = score_to_category(new_score)

        tree.risk_score = new_score
        tree.risk_category = new_category
        tree.is_dangerous = new_score > 65
        tree.save(update_fields=["risk_score", "risk_category", "is_dangerous"])

        RiskHistory.objects.create(tree=tree, old_score=old_score, new_score=new_score)

        return Response({
            "tree_id": tree.id,
            "risk_score": new_score,
            "risk_category": new_category,
            "weather_snapshot_id": snapshot.id,
            "weather_source": snapshot.source,
            "score_breakdown": score_breakdown(tree, snapshot),
        })


class RiskHistoryListView(generics.ListAPIView):
    queryset = RiskHistory.objects.select_related("tree").all()
    serializer_class = RiskHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
