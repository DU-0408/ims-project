from sqlalchemy import Column, String, DateTime, Float, Enum, ForeignKey, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import uuid
import enum
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class StatusEnum(str, enum.Enum):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class PriorityEnum(str, enum.Enum):
    P0 = "P0"
    P1 = "P1"
    P2 = "P2"

class WorkItem(Base):
    __tablename__ = "work_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    component_id = Column(String, nullable=False, index=True)
    status = Column(Enum(StatusEnum), default=StatusEnum.OPEN, nullable=False)
    priority = Column(Enum(PriorityEnum), nullable=False)
    signal_count = Column(Float, default=1)
    start_time = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    mttr_minutes = Column(Float, nullable=True)

class RCA(Base):
    __tablename__ = "rca_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    work_item_id = Column(UUID(as_uuid=True), ForeignKey("work_items.id"), nullable=False)
    incident_start = Column(DateTime, nullable=False)
    incident_end = Column(DateTime, nullable=False)
    root_cause_category = Column(String, nullable=False)
    fix_applied = Column(Text, nullable=False)
    prevention_steps = Column(Text, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)