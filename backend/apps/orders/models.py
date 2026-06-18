from django.db import models


class Order(models.Model):
    STATUS_CHOICES = [
        ('completed', 'Bajarildi'),
        ('processing', 'Jarayonda'),
        ('pending', 'Kutilmoqda'),
    ]
    customer = models.ForeignKey('customers.Customer', on_delete=models.CASCADE)
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    quantity = models.IntegerField()
    total_price = models.DecimalField(max_digits=14, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Buyurtma'
        verbose_name_plural = 'Buyurtmalar'
        ordering = ['-created_at']

    def __str__(self):
        return f"#{self.id} - {self.customer.name}"
