from django.db import models
from datetime import date, timedelta

class EconomicAnalysis(models.Model):
    # Personal Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    date_of_injury = models.DateField()
    date_of_report = models.DateField()
    
    # Life Expectancy and Work Parameters
    worklife_expectancy = models.DecimalField(
        max_digits=4, 
        decimal_places=2,
        help_text="Format: 00.00 years"
    )
    years_to_final_separation = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        help_text="Years until final separation"
    )
    life_expectancy = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        help_text="Life expectancy in years"
    )
    
    # Growth Rates and Adjustment Factors
    pre_growth_rate = models.DecimalField(max_digits=5, decimal_places=4)
    pre_aif = models.DecimalField(max_digits=5, decimal_places=4)
    post_growth_rate = models.DecimalField(max_digits=5, decimal_places=4)
    post_aif = models.DecimalField(max_digits=5, decimal_places=4)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def age_at_injury(self):
        """Calculate age at date of injury"""
        return (self.date_of_injury - self.date_of_birth).days / 365.25

    @property
    def current_age(self):
        """Calculate current age"""
        return (date.today() - self.date_of_birth).days / 365.25

    @property
    def retirement_date(self):
        """Calculate retirement date based on worklife expectancy"""
        days = int(float(self.worklife_expectancy) * 365.25)
        return self.date_of_injury + timedelta(days=days)

    @property
    def date_of_death(self):
        """Calculate projected date of death based on life expectancy"""
        days = int(float(self.life_expectancy) * 365.25)
        return self.date_of_injury + timedelta(days=days)

    def __str__(self):
        return f"{self.first_name} {self.last_name} - Analysis {self.id}"

class PreInjuryRow(models.Model):
    analysis = models.ForeignKey(
        EconomicAnalysis,
        related_name='pre_injury_rows',
        on_delete=models.CASCADE
    )
    year = models.IntegerField()
    portion_of_year = models.DecimalField(max_digits=5, decimal_places=4)
    age = models.DecimalField(max_digits=5, decimal_places=2)
    wage_base_years = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        ordering = ['year']

    def __str__(self):
        return f"Pre-Injury Row {self.year} - Analysis {self.analysis.id}"

class PostInjuryRow(models.Model):
    analysis = models.ForeignKey(
        EconomicAnalysis,
        related_name='post_injury_rows',
        on_delete=models.CASCADE
    )
    year = models.IntegerField()
    portion_of_year = models.DecimalField(max_digits=5, decimal_places=4)
    age = models.DecimalField(max_digits=5, decimal_places=2)
    wage_base_years = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        ordering = ['year']

    def __str__(self):
        return f"Post-Injury Row {self.year} - Analysis {self.analysis.id}"
