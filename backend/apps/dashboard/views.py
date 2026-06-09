from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from datetime import datetime, timedelta


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.orders.models import Order
        from apps.customers.models import Customer
        from apps.products.models import Product

        completed = Order.objects.filter(status='completed')

        total_revenue = completed.aggregate(total=Sum('total_price'))['total'] or 0
        total_orders = Order.objects.count()
        total_customers = Customer.objects.count()
        total_products = Product.objects.count()

        cutoff = datetime.now() - timedelta(days=730)
        monthly_data = (
            completed
            .filter(created_at__gte=cutoff)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(revenue=Sum('total_price'))
            .order_by('month')
        )
        months_uz = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn',
                     'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
        monthly_revenue = [
            {
                'month': months_uz[item['month'].month - 1] + ' ' + str(item['month'].year)[2:],
                'revenue': float(item['revenue'] or 0)
            }
            for item in monthly_data
        ]

        top_products = (
            completed
            .values('product__name')
            .annotate(sales=Count('id'))
            .order_by('-sales')[:5]
        )
        top_products_data = [
            {'name': item['product__name'], 'sales': item['sales']}
            for item in top_products
        ]

        return Response({
            'total_revenue': float(total_revenue),
            'total_orders': total_orders,
            'total_customers': total_customers,
            'total_products': total_products,
            'monthly_revenue': monthly_revenue,
            'top_products': top_products_data,
        })
