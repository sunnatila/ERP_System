from rest_framework import serializers
from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'full_name', 'role', 'is_active', 'is_superuser', 'created_at')
        read_only_fields = ('id', 'created_at', 'is_superuser')


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = CustomUser
        fields = ('username', 'password', 'full_name', 'role')

    def create(self, validated_data):
        password = validated_data.pop('password')
        role = validated_data.get('role', 'viewer')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.is_staff = (role == 'admin')
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=6)

    class Meta:
        model = CustomUser
        fields = ('is_active', 'role', 'full_name', 'password')

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if 'role' in validated_data:
            instance.is_staff = (validated_data['role'] == 'admin')
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class ProfileUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=6)

    class Meta:
        model = CustomUser
        fields = ('full_name', 'password')

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
