from django.urls import path
from .views import LoginView, RefreshView, MeView, UsersView, UserDetailView

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth-login'),
    path('refresh/', RefreshView.as_view(), name='auth-refresh'),
    path('me/', MeView.as_view(), name='auth-me'),
    path('users/', UsersView.as_view(), name='users-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
]
