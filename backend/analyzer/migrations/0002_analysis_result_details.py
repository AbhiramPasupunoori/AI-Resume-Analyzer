from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("analyzer", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="resumeanalysis",
            name="achievement_results",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="resumeanalysis",
            name="readability_results",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
