from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import CustomUser
from .serializers import (
    UserSerializer, UserCreateSerializer,
    UserUpdateSerializer, ProfileUpdateSerializer,
)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')
        if not username or not password:
            return Response(
                {'detail': 'Username va parol kiritilishi shart'},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Check inactive BEFORE authenticate (Django's ModelBackend returns None for inactive users)
        try:
            candidate = CustomUser.objects.get(username=username)
            if not candidate.is_active:
                return Response(
                    {'detail': "Hisobingiz bloklangan. Administrator bilan bog'laning."},
                    status=status.HTTP_403_FORBIDDEN
                )
        except CustomUser.DoesNotExist:
            pass

        user = authenticate(username=username, password=password)
        if not user:
            return Response(
                {'detail': "Noto'g'ri username yoki parol"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'full_name': user.full_name,
                'role': user.role,
                'is_superuser': user.is_superuser,
            }
        })


class RefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'detail': 'Refresh token kerak'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            refresh = RefreshToken(refresh_token)
            return Response({'access': str(refresh.access_token)})
        except Exception:
            return Response({'detail': 'Token yaroqsiz'}, status=status.HTTP_401_UNAUTHORIZED)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'detail': "Ruxsat yo'q"}, status=status.HTTP_403_FORBIDDEN)
        users = CustomUser.objects.all().order_by('-created_at')
        return Response(UserSerializer(users, many=True).data)

    def post(self, request):
        if request.user.role != 'admin':
            return Response({'detail': "Ruxsat yo'q"}, status=status.HTTP_403_FORBIDDEN)
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_user(self, pk):
        try:
            return CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return None

    def get(self, request, pk):
        if request.user.role != 'admin':
            return Response({'detail': "Ruxsat yo'q"}, status=status.HTTP_403_FORBIDDEN)
        user = self._get_user(pk)
        if not user:
            return Response({'detail': 'Topilmadi'}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserSerializer(user).data)

    def patch(self, request, pk):
        if request.user.role != 'admin':
            return Response({'detail': "Ruxsat yo'q"}, status=status.HTTP_403_FORBIDDEN)
        user = self._get_user(pk)
        if not user:
            return Response({'detail': 'Topilmadi'}, status=status.HTTP_404_NOT_FOUND)

        # Only super admin can edit another super admin
        if user.is_superuser and not request.user.is_superuser:
            return Response(
                {'detail': "Super adminni faqat super admin tahrirlay oladi"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Only super admin can change is_active
        if 'is_active' in request.data:
            if not request.user.is_superuser:
                return Response(
                    {'detail': "Status o'zgartirish uchun super admin huquqi kerak"},
                    status=status.HTTP_403_FORBIDDEN
                )
            new_active = bool(request.data.get('is_active'))
            if not new_active and user.id == request.user.id:
                return Response(
                    {'detail': "O'zingizni nofaol qila olmaysiz"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if not new_active and user.is_superuser:
                active_su = CustomUser.objects.filter(is_superuser=True, is_active=True).count()
                if active_su <= 1:
                    return Response(
                        {'detail': "Yagona faol super adminni nofaol qila olmaysiz"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if request.user.role != 'admin':
            return Response({'detail': "Ruxsat yo'q"}, status=status.HTTP_403_FORBIDDEN)
        user = self._get_user(pk)
        if not user:
            return Response({'detail': 'Topilmadi'}, status=status.HTTP_404_NOT_FOUND)
        if user.id == request.user.id:
            return Response({'detail': "O'zingizni o'chira olmaysiz"}, status=status.HTTP_400_BAD_REQUEST)
        if user.is_superuser:
            return Response({'detail': "Super adminni o'chira olmaysiz"}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
