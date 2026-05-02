from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .tree_detection import detect_trees_placeholder


class DetectTreesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        image = request.FILES.get("image")
        if not image:
            return Response({"detail": "image is required."}, status=status.HTTP_400_BAD_REQUEST)
        result = detect_trees_placeholder(image)
        return Response(result, status=status.HTTP_200_OK)
