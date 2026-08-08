"""SQLAlchemy ORM models for Telemetry Service.

Defines the Telemetry table mapping.
"""

from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import declarative_base
import uuid
from .database import Base

class TelemetryORM(Base):
    __tablename__ = "telemetry"

    # Assuming an auto-generated primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    device_id = Column(PGUUID(as_uuid=True), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    payload = Column(JSON, nullable=False)
