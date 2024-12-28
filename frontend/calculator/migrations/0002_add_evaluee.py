from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('calculator', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Evaluee',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('date_of_birth', models.DateField()),
                ('notes', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Evaluee',
                'verbose_name_plural': 'Evaluees',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddField(
            model_name='economicanalysis',
            name='evaluee',
            field=models.ForeignKey(null=True, on_delete=models.CASCADE, related_name='analyses', to='calculator.evaluee'),
        ),
    ]
