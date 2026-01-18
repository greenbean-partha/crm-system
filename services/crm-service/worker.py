import os, time, json, django
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")
django.setup()

from graphql_api.models import Lead

def main():
    consumer = None
    for _ in range(30):
        try:
            consumer = KafkaConsumer(
                "lead.created",
                bootstrap_servers="kafka:9092",
                value_deserializer=lambda v: json.loads(v.decode("utf-8")),
                group_id="crm-consumer",
                auto_offset_reset="earliest",
            )
            break
        except NoBrokersAvailable:
            time.sleep(1)

    if consumer is None:
        return

    for msg in consumer:
        lead_id = msg.value["lead_id"]
        time.sleep(2)
        Lead.objects.filter(id=lead_id).update(status="PROCESSED")

if __name__ == "__main__":
    main()
