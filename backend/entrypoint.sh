#!/bin/bash
set -e

echo "Ma'lumotlar bazasi migratsiyasi..."
python manage.py migrate

echo "Statik fayllar yig'ilmoqda..."
python manage.py collectstatic --noinput

echo "Boshlang'ich foydalanuvchilar yaratilmoqda..."
python manage.py shell -c "
from apps.accounts.models import CustomUser
users = [
    ('admin', 'admin123', 'Bosh Administrator', 'admin'),
    ('manager', 'manager123', 'Menejer', 'manager'),
    ('viewer', 'viewer123', 'Kuzatuvchi', 'viewer'),
]
for username, password, full_name, role in users:
    if not CustomUser.objects.filter(username=username).exists():
        user = CustomUser.objects.create_user(
            username=username,
            password=password,
            full_name=full_name,
            role=role,
            is_staff=(role=='admin'),
            is_superuser=(role=='admin')
        )
        print(f'{username} yaratildi')
    else:
        print(f'{username} allaqachon mavjud')
"

echo "Boshlang'ich ma'lumotlar yuklanmoqda..."
python manage.py loaddata fixtures/initial_data.json

echo "Gunicorn ishga tushirilmoqda..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120
