# Generated by Django 5.1 on 2024-09-02 03:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('BayHacks_backend', '0003_cookiedata_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='customusermodel',
            name='access_token',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='customusermodel',
            name='refresh_token',
            field=models.TextField(blank=True, null=True),
        ),
    ]
