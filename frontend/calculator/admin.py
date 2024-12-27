from django.contrib import admin
from .models import (
    Evaluee,
    EconomicAnalysis,
    PreInjuryRow,
    PostInjuryRow,
)

class EconomicAnalysisInline(admin.TabularInline):
    model = EconomicAnalysis
    extra = 0
    fields = ('date_of_injury', 'date_of_report', 'pre_injury_base_wage', 'post_injury_base_wage')
    show_change_link = True

class PreInjuryRowInline(admin.TabularInline):
    model = PreInjuryRow
    extra = 0

class PostInjuryRowInline(admin.TabularInline):
    model = PostInjuryRow
    extra = 0

@admin.register(Evaluee)
class EvalueeAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'date_of_birth', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('first_name', 'last_name')
    inlines = [EconomicAnalysisInline]
    fieldsets = (
        ('Personal Information', {
            'fields': (
                'first_name',
                'last_name',
                'date_of_birth',
                'notes',
            )
        }),
    )

@admin.register(EconomicAnalysis)
class EconomicAnalysisAdmin(admin.ModelAdmin):
    list_display = (
        'evaluee',
        'date_of_injury',
        'date_of_report',
        'pre_injury_base_wage',
        'post_injury_base_wage',
        'created_at',
    )
    list_filter = ('created_at',)
    search_fields = ('evaluee__first_name', 'evaluee__last_name')
    inlines = [
        PreInjuryRowInline,
        PostInjuryRowInline,
    ]
    fieldsets = (
        ('Evaluee Information', {
            'fields': ('evaluee',)
        }),
        ('Analysis Dates', {
            'fields': (
                'date_of_injury',
                'date_of_report',
            )
        }),
        ('Life and Work Parameters', {
            'fields': (
                'worklife_expectancy',
                'years_to_final_separation',
                'life_expectancy',
            )
        }),
        ('Wage Information', {
            'fields': (
                'pre_injury_base_wage',
                'post_injury_base_wage',
            )
        }),
        ('Growth and Adjustment', {
            'fields': (
                'growth_rate',
                'adjustment_factor',
            )
        }),
        ('Discounting', {
            'fields': (
                'apply_discounting',
                'discount_rate',
            )
        }),
    )

@admin.register(PreInjuryRow)
class PreInjuryRowAdmin(admin.ModelAdmin):
    list_display = ('analysis', 'year', 'portion_of_year', 'age', 'wage_base_years')
    list_filter = ('year', 'analysis')
    search_fields = ('analysis__evaluee__first_name', 'analysis__evaluee__last_name', 'year')

@admin.register(PostInjuryRow)
class PostInjuryRowAdmin(admin.ModelAdmin):
    list_display = ('analysis', 'year', 'portion_of_year', 'age', 'wage_base_years')
    list_filter = ('year', 'analysis')
    search_fields = ('analysis__evaluee__first_name', 'analysis__evaluee__last_name', 'year')
