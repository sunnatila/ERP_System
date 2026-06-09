from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WarehouseItemViewSet

router = DefaultRouter()
router.register(r'', WarehouseItemViewSet, basename='warehouse')

urlpatterns = [
    path('', include(router.urls)),
]
