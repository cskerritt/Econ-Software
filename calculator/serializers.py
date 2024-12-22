from rest_framework import serializers
from .models import EconomicAnalysis, PreInjuryRow, PostInjuryRow
from datetime import date

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
    age_at_injury = serializers.FloatField(read_only=True)
    current_age = serializers.FloatField(read_only=True)
    retirement_date = serializers.DateField(read_only=True)
    date_of_death = serializers.DateField(read_only=True)

    class Meta:
        model = EconomicAnalysis
        fields = [
            'id',
            'first_name',
            'last_name',
            'date_of_birth',
            'date_of_injury',
            'date_of_report',
            'worklife_expectancy',
            'years_to_final_separation',
            'life_expectancy',
            'pre_growth_rate',
            'pre_aif',
            'post_growth_rate',
            'post_aif',
            'pre_injury_rows',
            'post_injury_rows',
            'age_at_injury',
            'current_age',
            'retirement_date',
            'date_of_death',
        ]

    def create(self, validated_data):
        pre_injury_rows = validated_data.pop('pre_injury_rows', [])
        post_injury_rows = validated_data.pop('post_injury_rows', [])
        
        analysis = EconomicAnalysis.objects.create(**validated_data)
        
        # Calculate base wage (we'll use a default if none provided)
        base_wage = (
            pre_injury_rows[0]['wage_base_years'] 
            if pre_injury_rows 
            else 50000.00  # Default base wage
        )
        
        # Pre-injury rows: from injury to report
        injury_year = analysis.date_of_injury.year
        report_year = analysis.date_of_report.year
        
        # First year (injury year)
        days_in_first_year = min(
            date(injury_year, 12, 31),
            analysis.date_of_report
        ) - analysis.date_of_injury
        portion_first_year = days_in_first_year.days / 365.25
        
        PreInjuryRow.objects.create(
            analysis=analysis,
            year=injury_year,
            portion_of_year=portion_first_year,
            age=analysis.age_at_injury,
            wage_base_years=base_wage
        )
        
        # Middle years (if any)
        for year in range(injury_year + 1, report_year):
            PreInjuryRow.objects.create(
                analysis=analysis,
                year=year,
                portion_of_year=1.0,
                age=analysis.age_at_injury + (year - injury_year),
                wage_base_years=base_wage * (1 + float(analysis.pre_growth_rate)) ** (year - injury_year)
            )
        
        # Last year (report year, if different from injury year)
        if report_year > injury_year:
            days_in_last_year = analysis.date_of_report - date(report_year, 1, 1)
            portion_last_year = days_in_last_year.days / 365.25
            
            PreInjuryRow.objects.create(
                analysis=analysis,
                year=report_year,
                portion_of_year=portion_last_year,
                age=analysis.age_at_injury + (report_year - injury_year),
                wage_base_years=base_wage * (1 + float(analysis.pre_growth_rate)) ** (report_year - injury_year)
            )

        # Post-injury rows: from report to retirement
        retirement_year = analysis.retirement_date.year
        post_base_wage = (
            post_injury_rows[0]['wage_base_years']
            if post_injury_rows
            else base_wage * 0.6  # Default: 60% of pre-injury wage
        )
        
        # First year after report
        if retirement_year > report_year:
            days_in_first_post = min(
                date(report_year + 1, 12, 31),
                analysis.retirement_date
            ) - analysis.date_of_report
            portion_first_post = days_in_first_post.days / 365.25
            
            PostInjuryRow.objects.create(
                analysis=analysis,
                year=report_year + 1,
                portion_of_year=portion_first_post,
                age=analysis.age_at_injury + ((report_year + 1) - injury_year),
                wage_base_years=post_base_wage * (1 + float(analysis.post_growth_rate))
            )
            
            # Middle years
            for year in range(report_year + 2, retirement_year):
                PostInjuryRow.objects.create(
                    analysis=analysis,
                    year=year,
                    portion_of_year=1.0,
                    age=analysis.age_at_injury + (year - injury_year),
                    wage_base_years=post_base_wage * (1 + float(analysis.post_growth_rate)) ** (year - report_year)
                )
            
            # Last year (retirement year)
            if retirement_year > report_year + 1:
                days_in_last_year = analysis.retirement_date - date(retirement_year, 1, 1)
                portion_last_year = days_in_last_year.days / 365.25
                
                PostInjuryRow.objects.create(
                    analysis=analysis,
                    year=retirement_year,
                    portion_of_year=portion_last_year,
                    age=analysis.age_at_injury + (retirement_year - injury_year),
                    wage_base_years=post_base_wage * (1 + float(analysis.post_growth_rate)) ** (retirement_year - report_year)
                )
        
        return analysis
