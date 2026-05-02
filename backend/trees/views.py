from rest_framework import permissions, viewsets

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
