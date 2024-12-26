import pytest
from datetime import date
from calculator.models import Evaluee, EconomicAnalysis, HealthcareCategory

@pytest.fixture
def evaluee(db):
    return Evaluee.objects.create(
        first_name="John",
        last_name="Doe",
        date_of_birth=date(1990, 1, 1)
    )

@pytest.fixture
def analysis(db, evaluee):
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

@pytest.fixture
def category(db):
    return HealthcareCategory.objects.create(
        name="Test Category",
        description="Test Description",
        growth_rate=0.03,
        frequency_years=1
    )
