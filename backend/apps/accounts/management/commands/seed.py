from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.management import call_command

User = get_user_model()

USERS = [
    {
        'username': 'admin',
        'password': 'admin1234',
        'email': 'admin@stylehub.uz',
        'full_name': 'Admin User',
        'role': 'admin',
        'is_staff': True,
        'is_superuser': True,
    },
    {
        'username': 'manager',
        'password': 'manager1234',
        'email': 'manager@stylehub.uz',
        'full_name': 'Manager User',
        'role': 'manager',
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'username': 'viewer',
        'password': 'viewer1234',
        'email': 'viewer@stylehub.uz',
        'full_name': 'Viewer User',
        'role': 'viewer',
        'is_staff': False,
        'is_superuser': False,
    },
]


class Command(BaseCommand):
    help = 'Admin, manager, viewer userlar va boshlangich ma\'lumotlarni yaratadi'

    def handle(self, *args, **kwargs):
        self.stdout.write('=== Seed boshlandi ===\n')

        # ── Userlar yaratish ─────────────────────────────
        for u in USERS:
            if User.objects.filter(username=u['username']).exists():
                self.stdout.write(self.style.WARNING(
                    f'  [o\'tkazildi] {u["username"]} allaqachon mavjud'
                ))
                continue

            User.objects.create_user(
                username=u['username'],
                password=u['password'],
                email=u['email'],
                full_name=u['full_name'],
                role=u['role'],
                is_staff=u['is_staff'],
                is_superuser=u['is_superuser'],
            )
            self.stdout.write(self.style.SUCCESS(
                f'  [yaratildi] {u["username"]} / {u["password"]}  ({u["role"]})'
            ))

        # ── Boshlangich ma'lumotlar ──────────────────────
        self.stdout.write('')
        try:
            call_command('loaddata', 'fixtures/initial_data.json', verbosity=0)
            self.stdout.write(self.style.SUCCESS(
                '  [yuklandi]  Mahsulotlar, mijozlar, buyurtmalar, ombor'
            ))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'  [xato] Fixture yuklanmadi: {e}'))

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=== Seed yakunlandi ==='))
        self.stdout.write('')
        self.stdout.write('  Login ma\'lumotlari:')
        self.stdout.write('  admin   / admin1234')
        self.stdout.write('  manager / manager1234')
        self.stdout.write('  viewer  / viewer1234')
