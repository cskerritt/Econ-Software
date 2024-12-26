from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('calculator', '0005_remove_duplicates'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='evaluee',
            unique_together={('first_name', 'last_name', 'date_of_birth')},
        ),
    ]
