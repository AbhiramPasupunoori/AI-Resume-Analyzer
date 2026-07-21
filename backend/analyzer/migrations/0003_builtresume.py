from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("analyzer", "0002_analysis_result_details"),
    ]

    operations = [
        migrations.CreateModel(
            name="BuiltResume",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("full_name", models.CharField(max_length=150)),
                ("email", models.EmailField(max_length=254)),
                ("phone", models.CharField(blank=True, max_length=30)),
                ("location", models.CharField(blank=True, max_length=150)),
                ("linkedin", models.URLField(blank=True)),
                ("github", models.URLField(blank=True)),
                ("portfolio", models.URLField(blank=True)),
                ("summary", models.TextField(blank=True)),
                ("skills", models.JSONField(blank=True, default=list)),
                ("education", models.JSONField(blank=True, default=list)),
                ("experience", models.JSONField(blank=True, default=list)),
                ("projects", models.JSONField(blank=True, default=list)),
                ("certifications", models.JSONField(blank=True, default=list)),
                ("achievements", models.JSONField(blank=True, default=list)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
