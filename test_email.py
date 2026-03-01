import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "vehicleservicemanagement.settings")
django.setup()

from django.core.mail import send_mail
from django.conf import settings

print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
print(f"EMAIL_HOST_PASSWORD: {'*' * len(settings.EMAIL_HOST_PASSWORD)}")
try:
    send_mail(
        "Test Subject",
        "Test Message",
        settings.EMAIL_HOST_USER,
        ["official.aanoman@gmail.com"],
        fail_silently=False,
    )
    print("Email sent successfully!")
except Exception as e:
    import traceback

    traceback.print_exc()
