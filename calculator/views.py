from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum
from decimal import Decimal
from datetime import date
from .models import EconomicAnalysis, PreInjuryRow, PostInjuryRow
from .serializers import EconomicAnalysisSerializer

class EconomicAnalysisViewSet(viewsets.ModelViewSet):
    queryset = EconomicAnalysis.objects.all()
    serializer_class = EconomicAnalysisSerializer

    def calculate_pre_injury_totals(self, analysis, rows):
        total_future_value = Decimal('0.0')
        results = []
        
        for row in rows:
            portion = row.portion_of_year
            wage_base = row.wage_base_years
            gross = portion * wage_base
            adjusted = gross * analysis.pre_aif
            
            total_future_value += adjusted
            
            results.append({
                'year': row.year,
                'portion_of_year': float(portion * 100),  # Convert to percentage
                'age': float(row.age),
                'wage_base_years': float(wage_base),
                'gross_earnings': float(gross),
                'adjusted_earnings': float(adjusted)
            })
            
        return {
            'rows': results,
            'total_future_value': float(total_future_value)
        }

    def calculate_post_injury_totals(self, analysis, rows):
        total_future_value = Decimal('0.0')
        results = []
        
        for row in rows:
            portion = row.portion_of_year
            wage_base = row.wage_base_years
            gross = portion * wage_base
            adjusted = gross * analysis.post_aif
            
            total_future_value += adjusted
            
            results.append({
                'year': row.year,
                'portion_of_year': float(portion * 100),
                'age': float(row.age),
                'wage_base_years': float(wage_base),
                'gross_earnings': float(gross),
                'adjusted_earnings': float(adjusted)
            })
            
        return {
            'rows': results,
            'total_future_value': float(total_future_value)
        }

    @action(detail=True, methods=['get'])
    def calculate(self, request, pk=None):
        analysis = self.get_object()
        
        # Calculate pre-injury and post-injury totals
        pre_injury = self.calculate_pre_injury_totals(
            analysis,
            analysis.pre_injury_rows.all().order_by('year')
        )
        
        post_injury = self.calculate_post_injury_totals(
            analysis,
            analysis.post_injury_rows.all().order_by('year')
        )
        
        # Personal information including calculated dates and ages
        personal_info = {
            'first_name': analysis.first_name,
            'last_name': analysis.last_name,
            'date_of_birth': analysis.date_of_birth.isoformat(),
            'date_of_injury': analysis.date_of_injury.isoformat(),
            'date_of_report': analysis.date_of_report.isoformat(),
            'age_at_injury': float(analysis.age_at_injury),
            'current_age': float(analysis.current_age),
            'worklife_expectancy': float(analysis.worklife_expectancy),
            'retirement_date': analysis.retirement_date.isoformat(),
            'years_to_final_separation': float(analysis.years_to_final_separation),
            'life_expectancy': float(analysis.life_expectancy),
            'date_of_death': analysis.date_of_death.isoformat()
        }
        
        return Response({
            'exhibit1': {
                'title': 'Pre-Trial Earnings',
                'future_growth_rate': float(analysis.pre_growth_rate * 100),
                'description': f'Earnings from {analysis.date_of_injury.strftime("%B %d, %Y")} '
                             f'through {analysis.date_of_report.strftime("%B %d, %Y")}',
                'data': pre_injury
            },
            'exhibit2': {
                'title': 'Post-Trial Earnings',
                'future_growth_rate': float(analysis.post_growth_rate * 100),
                'description': f'Earnings from {analysis.date_of_report.strftime("%B %d, %Y")} '
                             f'through {analysis.retirement_date.strftime("%B %d, %Y")}',
                'data': post_injury
            },
            'personal_info': personal_info
        })
