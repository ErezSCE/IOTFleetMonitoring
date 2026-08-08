import os
import pytest
import pytest_asyncio
import httpx
from uuid import UUID
from datetime import datetime, timedelta
from testcontainers.postgres import PostgresContainer

# Fixtures

@pytest_asyncio.fixture(scope="module")
def postgres_container():
    container = PostgresContainer("postgres:15-alpine")
    container.start()
    # Convert to asyncpg DSN
    dsn = container.get_connection_url().replace("postgresql://", "postgresql+asyncpg://")
    os.environ["DB_DSN"] = dsn
    yield container
    container.stop()

# Import after DB env var is set
@pytest.fixture(scope="module", autouse=True)
async def setup_db(postgres_container):
    from telemetry_service.database import engine, Base
    from telemetry_service.orm_models import TelemetryORM
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Insert sample data
    async with engine.begin() as conn:
        device_id = UUID("123e4567-e89b-12d3-a456-426614174000")
        now = datetime.utcnow()
        rows = [
            {
                "device_id": device_id,
                "timestamp": now - timedelta(minutes=10),
                "payload": {"temp": 20},
            },
            {
                "device_id": device_id,
                "timestamp": now - timedelta(minutes=5),
                "payload": {"temp": 21},
            },
        ]
        for r in rows:
            await conn.execute(TelemetryORM.__table__.insert().values(**r))
    yield

@pytest_asyncio.fixture
async def async_client():
    from telemetry_service.app import app as fastapi_app
    async with httpx.AsyncClient(app=fastapi_app, base_url="http://test") as client:
        yield client

@pytest.mark.asyncio
async def test_fetch_telemetry_history(async_client):
    device_id = "123e4567-e89b-12d3-a456-426614174000"
    response = await async_client.get(f"/external/devices/{device_id}/telemetry")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    # Verify ordering by timestamp asc
    assert data[0]["payload"]["temp"] == 20
    assert data[1]["payload"]["temp"] == 21

@pytest.mark.asyncio
async def test_fetch_telemetry_with_time_range_and_pagination(async_client):
    device_id = "123e4567-e89b-12d3-a456-426614174000"
    start = (datetime.utcnow() - timedelta(minutes=7)).isoformat()
    response = await async_client.get(
        f"/telemetry/{device_id}?start={start}&limit=1&offset=0"
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["payload"]["temp"] == 21
