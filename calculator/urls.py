from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'evaluees', views.EvalueeViewSet, basename='evaluee')
router.register(r'analyses', views.EconomicAnalysisViewSet, basename='economicanalysis')

# Healthcare routes
router.register(r'healthcare-categories', views.HealthcareCategoryViewSet)

# Nested routes for healthcare plans
analysis_router = router.register(r'analyses', views.EconomicAnalysisViewSet, basename='economicanalysis')
analysis_router.register(r'healthcare-plans', views.HealthcarePlanViewSet, basename='analysis-healthcare-plans')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(analysis_router.urls)),
]
