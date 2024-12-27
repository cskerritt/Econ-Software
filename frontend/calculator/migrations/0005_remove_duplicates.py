from django.db import migrations

def remove_duplicates(apps, schema_editor):
    Evaluee = apps.get_model('calculator', 'Evaluee')
    seen = set()
    for evaluee in Evaluee.objects.all():
        key = (evaluee.first_name, evaluee.last_name, evaluee.date_of_birth)
        if key in seen:
            evaluee.delete()
        else:
            seen.add(key)

class Migration(migrations.Migration):
    dependencies = [
        ('calculator', '0004_cleanup_economic_analysis'),
    ]

    operations = [
        migrations.RunPython(remove_duplicates),
    ]
