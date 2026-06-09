from django.db import models


class WarehouseItem(models.Model):
    product = models.OneToOneField('products.Product', on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)
    location = models.CharField(max_length=10)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Ombor mahsuloti'
        verbose_name_plural = 'Ombor mahsulotlari'

    def __str__(self):
        return f"{self.product.name} - {self.location}"
