from rest_framework import serializers
from .models import HealthcarePlan, HealthcareCategory, YearlyPortion

class HealthcareCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthcareCategory
        fields = ['id', 'name', 'base_cost']

class YearlyPortionSerializer(serializers.ModelSerializer):
    class Meta:
        model = YearlyPortion
        fields = ['id', 'year', 'portion']

class HealthcarePlanSerializer(serializers.ModelSerializer):
    categories = HealthcareCategorySerializer(many=True, required=False)
    yearly_portions = YearlyPortionSerializer(many=True, required=False)

    class Meta:
        model = HealthcarePlan
        fields = [
            'id', 'name', 'start_year', 'end_year', 'growth_rate',
            'discount_rate', 'start_age', 'categories', 'yearly_portions',
            'created_at', 'updated_at'
        ]

    def create(self, validated_data):
        categories_data = validated_data.pop('categories', [])
        yearly_portions_data = validated_data.pop('yearly_portions', [])
        
        plan = HealthcarePlan.objects.create(**validated_data)
        
        for category_data in categories_data:
            HealthcareCategory.objects.create(plan=plan, **category_data)
            
        for portion_data in yearly_portions_data:
            YearlyPortion.objects.create(plan=plan, **portion_data)
            
        return plan

    def update(self, instance, validated_data):
        categories_data = validated_data.pop('categories', [])
        yearly_portions_data = validated_data.pop('yearly_portions', [])
        
        # Update plan fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update categories
        instance.categories.all().delete()
        for category_data in categories_data:
            HealthcareCategory.objects.create(plan=instance, **category_data)
            
        # Update yearly portions
        instance.yearly_portions.all().delete()
        for portion_data in yearly_portions_data:
            YearlyPortion.objects.create(plan=instance, **portion_data)
            
        return instance
