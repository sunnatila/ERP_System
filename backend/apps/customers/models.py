from django.db import models


class Customer(models.Model):
    STATUS_CHOICES = [
        ('active', 'Faol'),
        ('inactive', 'Nofaol'),
    ]
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Mijoz'
        verbose_name_plural = 'Mijozlar'
        ordering = ['-created_at']

    @property
    def total_orders(self):
        return self.order_set.count()

    @property
    def total_spent(self):
        from django.db.models import Sum
        return self.order_set.aggregate(total=Sum('total_price'))['total'] or 0

    def __str__(self):
        return self.name
