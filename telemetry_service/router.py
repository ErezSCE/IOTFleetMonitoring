"""API router for telemetry ingestion.

Provides endpoint to receive telemetry data from devices.
"""

from fastapi import APIRouter, HTTPException, status
from .models import Telemetry
from .dependencies import publish_telemetry
import json

router = APIRouter()

from uuid import UUID
from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import Depends, status
from .dependencies import get_db_pool

from uuid import UUID
from datetime import datetime, timedelta
from typing import List, Dict, Any
from .dependencies import get_db_pool

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
