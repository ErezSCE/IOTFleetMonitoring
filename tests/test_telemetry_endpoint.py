import os
import json
import pytest
import httpx
import aio_pika
import asyncio
from testcontainers.rabbitmq import RabbitMqContainer

# Ensure environment variables are set before importing the app

# Additional fixtures for invalid payload tests
@pytest.fixture(scope="module", autouse=True)
def set_env():
    # Use a dummy DB DSN to avoid real DB connection
    os.environ["DB_DSN"] = "postgresql://postgres:postgres@localhost:5432/iot"
    yield

@pytest.fixture(scope="module", autouse=True)
def rabbitmq_container():
    container = RabbitMqContainer("rabbitmq:3.9-management-alpine")
    container.start()
    rabbit_url = container.get_connection_url()
    os.environ["RABBITMQ_URL"] = rabbit_url
    yield container
    container.stop()

# Additional fixtures for invalid payload tests
@pytest.fixture(scope="module")
def invalid_payload_fixtures(rabbitmq_container):
    # Ensure rabbitmq is running for app startup, but we don't use it directly here.
    yield

@pytest.fixture
def app():
    # Import after env vars are set
    from telemetry_service.app import app as fastapi_app
    return fastapi_app

@pytest.fixture
def async_client(app):
    client = httpx.AsyncClient(app=app, base_url="http://test")
    yield client
    # close client after test
    asyncio.run(client.aclose())

def test_post_telemetry_success(async_client):
    async def inner():
        payload = {"device_id": "123e4567-e89b-12d3-a456-426614174000", "payload": {"temp": 22.5}}
        response = await async_client.post("/telemetry", json=payload)
        assert response.status_code == 202
        assert response.json()["status"] == "accepted"
    asyncio.run(inner())

def test_telemetry_published(rabbitmq_container, async_client):
    async def inner():
        # Connect directly to RabbitMQ to verify message
        connection = await aio_pika.connect_robust(os.getenv("RABBITMQ_URL"))
        channel = await connection.channel()
        queue = await channel.declare_queue("telemetry", durable=True)
        # Ensure queue is empty
        await queue.purge()

        payload = {"device_id": "123e4567-e89b-12d3-a456-426614174001", "payload": {"humidity": 55}}
        response = await async_client.post("/telemetry", json=payload)
        assert response.status_code == 202

        # Retrieve the message from the queue
        incoming = await queue.get(timeout=5)
        body = incoming.body.decode()
        data = json.loads(body)
        assert data["device_id"] == "123e4567-e89b-12d3-a456-426614174001"
        assert data["payload"]["humidity"] == 55

        await connection.close()
    asyncio.run(inner())
