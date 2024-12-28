import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from calculator.models import (
    Evaluee,
    EconomicAnalysis,
    HealthcareCategory,
    HealthcarePlan,
    HealthcareCost
)
from datetime import date, timedelta

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def evaluee():
    return Evaluee.objects.create(
        first_name="John",
        last_name="Doe",
        date_of_birth=date(1990, 1, 1)
    )

@pytest.fixture
def analysis(evaluee):
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
def healthcare_category():
    return HealthcareCategory.objects.create(
        name="Test Category",
        description="Test Description",
        growth_rate=0.03,
        frequency_years=1
    )

@pytest.mark.django_db
class TestHealthcareCategory:
    def test_create_category(self, healthcare_category):
        assert healthcare_category.name == "Test Category"
        assert healthcare_category.growth_rate == 0.03
        assert healthcare_category.frequency_years == 1

    def test_create_category_invalid_data(self, api_client):
        url = reverse('healthcarecategory-list')
        data = {
            'name': '',  # Invalid: empty name
            'growth_rate': -0.03,  # Invalid: negative growth rate
            'frequency_years': 0  # Invalid: zero frequency
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'name' in response.data
        assert 'growth_rate' in response.data
        assert 'frequency_years' in response.data

    def test_list_categories(self, api_client, healthcare_category):
        url = reverse('healthcarecategory-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['name'] == healthcare_category.name

    def test_update_category(self, api_client, healthcare_category):
        url = reverse('healthcarecategory-detail', kwargs={'pk': healthcare_category.id})
        data = {
            'name': 'Updated Category',
            'description': 'Updated Description',
            'growth_rate': 0.04,
            'frequency_years': 2
        }
        response = api_client.put(url, data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Updated Category'
        assert response.data['growth_rate'] == 0.04
        assert response.data['frequency_years'] == 2

    def test_delete_category(self, api_client, healthcare_category):
        url = reverse('healthcarecategory-detail', kwargs={'pk': healthcare_category.id})
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT

@pytest.mark.django_db
class TestHealthcarePlan:
    @pytest.fixture
    def healthcare_plan(self, analysis, healthcare_category):
        return HealthcarePlan.objects.create(
            analysis=analysis,
            category=healthcare_category,
            base_cost=1000,
            is_active=True
        )
    def test_create_plan(self, api_client, analysis, healthcare_category):
        url = reverse('analysis-healthcare-plans-list', kwargs={'analysis_pk': analysis.id})
        data = {
            'category_id': healthcare_category.id,
            'base_cost': 1000,
            'is_active': True
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['base_cost'] == 1000
        assert response.data['is_active'] is True

    def test_toggle_plan(self, api_client, analysis, healthcare_category):
        plan = HealthcarePlan.objects.create(
            analysis=analysis,
            category=healthcare_category,
            base_cost=1000,
            is_active=True
        )
        url = reverse('analysis-healthcare-plans-toggle', 
                     kwargs={'analysis_pk': analysis.id, 'pk': plan.id})
        response = api_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_active'] is False

    def test_create_plan_invalid_data(self, api_client, analysis, healthcare_category):
        url = reverse('analysis-healthcare-plans-list', kwargs={'analysis_pk': analysis.id})
        data = {
            'category_id': healthcare_category.id,
            'base_cost': -1000,  # Invalid: negative cost
            'is_active': True
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'base_cost' in response.data

    def test_create_plan_nonexistent_category(self, api_client, analysis):
        url = reverse('analysis-healthcare-plans-list', kwargs={'analysis_pk': analysis.id})
        data = {
            'category_id': 9999,  # Nonexistent category
            'base_cost': 1000,
            'is_active': True
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'category_id' in response.data

    def test_calculate_costs_with_frequency(self, api_client, analysis):
        # Create category with 2-year frequency
        category = HealthcareCategory.objects.create(
            name="Biennial Category",
            description="Occurs every 2 years",
            growth_rate=0.03,
            frequency_years=2
        )
        
        plan = HealthcarePlan.objects.create(
            analysis=analysis,
            category=category,
            base_cost=1000,
            is_active=True
        )
        url = reverse('analysis-healthcare-plans-calculate-costs', 
                     kwargs={'analysis_pk': analysis.id})
        response = api_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        
        url = reverse('analysis-healthcare-plans-calculate-costs', 
                     kwargs={'analysis_pk': analysis.id})
        response = api_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        
        costs = HealthcareCost.objects.filter(plan=plan).order_by('year')
        assert costs.exists()
        
        # Check costs are only created for every other year
        years = [cost.year for cost in costs]
        for i in range(len(years) - 1):
            assert years[i+1] - years[i] == 2

    def test_calculate_costs_with_growth(self, api_client, analysis, healthcare_plan):
        url = reverse('analysis-healthcare-plans-calculate-costs', 
                     kwargs={'analysis_pk': analysis.id})
        response = api_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        
        costs = HealthcareCost.objects.filter(plan=healthcare_plan).order_by('year')
        
        # Check first year cost
        first_cost = costs.first()
        assert first_cost.year == analysis.date_of_injury.year
        assert first_cost.cost == 1000  # Base cost
        
        # Check costs over multiple years
        for i, cost in enumerate(costs[1:], 1):
            expected_cost = 1000 * (1 + healthcare_plan.category.growth_rate) ** i
            assert abs(cost.cost - expected_cost) < 0.01  # Account for floating point

    def test_calculate_costs_inactive_plan(self, api_client, analysis, healthcare_plan):
        # Deactivate the plan
        healthcare_plan.is_active = False
        healthcare_plan.save()
        
        url = reverse('analysis-healthcare-plans-calculate-costs', 
                     kwargs={'analysis_pk': analysis.id})
        response = api_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        
        # Check that no costs were created for inactive plan
        costs = HealthcareCost.objects.filter(plan=healthcare_plan)
        assert not costs.exists()

    def test_calculate_costs_partial_year(self, api_client, analysis, healthcare_plan):
        # Set injury date to mid-year
        analysis.date_of_injury = date(2023, 7, 1)
        analysis.save()
        
        url = reverse('analysis-healthcare-plans-calculate-costs', 
                     kwargs={'analysis_pk': analysis.id})
        response = api_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        
        costs = HealthcareCost.objects.filter(plan=healthcare_plan).order_by('year')
        first_cost = costs.first()
        
        # Check that first year cost is prorated
        assert first_cost.year == 2023
        assert abs(first_cost.cost - (1000 * 0.5)) < 0.01  # Half year cost

    def test_calculate_costs_multiple_frequencies(self, api_client, analysis):
        # Create categories with different frequencies
        cat1 = HealthcareCategory.objects.create(
            name="Annual Category",
            growth_rate=0.03,
            frequency_years=1
        )
        cat2 = HealthcareCategory.objects.create(
            name="Biennial Category",
            growth_rate=0.03,
            frequency_years=2
        )
        
        # Create plans for both categories
        plan1 = HealthcarePlan.objects.create(
            analysis=analysis,
            category=cat1,
            base_cost=1000,
            is_active=True
        )
        plan2 = HealthcarePlan.objects.create(
            analysis=analysis,
            category=cat2,
            base_cost=2000,
            is_active=True
        )
        
        url = reverse('analysis-healthcare-plans-calculate-costs', 
                     kwargs={'analysis_pk': analysis.id})
        response = api_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        
        # Check costs for each year
        costs_by_year = {}
        for cost in HealthcareCost.objects.all():
            year_costs = costs_by_year.setdefault(cost.year, 0)
            costs_by_year[cost.year] = year_costs + cost.cost
            
        # Even years should have both costs, odd years only annual
        for year, total_cost in costs_by_year.items():
            if (year - analysis.date_of_injury.year) % 2 == 0:
                # Even years: both plans
                expected = 1000 * (1 + 0.03) ** (year - analysis.date_of_injury.year) + \
                          2000 * (1 + 0.03) ** (year - analysis.date_of_injury.year)
                assert abs(total_cost - expected) < 0.01
            else:
                # Odd years: only annual plan
                expected = 1000 * (1 + 0.03) ** (year - analysis.date_of_injury.year)
                assert abs(total_cost - expected) < 0.01

    def test_update_plan_recalculates_costs(self, api_client, analysis, healthcare_plan):
        # First calculate costs
        url = reverse('analysis-healthcare-plans-calculate-costs', 
                     kwargs={'analysis_pk': analysis.id})
        api_client.post(url)
        
        # Update plan base cost
        plan_url = reverse('analysis-healthcare-plans-detail', 
                          kwargs={'analysis_pk': analysis.id, 'pk': healthcare_plan.id})
        response = api_client.patch(plan_url, {'base_cost': 2000})
        assert response.status_code == status.HTTP_200_OK
        
        # Recalculate costs
        response = api_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        
        # Check that costs were updated
        costs = HealthcareCost.objects.filter(plan=healthcare_plan).order_by('year')
        first_cost = costs.first()
        assert first_cost.cost == 2000  # New base cost

    def test_invalid_date_ranges(self, api_client, analysis, healthcare_plan):
        # Set invalid date range (report date before injury date)
        analysis.date_of_report = analysis.date_of_injury - timedelta(days=1)
        analysis.save()
        
        url = reverse('analysis-healthcare-plans-calculate-costs', 
                     kwargs={'analysis_pk': analysis.id})
        response = api_client.post(url)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'date_range' in response.data

    def test_category_constraints(self, api_client, analysis, healthcare_category):
        # Add constraints to category
        healthcare_category.min_cost = 500
        healthcare_category.max_cost = 5000
        healthcare_category.save()
        
        url = reverse('analysis-healthcare-plans-list', kwargs={'analysis_pk': analysis.id})
        
        # Test cost below minimum
        data = {
            'category_id': healthcare_category.id,
            'base_cost': 400,
            'is_active': True
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'base_cost' in response.data
        
        # Test cost above maximum
        data['base_cost'] = 6000
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'base_cost' in response.data

    def test_get_healthcare_costs(self, api_client, analysis, healthcare_plan):
        # First calculate costs
        url = reverse('analysis-healthcare-plans-calculate-costs', 
                     kwargs={'analysis_pk': analysis.id})
        api_client.post(url)
        
        # Then retrieve them
        url = reverse('analysis-healthcare-plans-costs', 
                     kwargs={'analysis_pk': analysis.id, 'pk': healthcare_plan.id})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) > 0
        assert all('year' in cost and 'cost' in cost for cost in response.data)
