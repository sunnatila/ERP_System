from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated, BasePermission, SAFE_METHODS
from .models import WarehouseItem
from .serializers import WarehouseReadSerializer, WarehouseWriteSerializer


class IsAdminOrManagerForWrite(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.role in ['admin', 'manager']


class WarehouseItemViewSet(viewsets.ModelViewSet):
    queryset = WarehouseItem.objects.select_related('product', 'product__category').all()
    permission_classes = [IsAuthenticated, IsAdminOrManagerForWrite]
    filter_backends = [filters.SearchFilter]
    search_fields = ['product__name', 'location']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return WarehouseWriteSerializer
        return WarehouseReadSerializer
