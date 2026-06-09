from rest_framework import serializers
from .models import Order


def _adjust_stock(product, delta):
    """delta > 0 means restore, delta < 0 means deduct"""
    from apps.warehouse.models import WarehouseItem
    product.stock = max(0, product.stock + delta)
    product.save(update_fields=['stock'])
    try:
        witem = WarehouseItem.objects.get(product=product)
        witem.quantity = max(0, witem.quantity + delta)
        witem.save(update_fields=['quantity'])
    except WarehouseItem.DoesNotExist:
        pass


class OrderReadSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.CharField(source='product.image', read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'customer', 'customer_name',
            'product', 'product_name', 'product_image',
            'quantity', 'total_price', 'status', 'created_at'
        )


class OrderWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ('customer', 'product', 'quantity', 'status')

    def create(self, validated_data):
        product = validated_data['product']
        quantity = validated_data['quantity']
        validated_data['total_price'] = product.price * quantity
        order = super().create(validated_data)
        _adjust_stock(product, -quantity)
        return order

    def update(self, instance, validated_data):
        old_product = instance.product
        old_quantity = instance.quantity
        new_product = validated_data.get('product', old_product)
        new_quantity = validated_data.get('quantity', old_quantity)
        validated_data['total_price'] = new_product.price * new_quantity

        if old_product != new_product or old_quantity != new_quantity:
            _adjust_stock(old_product, +old_quantity)
            _adjust_stock(new_product, -new_quantity)

        return super().update(instance, validated_data)
