from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('calculator.urls')),  # Include calculator URLs under /api/
    path('', RedirectView.as_view(url='/admin/', permanent=False)),
]

# Serve static files during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    # Add Django REST Framework browsable API authentication URLs
    urlpatterns += [
        path('api-auth/', include('rest_framework.urls')),
    ]
