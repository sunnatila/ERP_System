from rest_framework import serializers
from .models import Customer


class CustomerReadSerializer(serializers.ModelSerializer):
    total_orders = serializers.IntegerField(read_only=True)
    total_spent = serializers.DecimalField(max_digits=16, decimal_places=2, read_only=True)

    class Meta:
        model = Customer
        fields = ('id', 'name', 'phone', 'email', 'status', 'created_at', 'total_orders', 'total_spent')


class CustomerWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ('name', 'phone', 'email', 'status')
