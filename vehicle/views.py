# vehicle/views.py
#
# Since the project now uses Django Ninja (api.py) as the backend for Next.js,
# this file is intentionally minimal.
#
# The ONLY views kept here are:
#   1.  A catch-all that serves the Next.js frontend for non-API routes
#       (only needed if you're serving Next.js from Django via whitenoise/static).
#   2.  Optional: legacy admin site redirect helpers, if you still use django.contrib.admin.
#
# All business logic (auth, customer, mechanic, admin, attendance, feedback,
# contact) has been moved to vehicle/api.py and is exposed under /api/.

from django.http import HttpResponse
from django.shortcuts import redirect
from django.views.generic import TemplateView


# ─────────────────────────────────────────
# FRONTEND CATCH-ALL
# ─────────────────────────────────────────
# If you serve the Next.js build from Django (e.g. via WhiteNoise):
#   - Place the Next.js `out/` export into STATICFILES_DIRS or a templates folder.
#   - Point this view at the built index.html.
#
# If Next.js runs on its own server (recommended), delete this view entirely
# and just configure CORS in settings.py.

class FrontendAppView(TemplateView):
    """
    Serves the compiled Next.js index.html for all non-API routes.
    Only useful when Next.js is statically exported and bundled with Django.
    """
    template_name = "index.html"   # path inside your Django TEMPLATES dirs

    def get(self, request, *args, **kwargs):
        try:
            return super().get(request, *args, **kwargs)
        except Exception:
            return HttpResponse(
                "Frontend not found. Make sure Next.js is built and index.html is in the templates directory.",
                status=404,
            )


# ─────────────────────────────────────────
# HEALTH CHECK  (useful for deployment / load balancer pings)
# ─────────────────────────────────────────

def health_check(request):
    return HttpResponse("ok", content_type="text/plain")

# def home_view(request):
#     return redirect('adminlogin')