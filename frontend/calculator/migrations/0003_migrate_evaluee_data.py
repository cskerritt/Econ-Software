from django.db import migrations

def migrate_evaluee_data(apps, schema_editor):
    EconomicAnalysis = apps.get_model('calculator', 'EconomicAnalysis')
    Evaluee = apps.get_model('calculator', 'Evaluee')
    
    # Create a dictionary to track unique evaluees
    evaluee_map = {}
    
    for analysis in EconomicAnalysis.objects.all():
        # Create a unique key for each evaluee
        key = (analysis.first_name, analysis.last_name, analysis.date_of_birth)
        
        if key not in evaluee_map:
            # Create new evaluee
            evaluee = Evaluee.objects.create(
                first_name=analysis.first_name,
                last_name=analysis.last_name,
                date_of_birth=analysis.date_of_birth
            )
            evaluee_map[key] = evaluee
        
        # Link analysis to evaluee
        analysis.evaluee = evaluee_map[key]
        analysis.save()

class Migration(migrations.Migration):

    dependencies = [
        ('calculator', '0002_add_evaluee'),
    ]

    operations = [
        migrations.RunPython(migrate_evaluee_data),
    ]
