from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class HealthcarePlan(models.Model):
    name = models.CharField(max_length=255)
    start_year = models.IntegerField()
    end_year = models.IntegerField()
    growth_rate = models.DecimalField(
        max_digits=5,
        decimal_places=3,
        validators=[MinValueValidator(-1), MaxValueValidator(1)]
    )
    discount_rate = models.DecimalField(
        max_digits=5,
        decimal_places=3,
        validators=[MinValueValidator(-1), MaxValueValidator(1)]
    )
    start_age = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.start_year}-{self.end_year})"

class HealthcareCategory(models.Model):
    plan = models.ForeignKey(HealthcarePlan, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=255)
    base_cost = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.name} - ${self.base_cost}"

class YearlyPortion(models.Model):
    plan = models.ForeignKey(HealthcarePlan, on_delete=models.CASCADE, related_name='yearly_portions')
    year = models.IntegerField()
    portion = models.DecimalField(
        max_digits=5,
        decimal_places=3,
        validators=[MinValueValidator(0), MaxValueValidator(1)]
    )

    class Meta:
        unique_together = ['plan', 'year']

    def __str__(self):
        return f"{self.year}: {self.portion * 100}%"
