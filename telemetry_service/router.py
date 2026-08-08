"""API router for telemetry ingestion.

Provides endpoint to receive telemetry data from devices.
"""

from fastapi import APIRouter, HTTPException, status
from .models import Telemetry
from .dependencies import publish_telemetry
import json

router = APIRouter()

@router.post("/telemetry", status_code=status.HTTP_200_OK)
async def ingest_telemetry(telemetry: Telemetry):
    """Accept telemetry payload and publish it to RabbitMQ.

    Returns 202 Accepted on success. Validation errors are handled by FastAPI automatically.
    """
    try:
        # Serialize telemetry to JSON bytes
        payload_bytes = json.dumps(telemetry.dict()).encode("utf-8")
        await publish_telemetry(payload_bytes)
    except Exception as exc:
        # Log could be added here; for now raise HTTP 500
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))
    return {"status": "accepted"}
