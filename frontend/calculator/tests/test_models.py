import pytest
from django.test import TestCase
from calculator.models import (
    Evaluee,
    EconomicAnalysis,
    HealthcareCategory,
    HealthcarePlan,
    HealthcareCost
)
from datetime import date

@pytest.mark.django_db
class TestEvaluee:
    def test_create_evaluee(self):
        evaluee = Evaluee.objects.create(
            first_name="John",
            last_name="Doe",
            date_of_birth=date(1990, 1, 1)
        )
        assert evaluee.first_name == "John"
        assert evaluee.last_name == "Doe"
        assert evaluee.date_of_birth == date(1990, 1, 1)

@pytest.mark.django_db
class TestEconomicAnalysis:
    @pytest.fixture
    def evaluee(self):
        return Evaluee.objects.create(
            first_name="John",
            last_name="Doe",
            date_of_birth=date(1990, 1, 1)
        )

    def test_create_analysis(self, evaluee):
        analysis = EconomicAnalysis.objects.create(
            evaluee=evaluee,
            date_of_injury=date(2023, 1, 1),
            date_of_report=date(2023, 12, 1),
            worklife_expectancy=20.0,
            years_to_final_separation=20.0,
            life_expectancy=40.0,
            pre_injury_base_wage=50000,
            post_injury_base_wage=30000,
            growth_rate=0.03,
            discount_rate=0.02
        )
        assert analysis.evaluee == evaluee
        assert analysis.pre_injury_base_wage == 50000
        assert analysis.post_injury_base_wage == 30000

    def test_wage_loss_calculation(self, evaluee):
        analysis = EconomicAnalysis.objects.create(
            evaluee=evaluee,
            date_of_injury=date(2023, 1, 1),
            date_of_report=date(2023, 12, 1),
            worklife_expectancy=20.0,
            years_to_final_separation=20.0,
            life_expectancy=40.0,
            pre_injury_base_wage=50000,
            post_injury_base_wage=30000,
            growth_rate=0.03,
            discount_rate=0.02
        )
        # Test that wage loss is calculated correctly
        wage_loss = analysis.calculate_wage_loss()
        assert wage_loss > 0  # Basic check that wage loss is positive
        assert wage_loss == pytest.approx(20000 * (1 - (1 / (1 + 0.03))**20) / 0.03, rel=1e-2)

@pytest.mark.django_db
class TestHealthcareCategory:
    def test_create_category(self):
        category = HealthcareCategory.objects.create(
            name="Primary Care",
            description="Regular checkups and preventive care",
            growth_rate=0.03,
            frequency_years=1
        )
        assert category.name == "Primary Care"
        assert category.description == "Regular checkups and preventive care"
        assert category.growth_rate == 0.03
        assert category.frequency_years == 1

    def test_category_str_representation(self):
        category = HealthcareCategory.objects.create(
            name="Primary Care",
            description="Regular checkups",
            growth_rate=0.03,
            frequency_years=1
        )
        assert str(category) == "Primary Care"

@pytest.mark.django_db
class TestHealthcarePlan:
    @pytest.fixture
    def category(self):
        return HealthcareCategory.objects.create(
            name="Primary Care",
            description="Regular checkups",
            growth_rate=0.03,
            frequency_years=1
        )

    @pytest.fixture
    def analysis(self, evaluee):
        return EconomicAnalysis.objects.create(
            evaluee=evaluee,
            date_of_injury=date(2023, 1, 1),
            date_of_report=date(2023, 12, 1),
            worklife_expectancy=20.0,
            years_to_final_separation=20.0,
            life_expectancy=40.0,
            pre_injury_base_wage=50000,
            post_injury_base_wage=30000,
            growth_rate=0.03,
            discount_rate=0.02
        )

    def test_create_plan(self, analysis, category):
        plan = HealthcarePlan.objects.create(
            analysis=analysis,
            category=category,
            base_cost=1000,
            is_active=True
        )
        assert plan.analysis == analysis
        assert plan.category == category
        assert plan.base_cost == 1000
        assert plan.is_active is True

    def test_toggle_plan(self, analysis, category):
        plan = HealthcarePlan.objects.create(
            analysis=analysis,
            category=category,
            base_cost=1000,
            is_active=True
        )
        plan.toggle()
        assert plan.is_active is False
        plan.toggle()
        assert plan.is_active is True

    def test_calculate_costs(self, analysis, category):
        plan = HealthcarePlan.objects.create(
            analysis=analysis,
            category=category,
            base_cost=1000,
            is_active=True
        )
        costs = plan.calculate_costs()
        assert len(costs) > 0
        assert all(isinstance(cost, HealthcareCost) for cost in costs)
        assert costs[0].cost == pytest.approx(1000, rel=1e-2)
        assert costs[1].cost == pytest.approx(1030, rel=1e-2)  # With 3% growth rate

@pytest.mark.django_db
class TestHealthcareCost:
    @pytest.fixture
    def healthcare_cost(self, analysis, category):
        plan = HealthcarePlan.objects.create(
            analysis=analysis,
            category=category,
            base_cost=1000,
            is_active=True
        )
        return HealthcareCost.objects.create(
            plan=plan,
            year=2023,
            age=33.0,  # Based on evaluee's age in 2023 (born in 1990)
            cost=1000
        )

    def test_create_cost(self, healthcare_cost):
        assert healthcare_cost.year == 2023
        assert healthcare_cost.cost == 1000

    def test_cost_str_representation(self, healthcare_cost):
        expected_str = f"{healthcare_cost.plan.category.name} cost for year {healthcare_cost.year}"
        assert str(healthcare_cost) == expected_str
