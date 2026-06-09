from django.contrib import admin
from .models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'product', 'quantity', 'total_price', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('customer__name', 'product__name')
