from django.shortcuts import render, redirect
from django.views.generic import CreateView, DetailView
from django.urls import reverse_lazy, reverse
from decimal import Decimal
from .models import EconomicAnalysis
from .forms import EconomicAnalysisForm, HealthInsuranceForm


class AnalysisCreateView(CreateView):
    model = EconomicAnalysis
    form_class = EconomicAnalysisForm
    template_name = "calculator/analysis_form.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        if self.request.POST:
            context["form"] = EconomicAnalysisForm(self.request.POST)
            if context["form"].is_valid() and context["form"].cleaned_data.get(
                "include_health_insurance"
            ):
                context["health_insurance_form"] = HealthInsuranceForm(
                    self.request.POST
                )
        else:
            context["health_insurance_form"] = HealthInsuranceForm()
        return context

    def form_valid(self, form):
        if form.is_valid():
            self.object = form.save()

            if form.cleaned_data["include_health_insurance"]:
                health_insurance_form = HealthInsuranceForm(self.request.POST)
                if health_insurance_form.is_valid():
                    for field, value in health_insurance_form.cleaned_data.items():
                        setattr(self.object, field, value)
                    self.object.save()

            return redirect("analysis-detail", pk=self.object.pk)
        else:
            return self.render_to_response(self.get_context_data(form=form))


class AnalysisDetailView(DetailView):
    model = EconomicAnalysis
    template_name = "calculator/analysis_detail.html"
    context_object_name = "analysis"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        analysis = self.get_object()

        # Calculate Pre-Injury Results
        pre_injury_results = []
        pre_total = Decimal("0.0")

        for period in analysis.get_pre_injury_periods():
            gross_earnings = period["portion_of_year"] * period["wage_base_years"]
            adjusted_earnings = gross_earnings * (analysis.pre_aif / Decimal("100.0"))
            pre_total += adjusted_earnings

            pre_injury_results.append(
                {
                    "year": period["year"],
                    "portion": period["portion_of_year"] * 100,  # Convert to percentage
                    "age": period["age"],
                    "wage_base": period["wage_base_years"],
                    "gross_earnings": gross_earnings,
                    "adjusted_earnings": adjusted_earnings,
                }
            )

        # Calculate Post-Injury Results
        post_injury_results = []
        post_total = Decimal("0.0")
        post_injury_present_total = Decimal("0.0")

        for period in analysis.get_post_injury_periods():
            gross_earnings = period["portion_of_year"] * period["wage_base_years"]
            adjusted_earnings = gross_earnings * (analysis.post_aif / Decimal("100.0"))
            post_total += adjusted_earnings
            post_injury_present_total += period["present_value"]

            post_injury_results.append(
                {
                    "year": period["year"],
                    "portion": period["portion_of_year"] * 100,  # Convert to percentage
                    "age": period["age"],
                    "wage_base": period["wage_base_years"],
                    "gross_earnings": gross_earnings,
                    "adjusted_earnings": adjusted_earnings,
                    "present_value": period["present_value"],
                }
            )

        # Calculate Health Insurance Results if included
        hi_results = None
        hi_future_total = None
        hi_present_total = None

        if analysis.include_health_insurance:
            hi_results = []
            hi_future_total = Decimal("0.0")
            hi_present_total = Decimal("0.0")

            for period in analysis.get_health_insurance_periods():
                hi_future_total += period["yearly_value"]
                hi_present_total += period["present_value"]

                hi_results.append(
                    {
                        "year": period["year"],
                        "portion": period["portion"] * 100,  # Convert to percentage
                        "premium": period["premium"],
                        "yearly_value": period["yearly_value"],
                        "present_value": period["present_value"],
                    }
                )

        context.update(
            {
                "pre_injury_results": pre_injury_results,
                "pre_injury_total": pre_total,
                "post_injury_results": post_injury_results,
                "post_injury_total": post_total,
                "post_injury_present_total": post_injury_present_total,
                "health_insurance_results": hi_results,
                "hi_future_total": hi_future_total,
                "hi_present_total": hi_present_total,
            }
        )

        return context
