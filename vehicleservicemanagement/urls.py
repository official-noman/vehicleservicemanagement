# vehicle/urls.py
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from vehicle import views
from vehicle.api import api

urlpatterns = [
    # ── Django admin site (keep for superuser DB management)
    path('admin/', admin.site.urls),

    # ── Health check
    path('health/', views.health_check, name='health-check'),

    # ── All Ninja API endpoints (auth, customer, mechanic, admin, public)
    path('api/', api.urls),

    # ── Frontend catch-all: Next.js handles ALL non-API routes.
    # If Next.js runs on its own server (e.g. localhost:3000), delete this line
    # and configure CORS in settings.py instead.
    path('', views.FrontendAppView.as_view(), name='frontend'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)