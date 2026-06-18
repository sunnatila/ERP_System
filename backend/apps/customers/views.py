from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated, BasePermission, SAFE_METHODS
from .models import Customer
from .serializers import CustomerReadSerializer, CustomerWriteSerializer


class IsAdminForWrite(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.role == 'admin'


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by('-created_at')
    permission_classes = [IsAuthenticated, IsAdminForWrite]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'phone', 'email']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CustomerWriteSerializer
        return CustomerReadSerializer
