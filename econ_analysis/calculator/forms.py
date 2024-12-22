from django import forms
from .models import EconomicAnalysis
from datetime import date


class EconomicAnalysisForm(forms.ModelForm):
    class Meta:
        model = EconomicAnalysis
        fields = [
            "date_of_birth",
            "date_of_injury",
            "date_of_report",
            "worklife_end_date",
            "pre_growth_rate",
            "pre_aif",
            "pre_base_earnings",
            "post_growth_rate",
            "post_aif",
            "post_base_earnings",
            "post_discount_rate",
            "include_health_insurance",
        ]
        widgets = {
            "date_of_birth": forms.DateInput(attrs={"type": "date"}),
            "date_of_injury": forms.DateInput(attrs={"type": "date"}),
            "date_of_report": forms.DateInput(
                attrs={"type": "date", "value": date.today().isoformat()}
            ),
            "worklife_end_date": forms.DateInput(attrs={"type": "date"}),
            "pre_growth_rate": forms.NumberInput(
                attrs={"step": "0.01", "min": "0", "max": "100"}
            ),
            "pre_aif": forms.NumberInput(
                attrs={"step": "0.01", "min": "0", "max": "100"}
            ),
            "pre_base_earnings": forms.NumberInput(attrs={"step": "0.01", "min": "0"}),
            "post_growth_rate": forms.NumberInput(
                attrs={"step": "0.01", "min": "0", "max": "100"}
            ),
            "post_aif": forms.NumberInput(
                attrs={"step": "0.01", "min": "0", "max": "100"}
            ),
            "post_base_earnings": forms.NumberInput(attrs={"step": "0.01", "min": "0"}),
            "post_discount_rate": forms.NumberInput(
                attrs={"step": "0.01", "min": "0", "max": "100"}
            ),
        }


class HealthInsuranceForm(forms.ModelForm):
    class Meta:
        model = EconomicAnalysis
        fields = ["hi_base_premium", "hi_growth_rate", "hi_discount_rate"]
        widgets = {
            "hi_base_premium": forms.NumberInput(attrs={"step": "0.01", "min": "0"}),
            "hi_growth_rate": forms.NumberInput(
                attrs={"step": "0.01", "min": "0", "max": "100"}
            ),
            "hi_discount_rate": forms.NumberInput(
                attrs={"step": "0.01", "min": "0", "max": "100"}
            ),
        }
