from django.urls import path
from .views import AnalysisCreateView, AnalysisDetailView

urlpatterns = [
    path("", AnalysisCreateView.as_view(), name="analysis-create"),
    path("analysis/<int:pk>/", AnalysisDetailView.as_view(), name="analysis-detail"),
]
