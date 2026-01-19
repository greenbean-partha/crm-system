from django.db import migrations


def seed_companies(apps, schema_editor):
    Company = apps.get_model("graphql_api", "Company")

    if Company.objects.exists():
        return

    parent = Company.objects.create(
        name="Parent Corp",
        parent=None,
    )

    Company.objects.create(
        name="Child India",
        parent=parent,
    )

    Company.objects.create(
        name="Child Europe",
        parent=parent,
    )


class Migration(migrations.Migration):

    dependencies = [
        ("graphql_api", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_companies),
    ]
