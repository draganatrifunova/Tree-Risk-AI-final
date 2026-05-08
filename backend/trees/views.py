from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from users.permissions import IsAdminRole

from .models import Tree
from .serializers import TreeSerializer


class TreeViewSet(viewsets.ModelViewSet):
    queryset = Tree.objects.all().order_by("-created_at")
    serializer_class = TreeSerializer

    def get_permissions(self):
        if self.action in ["create", "destroy"]:
            return [permissions.IsAuthenticated(), IsAdminRole()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        tree = serializer.save()

        # НЕ го пресметуваме пак score → AI веќе го дал
        if tree.risk_score > 70:
            tree.risk_category = "HIGH"
            tree.is_dangerous = True
        elif tree.risk_score > 40:
            tree.risk_category = "MEDIUM"
        else:
            tree.risk_category = "LOW"

        tree.save()

    # 🔥 HIGH RISK ENDPOINT
    @action(detail=False, methods=["get"])
    def high_risk(self, request):
        trees = Tree.objects.filter(risk_category="HIGH")
        serializer = self.get_serializer(trees, many=True)
        return Response(serializer.data)