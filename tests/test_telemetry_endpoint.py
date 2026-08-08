import os
import json
import pytest
import httpx
from testcontainers.rabbitmq import RabbitMqContainer
from fastapi.testclient import TestClient

# Set environment variables before importing the app
@pytest.fixture(scope="module", autouse=True)
def set_env():
    os.environ["DB_DSN"] = "postgresql://postgres:postgres@localhost:5432/iot"
    yield

@pytest.fixture(scope="module")
def rabbitmq_container():
    container = RabbitMqContainer("rabbitmq:3.9-management-alpine")
    container.start()
    os.environ["RABBITMQ_URL"] = container.get_connection_url()
    yield container
    container.stop()

@pytest.fixture(scope="module")
def client(rabbitmq_container):
    # Import after env vars are set
    from telemetry_service.app import app as fastapi_app
    return TestClient(fastapi_app)

def test_post_telemetry_success(client):
    payload = {"device_id": "123e4567-e89b-12d3-a456-426614174000", "payload": {"temp": 22.5}}
    response = client.post("/telemetry", json=payload)
    assert response.status_code == 202
    assert response.json()["status"] == "accepted"

def test_telemetry_published(rabbitmq_container, client):
    # Connect directly to RabbitMQ using aio-pika in a blocking way via asyncio.run
    import asyncio, aio_pika
    async def get_message():
        connection = await aio_pika.connect_robust(os.getenv("RABBITMQ_URL"))
        channel = await connection.channel()
        queue = await channel.declare_queue("telemetry", durable=True)
        await queue.purge()
        payload = {"device_id": "123e4567-e89b-12d3-a456-426614174001", "payload": {"humidity": 55}}
        resp = client.post("/telemetry", json=payload)
        assert resp.status_code == 202
        incoming = await queue.get(timeout=5)
        body = incoming.body.decode()
        data = json.loads(body)
        await connection.close()
        return data
    data = asyncio.run(get_message())
    assert data["device_id"] == "123e4567-e89b-12d3-a456-426614174001"
    assert data["payload"]["humidity"] == 55
