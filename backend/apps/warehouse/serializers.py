from rest_framework import serializers
from .models import WarehouseItem


class WarehouseReadSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.CharField(source='product.image', read_only=True)
    product_category = serializers.CharField(source='product.category.name', read_only=True)

    class Meta:
        model = WarehouseItem
        fields = ('id', 'product', 'product_name', 'product_image', 'product_category',
                  'quantity', 'location', 'last_updated')


class WarehouseWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = WarehouseItem
        fields = ('product', 'quantity', 'location')
