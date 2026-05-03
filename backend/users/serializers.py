from django.contrib.auth import get_user_model
from rest_framework import serializers


User = get_user_model()   # Django ke go zeme mojot custom User model, ne koristi Default User


#Ova e klasa sto prima JSON od frontend, go validira i kreira User vo database
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8) #Password mora da ima minimum 8 karakteri, ne se vraka nazad
    # vo response poradi bezbednost

    class Meta:   # Ke koristi User model, koi gi ocekuva ovie polinja username, email, password, role
        model = User      # id avtomatski se generira, ne moze da se prati od frontend
        fields = ("id", "username", "email", "password", "role")
        read_only_fields = ("id",)


    # create metod --> ova se slucuva pri registracija
    def create(self, validated_data):
        password = validated_data.pop("password")  # go vadi password od podatocite
        user = User(**validated_data)   # kreira User bez Password
        user.set_password(password)   # se setira password na User ama Password ne se cuva kako tekst, se hash-ira (encrypt)
        user.save()       #  go snima vo database
        return user
