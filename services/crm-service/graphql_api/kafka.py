import json
from kafka import KafkaProducer

_producer = None

def get_producer():
    global _producer
    if _producer is None:
        _producer = KafkaProducer(
            bootstrap_servers="kafka:9092",
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
        )
    return _producer

def publish_lead_created(payload: dict):
    producer = get_producer()
    producer.send("lead.created", payload)
    producer.flush()
