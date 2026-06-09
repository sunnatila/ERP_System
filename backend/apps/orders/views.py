from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated, BasePermission, SAFE_METHODS
from .models import Order
from .serializers import OrderReadSerializer, OrderWriteSerializer, _adjust_stock


class IsAdminOrManagerForWrite(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.role in ['admin', 'manager']


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('customer', 'product').order_by('-created_at')
    permission_classes = [IsAuthenticated, IsAdminOrManagerForWrite]
    filter_backends = [filters.SearchFilter]
    search_fields = ['customer__name', 'product__name', 'status']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return OrderWriteSerializer
        return OrderReadSerializer

    def perform_destroy(self, instance):
        _adjust_stock(instance.product, +instance.quantity)
        instance.delete()
