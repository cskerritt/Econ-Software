from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import timedelta

class Evaluee(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    class Meta:
        verbose_name = "Evaluee"
        verbose_name_plural = "Evaluees"
        ordering = ['-created_at']
        unique_together = ['first_name', 'last_name', 'date_of_birth']

class EconomicAnalysis(models.Model):
    # Link to Evaluee
    evaluee = models.ForeignKey(
        Evaluee,
        on_delete=models.CASCADE,
        related_name='analyses'
    )
    
    # Analysis Information
    date_of_injury = models.DateField()
    date_of_report = models.DateField()

    # Life and Work Parameters
    worklife_expectancy = models.FloatField(
        validators=[MinValueValidator(0.0)],
        help_text="Expected remaining years of work life"
    )
    years_to_final_separation = models.FloatField(
        validators=[MinValueValidator(0.0)],
        help_text="Years until final separation from work"
    )
    life_expectancy = models.FloatField(
        validators=[MinValueValidator(0.0)],
        help_text="Expected remaining years of life"
    )

    # Base Wages
    pre_injury_base_wage = models.FloatField(
        validators=[MinValueValidator(0.0)],
        help_text="Base annual wage at date of injury"
    )
    post_injury_base_wage = models.FloatField(
        validators=[MinValueValidator(0.0)],
        help_text="Base annual wage after injury"
    )

    # Growth and Adjustment
    growth_rate = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Annual wage growth rate",
        default=0.042  # 4.2%
    )
    adjustment_factor = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(2.0)],
        help_text="Adjustment factor for calculations",
        default=0.754  # 75.4%
    )

    # Benefits and Insurance
    benefits_rate = models.FloatField(
        validators=[MinValueValidator(0.0)],
        default=0.0,
        help_text="Benefits rate as a percentage of base wage"
    )
    health_insurance_base = models.FloatField(
        validators=[MinValueValidator(0.0)],
        default=0.0,
        help_text="Base annual health insurance cost"
    )
    pension_base = models.FloatField(
        validators=[MinValueValidator(0.0)],
        default=0.0,
        help_text="Base annual pension contribution"
    )

    # Optional Health Insurance Benefits
    include_health_insurance = models.BooleanField(default=False)
    annual_health_contribution = models.FloatField(
        validators=[MinValueValidator(0.0)],
        null=True,
        blank=True,
        help_text="Annual employer contribution to health insurance"
    )
    health_cost_inflation_rate = models.FloatField(
        validators=[MinValueValidator(0.0)],
        null=True,
        blank=True,
        help_text="Annual health insurance cost inflation rate"
    )

    # Optional Pension Benefits
    include_pension = models.BooleanField(default=False)
    pension_type = models.CharField(
        max_length=20,
        choices=[
            ('defined_benefit', 'Defined Benefit'),
            ('defined_contribution', 'Defined Contribution')
        ],
        null=True,
        blank=True
    )
    # Defined Benefit Parameters
    final_average_salary = models.FloatField(
        validators=[MinValueValidator(0.0)],
        null=True,
        blank=True,
        help_text="Final average salary for pension calculation"
    )
    years_of_service = models.FloatField(
        validators=[MinValueValidator(0.0)],
        null=True,
        blank=True,
        help_text="Years of service at time of injury"
    )
    benefit_multiplier = models.FloatField(
        validators=[MinValueValidator(0.0)],
        null=True,
        blank=True,
        help_text="Pension benefit multiplier (e.g., 0.02 for 2%)"
    )
    # Defined Contribution Parameters
    annual_contribution = models.FloatField(
        validators=[MinValueValidator(0.0)],
        null=True,
        blank=True,
        help_text="Annual employer contribution to pension"
    )
    expected_return_rate = models.FloatField(
        validators=[MinValueValidator(0.0)],
        null=True,
        blank=True,
        help_text="Expected rate of return on pension investments"
    )

    # Discounting
    apply_discounting = models.BooleanField(default=True)
    discount_rate = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        null=True,
        blank=True,
        help_text="Annual discount rate",
        default=0.04  # 4%
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def age_at_injury(self):
        return (self.date_of_injury - self.evaluee.date_of_birth).days / 365.25

    @property
    def current_age(self):
        return (self.date_of_report - self.evaluee.date_of_birth).days / 365.25

    @property
    def retirement_date(self):
        days_to_retirement = int(self.worklife_expectancy * 365.25)
        return self.date_of_injury + timedelta(days=days_to_retirement)

    @property
    def date_of_death(self):
        days_to_death = int(self.life_expectancy * 365.25)
        return self.date_of_injury + timedelta(days=days_to_death)

    @property
    def has_residual_capacity(self):
        """Return True if there is any residual earning capacity (post-injury wage > 0)"""
        return self.post_injury_base_wage > 0

    def calculate_wage_loss(self):
        """Calculate total wage loss over worklife expectancy"""
        annual_loss = self.pre_injury_base_wage - self.post_injury_base_wage
        # Using the formula for present value of growing annuity:
        # PV = PMT * (1 - (1 + g)^-n) / g
        # where g is growth rate
        if self.growth_rate == 0:
            # When growth rate is 0, use simple multiplication
            return annual_loss * self.worklife_expectancy
        else:
            growth_factor = 1 - (1 + self.growth_rate) ** -self.worklife_expectancy
            return annual_loss * growth_factor / self.growth_rate

    def __str__(self):
        return f"Analysis for {self.evaluee} ({self.date_of_injury})"

    class Meta:
        verbose_name = "Economic Analysis"
        verbose_name_plural = "Economic Analyses"
        ordering = ['-created_at']

class HealthcareCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    growth_rate = models.FloatField(
        validators=[MinValueValidator(0.0)],
        help_text="Annual growth rate for this category"
    )
    frequency_years = models.FloatField(
        validators=[MinValueValidator(0.0)],
        help_text="How often this treatment occurs (in years). Use 1 for annual, 0.5 for semi-annual, etc."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Healthcare Category"
        verbose_name_plural = "Healthcare Categories"
        ordering = ['name']

class HealthcarePlan(models.Model):
    analysis = models.ForeignKey(
        EconomicAnalysis,
        on_delete=models.CASCADE,
        related_name='healthcare_plans'
    )
    category = models.ForeignKey(
        HealthcareCategory,
        on_delete=models.CASCADE,
        related_name='plans'
    )
    base_cost = models.FloatField(
        validators=[MinValueValidator(0.0)],
        help_text="Base cost for this treatment"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this healthcare plan is included in the analysis"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def toggle(self):
        """Toggle the active status of the healthcare plan"""
        self.is_active = not self.is_active
        self.save()

    def calculate_costs(self):
        """Calculate yearly costs with growth rate applied"""
        costs = []
        current_cost = self.base_cost
        current_year = self.analysis.date_of_injury.year
        current_age = self.analysis.age_at_injury

        # Calculate costs for each year until life expectancy
        for year in range(int(self.analysis.life_expectancy)):
            # Create cost record for this year
            cost = HealthcareCost.objects.create(
                plan=self,
                year=current_year + year,
                age=current_age + year,
                cost=current_cost
            )
            costs.append(cost)
            
            # Apply growth rate for next year
            current_cost *= (1 + self.category.growth_rate)

        return costs

    def __str__(self):
        return f"{self.category.name} for {self.analysis.evaluee}"

    class Meta:
        verbose_name = "Healthcare Plan"
        verbose_name_plural = "Healthcare Plans"
        ordering = ['category__name']

class HealthcareCost(models.Model):
    plan = models.ForeignKey(
        HealthcarePlan,
        on_delete=models.CASCADE,
        related_name='costs'
    )
    year = models.IntegerField()
    age = models.FloatField()
    cost = models.FloatField(
        validators=[MinValueValidator(0.0)],
        help_text="Calculated cost for this year"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.plan.category.name} cost for year {self.year}"

    class Meta:
        verbose_name = "Healthcare Cost"
        verbose_name_plural = "Healthcare Costs"
        ordering = ['year']
        unique_together = ['plan', 'year']

class PreInjuryRow(models.Model):
    analysis = models.ForeignKey(
        EconomicAnalysis,
        on_delete=models.CASCADE,
        related_name='pre_injury_rows'
    )
    year = models.IntegerField()
    portion_of_year = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    age = models.FloatField()
    wage_base_years = models.FloatField(validators=[MinValueValidator(0.0)])

    def __str__(self):
        return f"Pre-Injury Row {self.year} - {self.analysis}"

    class Meta:
        ordering = ['year']

class PostInjuryRow(models.Model):
    analysis = models.ForeignKey(
        EconomicAnalysis,
        on_delete=models.CASCADE,
        related_name='post_injury_rows'
    )
    year = models.IntegerField()
    portion_of_year = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    age = models.FloatField()
    wage_base_years = models.FloatField(validators=[MinValueValidator(0.0)])

    def __str__(self):
        return f"Post-Injury Row {self.year} - {self.analysis}"

    class Meta:
        ordering = ['year']
