# Generated by Django 5.1.4 on 2024-12-23 19:25

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("calculator", "0007_merge_20241223_1538"),
    ]

    operations = [
        migrations.AddField(
            model_name="economicanalysis",
            name="annual_contribution",
            field=models.FloatField(
                blank=True,
                help_text="Annual employer contribution to pension",
                null=True,
                validators=[django.core.validators.MinValueValidator(0.0)],
            ),
        ),
        migrations.AddField(
            model_name="economicanalysis",
            name="benefit_multiplier",
            field=models.FloatField(
                blank=True,
                help_text="Pension benefit multiplier (e.g., 0.02 for 2%)",
                null=True,
                validators=[django.core.validators.MinValueValidator(0.0)],
            ),
        ),
        migrations.AddField(
            model_name="economicanalysis",
            name="expected_return_rate",
            field=models.FloatField(
                blank=True,
                help_text="Expected rate of return on pension investments",
                null=True,
                validators=[django.core.validators.MinValueValidator(0.0)],
            ),
        ),
        migrations.AddField(
            model_name="economicanalysis",
            name="final_average_salary",
            field=models.FloatField(
                blank=True,
                help_text="Final average salary for pension calculation",
                null=True,
                validators=[django.core.validators.MinValueValidator(0.0)],
            ),
        ),
        migrations.AddField(
            model_name="economicanalysis",
            name="include_pension",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="economicanalysis",
            name="pension_type",
            field=models.CharField(
                blank=True,
                choices=[
                    ("defined_benefit", "Defined Benefit"),
                    ("defined_contribution", "Defined Contribution"),
                ],
                max_length=20,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="economicanalysis",
            name="years_of_service",
            field=models.FloatField(
                blank=True,
                help_text="Years of service at time of injury",
                null=True,
                validators=[django.core.validators.MinValueValidator(0.0)],
            ),
        ),
        migrations.AlterField(
            model_name="economicanalysis",
            name="adjustment_factor",
            field=models.FloatField(
                default=0.754,
                help_text="Adjustment factor for calculations",
                validators=[
                    django.core.validators.MinValueValidator(0.0),
                    django.core.validators.MaxValueValidator(2.0),
                ],
            ),
        ),
        migrations.AlterField(
            model_name="economicanalysis",
            name="apply_discounting",
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name="economicanalysis",
            name="discount_rate",
            field=models.FloatField(
                blank=True,
                default=0.04,
                help_text="Annual discount rate",
                null=True,
                validators=[
                    django.core.validators.MinValueValidator(0.0),
                    django.core.validators.MaxValueValidator(1.0),
                ],
            ),
        ),
        migrations.AlterField(
            model_name="economicanalysis",
            name="growth_rate",
            field=models.FloatField(
                default=0.042,
                help_text="Annual wage growth rate",
                validators=[
                    django.core.validators.MinValueValidator(0.0),
                    django.core.validators.MaxValueValidator(1.0),
                ],
            ),
        ),
    ]
