from django.contrib import admin
from .models import WarehouseItem


@admin.register(WarehouseItem)
class WarehouseItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'quantity', 'location', 'last_updated')
    search_fields = ('product__name', 'location')
