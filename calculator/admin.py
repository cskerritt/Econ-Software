from django.contrib import admin
from .models import (
    EconomicAnalysis,
    PreInjuryRow,
    PostInjuryRow,
)

class PreInjuryRowInline(admin.TabularInline):
    model = PreInjuryRow
    extra = 0

class PostInjuryRowInline(admin.TabularInline):
    model = PostInjuryRow
    extra = 0

@admin.register(EconomicAnalysis)
class EconomicAnalysisAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'first_name',
        'last_name',
        'date_of_injury',
        'date_of_report',
        'created_at',
    )
    list_filter = ('created_at',)
    search_fields = ('first_name', 'last_name')
    inlines = [
        PreInjuryRowInline,
        PostInjuryRowInline,
    ]
    fieldsets = (
        ('Personal Information', {
            'fields': (
                'first_name',
                'last_name',
                'date_of_birth',
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
        ('Pre-Injury Parameters', {
            'fields': ('pre_growth_rate', 'pre_aif')
        }),
        ('Post-Injury Parameters', {
            'fields': ('post_growth_rate', 'post_aif')
        }),
    )

# Optional: Register individual row models if you want to manage them separately
@admin.register(PreInjuryRow)
class PreInjuryRowAdmin(admin.ModelAdmin):
    list_display = ('analysis', 'year', 'portion_of_year', 'age', 'wage_base_years')
    list_filter = ('year', 'analysis')
    search_fields = ('analysis__first_name', 'analysis__last_name', 'year')

@admin.register(PostInjuryRow)
class PostInjuryRowAdmin(admin.ModelAdmin):
    list_display = ('analysis', 'year', 'portion_of_year', 'age', 'wage_base_years')
    list_filter = ('year', 'analysis')
    search_fields = ('analysis__first_name', 'analysis__last_name', 'year')
