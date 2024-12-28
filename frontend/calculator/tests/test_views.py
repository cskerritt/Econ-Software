import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from calculator.models import (
    Evaluee,
    EconomicAnalysis,
    HealthcareCategory,
    HealthcarePlan
)
from datetime import date

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

@pytest.mark.django_db
class TestEvalueeViews:
    def test_create_evaluee(self, api_client):
        url = reverse('evaluee-list')
        data = {
            'first_name': 'Jane',
            'last_name': 'Smith',
            'date_of_birth': '1995-01-01'
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['first_name'] == 'Jane'
        assert response.data['last_name'] == 'Smith'

    def test_create_evaluee_invalid_data(self, api_client):
        url = reverse('evaluee-list')
        data = {
            'first_name': '',  # Invalid: empty name
            'last_name': 'Smith',
            'date_of_birth': '1995-01-01'
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'first_name' in response.data

    def test_get_evaluee(self, api_client, evaluee):
        url = reverse('evaluee-detail', kwargs={'pk': evaluee.id})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['first_name'] == evaluee.first_name

    def test_get_nonexistent_evaluee(self, api_client):
        url = reverse('evaluee-detail', kwargs={'pk': 9999})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_evaluee(self, api_client, evaluee):
        url = reverse('evaluee-detail', kwargs={'pk': evaluee.id})
        data = {
            'first_name': 'John Updated',
            'last_name': evaluee.last_name,
            'date_of_birth': evaluee.date_of_birth.isoformat()
        }
        response = api_client.put(url, data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['first_name'] == 'John Updated'

    def test_delete_evaluee(self, api_client, evaluee):
        url = reverse('evaluee-detail', kwargs={'pk': evaluee.id})
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        response = api_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.django_db
class TestAnalysisViews:
    def test_create_analysis(self, api_client, evaluee):
        url = reverse('analysis-list')
        data = {
            'evaluee': evaluee.id,
            'date_of_injury': '2023-01-01',
            'date_of_report': '2023-12-01',
            'worklife_expectancy': 20.0,
            'years_to_final_separation': 20.0,
            'life_expectancy': 40.0,
            'pre_injury_base_wage': 50000,
            'post_injury_base_wage': 30000,
            'growth_rate': 0.03,
            'discount_rate': 0.02
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['evaluee'] == evaluee.id

    def test_get_analysis(self, api_client, analysis):
        url = reverse('analysis-detail', kwargs={'pk': analysis.id})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == analysis.id

    def test_get_analysis_details(self, api_client, analysis):
        url = reverse('analysis-detail', kwargs={'pk': analysis.id})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == analysis.id
        assert response.data['evaluee'] == analysis.evaluee.id

    def test_create_analysis_invalid_data(self, api_client, evaluee):
        url = reverse('analysis-list')
        data = {
            'evaluee': evaluee.id,
            'worklife_expectancy': -1,  # Invalid: negative value
            'pre_injury_base_wage': 50000
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'worklife_expectancy' in response.data

    def test_get_nonexistent_analysis(self, api_client):
        url = reverse('analysis-detail', kwargs={'pk': 9999})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_analysis(self, api_client, analysis):
        url = reverse('analysis-detail', kwargs={'pk': analysis.id})
        data = {
            'evaluee': analysis.evaluee.id,
            'date_of_injury': '2023-01-01',
            'date_of_report': '2023-12-01',
            'worklife_expectancy': 25.0,  # Updated value
            'years_to_final_separation': 20.0,
            'life_expectancy': 40.0,
            'pre_injury_base_wage': 55000,  # Updated value
            'post_injury_base_wage': 30000,
            'growth_rate': 0.03,
            'discount_rate': 0.02
        }
        response = api_client.put(url, data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['worklife_expectancy'] == 25.0
        assert response.data['pre_injury_base_wage'] == 55000

    def test_delete_analysis(self, api_client, analysis):
        url = reverse('analysis-detail', kwargs={'pk': analysis.id})
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        response = api_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_calculate_wage_loss(self, api_client, analysis):
        url = reverse('analysis-calculate-wage-loss', kwargs={'pk': analysis.id})
        response = api_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        assert 'wage_loss' in response.data
        assert response.data['wage_loss'] > 0

    def test_calculate_wage_loss_nonexistent_analysis(self, api_client):
        url = reverse('analysis-calculate-wage-loss', kwargs={'pk': 9999})
        response = api_client.post(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.django_db
class TestHealthcareViews:
    @pytest.fixture
    def healthcare_plan(self, analysis, healthcare_category):
        return HealthcarePlan.objects.create(
            analysis=analysis,
            category=healthcare_category,
            base_cost=1000,
            is_active=True
        )
    @pytest.fixture
    def healthcare_category(self):
        return HealthcareCategory.objects.create(
            name="Test Category",
            description="Test Description",
            growth_rate=0.03,
            frequency_years=1
        )

    def test_list_healthcare_categories(self, api_client, healthcare_category):
        url = reverse('healthcarecategory-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) > 0
        assert any(category['name'] == 'Test Category' for category in response.data)

    def test_get_healthcare_category(self, api_client, healthcare_category):
        url = reverse('healthcarecategory-detail', kwargs={'pk': healthcare_category.id})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == healthcare_category.name
        assert response.data['growth_rate'] == healthcare_category.growth_rate

    def test_get_nonexistent_healthcare_category(self, api_client):
        url = reverse('healthcarecategory-detail', kwargs={'pk': 9999})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_create_healthcare_category(self, api_client):
        url = reverse('healthcarecategory-list')
        data = {
            'name': 'New Category',
            'description': 'New Description',
            'growth_rate': 0.04,
            'frequency_years': 2
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'New Category'
        assert response.data['growth_rate'] == 0.04

    def test_create_healthcare_category_invalid_data(self, api_client):
        url = reverse('healthcarecategory-list')
        data = {
            'name': '',  # Invalid: empty name
            'growth_rate': -0.04,  # Invalid: negative growth rate
            'frequency_years': 2
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'name' in response.data
        assert 'growth_rate' in response.data

    def test_create_healthcare_plan_invalid_data(self, api_client, analysis, healthcare_category):
        url = reverse('analysis-healthcare-plans-list', kwargs={'analysis_pk': analysis.id})
        data = {
            'category': healthcare_category.id,
            'base_cost': -1000,  # Invalid: negative cost
            'is_active': True
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'base_cost' in response.data

    def test_create_healthcare_plan_nonexistent_analysis(self, api_client, healthcare_category):
        url = reverse('analysis-healthcare-plans-list', kwargs={'analysis_pk': 9999})
        data = {
            'category': healthcare_category.id,
            'base_cost': 1000,
            'is_active': True
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_create_healthcare_plan(self, api_client, analysis, healthcare_category):
        url = reverse('analysis-healthcare-plans-list', kwargs={'analysis_pk': analysis.id})
        data = {
            'category': healthcare_category.id,
            'base_cost': 1000,
            'is_active': True
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['base_cost'] == 1000
        assert response.data['is_active'] is True

    def test_update_healthcare_plan(self, api_client, analysis, healthcare_plan):
        url = reverse('analysis-healthcare-plans-detail', 
                     kwargs={'analysis_pk': analysis.id, 'pk': healthcare_plan.id})
        data = {
            'category': healthcare_plan.category.id,
            'base_cost': 2000,  # Updated cost
            'is_active': True
        }
        response = api_client.put(url, data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['base_cost'] == 2000

    def test_delete_healthcare_plan(self, api_client, analysis, healthcare_plan):
        url = reverse('analysis-healthcare-plans-detail', 
                     kwargs={'analysis_pk': analysis.id, 'pk': healthcare_plan.id})
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        response = api_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_toggle_healthcare_plan(self, api_client, analysis, healthcare_plan):
        url = reverse('analysis-healthcare-plans-toggle', 
                     kwargs={'analysis_pk': analysis.id, 'pk': healthcare_plan.id})
        response = api_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_active'] is False

    def test_toggle_nonexistent_healthcare_plan(self, api_client, analysis):
        url = reverse('analysis-healthcare-plans-toggle', 
                     kwargs={'analysis_pk': analysis.id, 'pk': 9999})
        response = api_client.post(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_calculate_healthcare_costs(self, api_client, analysis, healthcare_plan):
        url = reverse('analysis-healthcare-plans-calculate-costs', 
                     kwargs={'analysis_pk': analysis.id})
        response = api_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        assert 'costs' in response.data
        assert len(response.data['costs']) > 0
        assert 'year' in response.data['costs'][0]
        assert 'cost' in response.data['costs'][0]
