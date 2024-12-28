from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta


class EconomicAnalysis(models.Model):
    # Basic Information
    date_of_birth = models.DateField(
        default=date(1990, 1, 1), verbose_name="Date of Birth"
    )
    date_of_injury = models.DateField(default=date.today, verbose_name="Date of Injury")
    date_of_report = models.DateField(default=date.today, verbose_name="Date of Report")
    worklife_end_date = models.DateField(
        default=date(2050, 1, 1), verbose_name="Worklife End Date"
    )

    # Pre-Injury Fields
    pre_growth_rate = models.DecimalField(
        max_digits=6,
        decimal_places=4,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Pre-Injury Growth Rate (%)",
        help_text="Enter as percentage (e.g., 4.20 for 4.20%)",
        default=3.0,
    )
    pre_aif = models.DecimalField(
        max_digits=6,
        decimal_places=4,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Pre-Injury Adjustment Impact Factor (%)",
        help_text="Enter as percentage (e.g., 75.40 for 75.40%)",
        default=50.0,
    )
    pre_base_earnings = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Pre-Injury Base Earnings ($)",
        validators=[MinValueValidator(0)],
        default=50000.00,
    )

    # Post-Injury Fields
    post_growth_rate = models.DecimalField(
        max_digits=6,
        decimal_places=4,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Post-Injury Growth Rate (%)",
        help_text="Enter as percentage (e.g., 4.20 for 4.20%)",
        default=3.0,
    )
    post_aif = models.DecimalField(
        max_digits=6,
        decimal_places=4,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Post-Injury Adjustment Impact Factor (%)",
        help_text="Enter as percentage (e.g., 75.40 for 75.40%)",
        default=50.0,
    )
    post_base_earnings = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Post-Injury Base Earnings ($)",
        validators=[MinValueValidator(0)],
        default=40000.00,
    )
    post_discount_rate = models.DecimalField(
        max_digits=6,
        decimal_places=4,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Post-Injury Discount Rate (%)",
        help_text="Enter as percentage (e.g., 3.00 for 3.00%)",
        default=3.0,
    )

    # Health Insurance Fields (Optional)
    include_health_insurance = models.BooleanField(
        default=False, verbose_name="Include Health Insurance Analysis"
    )
    hi_base_premium = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Health Insurance Base Premium ($)",
        validators=[MinValueValidator(0)],
        default=0.00,
    )
    hi_growth_rate = models.DecimalField(
        max_digits=6,
        decimal_places=4,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Health Insurance Growth Rate (%)",
        help_text="Enter as percentage (e.g., 7.00 for 7.00%)",
        default=0.0,
    )
    hi_discount_rate = models.DecimalField(
        max_digits=6,
        decimal_places=4,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Health Insurance Discount Rate (%)",
        help_text="Enter as percentage (e.g., 3.00 for 3.00%)",
        default=0.0,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def calculate_age_at_date(self, target_date):
        """Calculate age at a specific date"""
        age = relativedelta(target_date, self.date_of_birth)
        return age.years + (age.days / 365.25)

    def get_pre_injury_periods(self):
        """Generate pre-injury periods from injury date to report date"""
        start_date = self.date_of_injury
        end_date = self.date_of_report

        periods = []
        current_date = start_date
        while current_date <= end_date:
            year = current_date.year

            # Calculate portion of year
            year_start = date(year, 1, 1)
            year_end = date(year, 12, 31)

            if year == start_date.year:
                days_in_period = (year_end - start_date).days + 1
                portion = days_in_period / 365.25
            elif year == end_date.year:
                days_in_period = (end_date - year_start).days + 1
                portion = days_in_period / 365.25
            else:
                portion = 1.0

            age = self.calculate_age_at_date(current_date)
            base_earnings = self.pre_base_earnings * (
                1 + self.pre_growth_rate / 100
            ) ** (year - start_date.year)

            periods.append(
                {
                    "year": year,
                    "portion_of_year": portion,
                    "age": age,
                    "wage_base_years": base_earnings,
                }
            )

            current_date = date(year + 1, 1, 1)

        return periods

    def get_post_injury_periods(self):
        """Generate post-injury periods from report date to worklife end"""
        start_date = self.date_of_report
        end_date = self.worklife_end_date

        periods = []
        current_date = start_date
        while current_date <= end_date:
            year = current_date.year

            # Calculate portion of year
            year_start = date(year, 1, 1)
            year_end = date(year, 12, 31)

            if year == start_date.year:
                days_in_period = (year_end - start_date).days + 1
                portion = days_in_period / 365.25
            elif year == end_date.year:
                days_in_period = (end_date - year_start).days + 1
                portion = days_in_period / 365.25
            else:
                portion = 1.0

            age = self.calculate_age_at_date(current_date)
            base_earnings = self.post_base_earnings * (
                1 + self.post_growth_rate / 100
            ) ** (year - start_date.year)

            # Calculate present value
            discount_factor = (1 + self.post_discount_rate / 100) ** -(
                year - start_date.year
            )
            present_value = base_earnings * portion * discount_factor

            periods.append(
                {
                    "year": year,
                    "portion_of_year": portion,
                    "age": age,
                    "wage_base_years": base_earnings,
                    "present_value": present_value,
                }
            )

            current_date = date(year + 1, 1, 1)

        return periods

    def get_health_insurance_periods(self):
        """Generate health insurance periods if included"""
        if not self.include_health_insurance:
            return None

        start_date = self.date_of_report
        end_date = self.worklife_end_date

        periods = []
        current_date = start_date
        while current_date <= end_date:
            year = current_date.year
            year_index = year - start_date.year

            # Calculate portion of year
            year_start = date(year, 1, 1)
            year_end = date(year, 12, 31)

            if year == start_date.year:
                days_in_period = (year_end - start_date).days + 1
                portion = days_in_period / 365.25
            elif year == end_date.year:
                days_in_period = (end_date - year_start).days + 1
                portion = days_in_period / 365.25
            else:
                portion = 1.0

            premium = (
                self.hi_base_premium * (1 + self.hi_growth_rate / 100) ** year_index
            )
            yearly_value = premium * Decimal(str(portion))
            discount_factor = Decimal("1.0") / (
                (1 + self.hi_discount_rate / 100) ** year_index
            )
            present_value = yearly_value * discount_factor

            periods.append(
                {
                    "year": year,
                    "portion": portion,
                    "premium": premium,
                    "yearly_value": yearly_value,
                    "present_value": present_value,
                }
            )

            current_date = date(year + 1, 1, 1)

        return periods

    class Meta:
        verbose_name_plural = "Economic Analyses"
