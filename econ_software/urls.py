from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from calculator.views import (
    EconomicAnalysisViewSet, 
    HealthcareCategoryViewSet, 
    HealthcarePlanViewSet
)

router = DefaultRouter()
router.register(r'analyses', EconomicAnalysisViewSet, basename='analysis')
router.register(r'healthcare-categories', HealthcareCategoryViewSet, basename='healthcarecategory')
router.register(r'healthcare-plans', HealthcarePlanViewSet, basename='healthcareplan')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
