"""API router for telemetry ingestion and retrieval.

Provides endpoint to receive telemetry data from devices and endpoint to fetch telemetry history.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from .models import Telemetry
from .dependencies import publish_telemetry, get_db_session
from .orm_models import TelemetryORM
from sqlalchemy import select
import json
from uuid import UUID
from datetime import datetime
from typing import List, Optional, Dict, Any

router = APIRouter()

@router.post("/telemetry", status_code=status.HTTP_202_ACCEPTED)
async def ingest_telemetry(telemetry: Telemetry):
    """Accept telemetry payload and publish it to RabbitMQ.

    Returns 202 Accepted on success. Validation errors are handled by FastAPI automatically.
    """
    try:
        # Serialize telemetry to JSON bytes
        payload_bytes = telemetry.json().encode("utf-8")
        await publish_telemetry(payload_bytes)
    except Exception as exc:
        # Log could be added here; for now raise HTTP 500
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))
    return {"status": "accepted"}

@router.get("/telemetry/{device_id}", response_model=List[Telemetry])
async def get_telemetry_history(
    device_id: UUID,
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
    limit: int = 100,
    offset: int = 0,
    db_session = Depends(get_db_session),
):
    """Fetch telemetry history for a device using async SQLAlchemy.

    Query parameters:
    - start: ISO datetime, inclusive lower bound of timestamp.
    - end: ISO datetime, inclusive upper bound of timestamp.
    - limit: maximum number of records to return (default 100).
    - offset: number of records to skip for pagination (default 0).
    """
    # Build SQLAlchemy select statement dynamically
    stmt = select(TelemetryORM).where(TelemetryORM.device_id == device_id)
    if start:
        stmt = stmt.where(TelemetryORM.timestamp >= start)
    if end:
        stmt = stmt.where(TelemetryORM.timestamp <= end)
    stmt = stmt.order_by(TelemetryORM.timestamp.asc()).limit(limit).offset(offset)

    result = []
    async with db_session as session:
        rows = await session.execute(stmt)
        for orm_obj in rows.scalars():
            result.append({
                "device_id": orm_obj.device_id,
                "timestamp": orm_obj.timestamp,
                "payload": orm_obj.payload,
            })
    return result
