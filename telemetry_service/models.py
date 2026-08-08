from pydantic import BaseModel, Field, validator
import uuid
from datetime import datetime
from typing import Any, Dict

class Telemetry(BaseModel):
    device_id: uuid.UUID = Field(..., description="Identifier of the device sending telemetry")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Timestamp of the telemetry reading")
    payload: Dict[str, Any] = Field(..., description="Arbitrary telemetry payload")

    @validator('payload')
    def payload_must_be_non_empty(cls, v):
        if not isinstance(v, dict) or len(v) == 0:
            raise ValueError('payload must be a non‑empty dictionary')
        return v

    @validator('timestamp')
    def timestamp_not_in_future(cls, v):
        if v > datetime.utcnow():
            raise ValueError('timestamp cannot be in the future')
        return v
