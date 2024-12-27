from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('calculator', '0003_migrate_evaluee_data'),
    ]

    operations = [
        migrations.AlterField(
            model_name='economicanalysis',
            name='evaluee',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='analyses', to='calculator.evaluee'),
        ),
        migrations.RemoveField(
            model_name='economicanalysis',
            name='first_name',
        ),
        migrations.RemoveField(
            model_name='economicanalysis',
            name='last_name',
        ),
        migrations.RemoveField(
            model_name='economicanalysis',
            name='date_of_birth',
        ),
    ]
