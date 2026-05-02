from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import RegisterSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user = self.serializer_class.Meta.model.objects.get(pk=response.data["id"])
        tokens = RefreshToken.for_user(user)
        return Response(
            {
                "user": response.data,
                "access": str(tokens.access_token),
                "refresh": str(tokens),
            },
            status=response.status_code,
        )


class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
