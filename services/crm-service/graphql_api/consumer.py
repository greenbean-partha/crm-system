import os, time, json, django
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")
django.setup()

from .models import Lead

def run():
    consumer = None

    # retry loop until Kafka is ready
    for _ in range(20):
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
        return  # fail silently instead of crashing container

    for msg in consumer:
        lead_id = msg.value["lead_id"]
        time.sleep(2)
        Lead.objects.filter(id=lead_id).update(status="PROCESSED")
