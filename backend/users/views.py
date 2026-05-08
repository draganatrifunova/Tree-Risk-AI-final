from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import RegisterSerializer


# Kreira nov User + vednash mu dava JWT tokeni
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer   # Go koristi mojot RegisterSerializer
    permission_classes = [permissions.AllowAny]    # sekoj moze da se registrira (ne treba login)


#Ovverride na create -> ova go menuva default odnesuvanjeto,
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)   # go povikuva serializer-от, user se zacuvuva vo baza
        user = self.serializer_class.Meta.model.objects.get(pk=response.data["id"]) # go naoga novokreiraniot User preku id
        tokens = RefreshToken.for_user(user)  # Sozdava: access token (kratok rok), refresh token (podolg rok)
        return Response(
            {
                "user": response.data,
                "access": str(tokens.access_token),
                "refresh": str(tokens),
            },
            status=response.status_code,
        )    # Posle registracija User e kreiran, avtomatski e lognat (ima token), nema potreba od poseben login



#Logira postoecki User i vraka jwt TOKENI
class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
