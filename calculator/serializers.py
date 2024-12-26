from rest_framework import serializers
from .models import EconomicAnalysis, PreInjuryRow, PostInjuryRow, Evaluee, HealthcareCategory, HealthcarePlan, HealthcareCost
from datetime import date

class EvalueeSerializer(serializers.ModelSerializer):
    date_of_birth = serializers.DateField(format='%Y-%m-%d')
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    updated_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)

    class Meta:
        model = Evaluee
        fields = ['id', 'first_name', 'last_name', 'date_of_birth', 'notes', 'created_at', 'updated_at']

class PreInjuryRowSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreInjuryRow
        fields = ['year', 'portion_of_year', 'age', 'wage_base_years']

class PostInjuryRowSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostInjuryRow
        fields = ['year', 'portion_of_year', 'age', 'wage_base_years']

class EconomicAnalysisSerializer(serializers.ModelSerializer):
    pre_injury_rows = PreInjuryRowSerializer(many=True, required=False)
    post_injury_rows = PostInjuryRowSerializer(many=True, required=False)
    evaluee = EvalueeSerializer(read_only=True)
    age_at_injury = serializers.FloatField(read_only=True)
    current_age = serializers.FloatField(read_only=True)
    retirement_date = serializers.DateField(read_only=True)
    date_of_death = serializers.DateField(read_only=True)

    class Meta:
        model = EconomicAnalysis
        fields = [
            'id',
            'evaluee',
            'date_of_injury',
            'date_of_report',
            'worklife_expectancy',
            'years_to_final_separation',
            'life_expectancy',
            'pre_injury_base_wage',
            'post_injury_base_wage',
            'growth_rate',
            'adjustment_factor',
            'apply_discounting',
            'discount_rate',
            'pre_injury_rows',
            'post_injury_rows',
            'age_at_injury',
            'current_age',
            'retirement_date',
            'date_of_death',
            'include_pension',
            'pension_type',
            'final_average_salary',
            'years_of_service',
            'benefit_multiplier',
            'annual_contribution',
            'expected_return_rate',
            'created_at',
            'updated_at'
        ]

    def create(self, validated_data):
        pre_injury_rows_data = validated_data.pop('pre_injury_rows', [])
        post_injury_rows_data = validated_data.pop('post_injury_rows', [])
        
        try:
            # Create the analysis instance
            analysis = EconomicAnalysis.objects.create(**validated_data)
            
            injury_date = validated_data['date_of_injury']
            report_date = validated_data['date_of_report']
            worklife_expectancy = validated_data['worklife_expectancy']
            
            # Calculate ages using the evaluee object
            evaluee = validated_data['evaluee']
            age_at_injury = (injury_date - evaluee.date_of_birth).days / 365.25
            
            # Generate pre-injury rows (from injury date to report date)
            current_year = injury_date.year
            end_year = report_date.year
            
            while current_year <= end_year:
                # For first year, calculate portion of year from injury date
                if current_year == injury_date.year:
                    days_in_year = (date(current_year + 1, 1, 1) - date(current_year, 1, 1)).days
                    days_remaining = (date(current_year + 1, 1, 1) - injury_date).days
                    portion_of_year = days_remaining / days_in_year
                # For last year, calculate portion of year until report date
                elif current_year == report_date.year:
                    days_in_year = (date(current_year + 1, 1, 1) - date(current_year, 1, 1)).days
                    days_elapsed = (report_date - date(current_year, 1, 1)).days
                    portion_of_year = days_elapsed / days_in_year
                else:
                    portion_of_year = 1.0
                
                # Calculate wage base with growth
                years_from_injury = current_year - injury_date.year
                wage_base = validated_data['pre_injury_base_wage'] * (1 + validated_data['growth_rate']) ** years_from_injury
                
                PreInjuryRow.objects.create(
                    analysis=analysis,
                    year=current_year,
                    portion_of_year=portion_of_year,
                    age=age_at_injury + years_from_injury,
                    wage_base_years=wage_base
                )
                
                current_year += 1
            
            # Generate post-injury rows (from report date to retirement)
            current_year = report_date.year
            end_year = current_year + int(worklife_expectancy)
            
            while current_year <= end_year:
                # For first year, calculate portion of year from report date
                if current_year == report_date.year:
                    days_in_year = (date(current_year + 1, 1, 1) - date(current_year, 1, 1)).days
                    days_remaining = (date(current_year + 1, 1, 1) - report_date).days
                    portion_of_year = days_remaining / days_in_year
                # For last year, calculate portion until end of worklife
                elif current_year == end_year:
                    portion_of_year = worklife_expectancy % 1
                    if portion_of_year == 0:
                        portion_of_year = 1.0
                else:
                    portion_of_year = 1.0
                
                # Calculate pre and post injury wages with growth
                years_from_injury = current_year - injury_date.year
                pre_wage = validated_data['pre_injury_base_wage'] * (1 + validated_data['growth_rate']) ** years_from_injury
                post_wage = validated_data['post_injury_base_wage'] * (1 + validated_data['growth_rate']) ** years_from_injury
                
                # Wage base years represents the loss (difference between pre and post injury wages)
                wage_base = pre_wage - post_wage
                
                PostInjuryRow.objects.create(
                    analysis=analysis,
                    year=current_year,
                    portion_of_year=portion_of_year,
                    age=age_at_injury + years_from_injury,
                    wage_base_years=wage_base
                )
                
                current_year += 1

            return analysis
            
        except Exception as e:
            # If anything fails during creation, delete the analysis and re-raise
            if 'analysis' in locals():
                analysis.delete()
            raise serializers.ValidationError(f"Failed to calculate analysis: {str(e)}")

class HealthcareCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthcareCategory
        fields = ['id', 'name', 'description', 'growth_rate', 'frequency_years', 'created_at', 'updated_at']

class HealthcarePlanSerializer(serializers.ModelSerializer):
    category = HealthcareCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = HealthcarePlan
        fields = ['id', 'analysis', 'category', 'category_id', 'base_cost', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['analysis']

class HealthcareCostSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthcareCost
        fields = ['id', 'plan', 'year', 'age', 'cost', 'created_at', 'updated_at']
        read_only_fields = ['plan']
