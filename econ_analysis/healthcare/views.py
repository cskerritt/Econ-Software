from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from decimal import Decimal
from .models import HealthcarePlan, HealthcareCategory, YearlyPortion
from .serializers import HealthcarePlanSerializer, HealthcareCategorySerializer, YearlyPortionSerializer

# Create your views here.

class HealthcarePlanViewSet(viewsets.ModelViewSet):
    queryset = HealthcarePlan.objects.all()
    serializer_class = HealthcarePlanSerializer

    @action(detail=True, methods=['post'])
    def calculate(self, request, pk=None):
        plan = self.get_object()
        results = []
        
        for year in range(plan.start_year, plan.end_year + 1):
            year_offset = year - plan.start_year
            age = Decimal(str(plan.start_age)) + year_offset
            
            # Get portion for this year, default to 1.0 if not specified
            try:
                portion = plan.yearly_portions.get(year=year).portion
            except YearlyPortion.DoesNotExist:
                portion = Decimal('1.0')
            
            # Calculate costs for each category
            year_categories = {}
            total_cost = Decimal('0.0')
            
            for category in plan.categories.all():
                # Calculate grown cost: base_cost * (1 + growth_rate)^year_offset
                growth_factor = (1 + plan.growth_rate) ** year_offset
                grown_cost = category.base_cost * growth_factor
                yearly_cost = grown_cost * portion
                
                year_categories[category.name] = float(yearly_cost)
                total_cost += yearly_cost
            
            # Calculate present value using discount rate
            if plan.discount_rate != 0:
                discount_factor = Decimal('1.0') / ((1 + plan.discount_rate) ** year_offset)
            else:
                discount_factor = Decimal('1.0')
                
            present_value = total_cost * discount_factor
            
            results.append({
                'year': year,
                'age': float(age),
                'portion_of_year': float(portion),
                'categories': year_categories,
                'total_cost': float(total_cost),
                'present_value': float(present_value)
            })
        
        # Calculate summary values
        total_future_value = sum(row['total_cost'] for row in results)
        total_present_value = sum(row['present_value'] for row in results)
        
        return Response({
            'yearly_results': results,
            'summary': {
                'total_future_value': total_future_value,
                'total_present_value': total_present_value
            }
        })
