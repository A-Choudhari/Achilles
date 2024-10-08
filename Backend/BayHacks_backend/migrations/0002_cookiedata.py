# Generated by Django 5.1 on 2024-08-31 18:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('BayHacks_backend', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='CookieData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('visit_count', models.IntegerField()),
                ('cookie_num', models.IntegerField()),
                ('value', models.TextField()),
                ('date_visited', models.DateTimeField(default=None)),
                ('created_at', models.DateTimeField(auto_now=True)),
                ('sent_email', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('image', models.CharField(max_length=255)),
            ],
        ),
    ]
