from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HealthcarePlanViewSet

router = DefaultRouter()
router.register(r'plans', HealthcarePlanViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
