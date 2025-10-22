"""
SQLAlchemy データベースモデル
"""

from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import (
    Column,
    String,
    Integer,
    Text,
    DateTime,
    Date,
    DECIMAL,
    ForeignKey,
    Enum as SQLEnum,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(
        SQLEnum("worker", "manager", "admin", name="user_role"), nullable=False
    )
    license_number = Column(String(50))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    work_orders = relationship("WorkOrder", back_populates="worker")


class WorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_name = Column(String(100), nullable=False)
    customer_phone = Column(String(20))
    address = Column(Text, nullable=False)
    building_type = Column(String(50))
    model = Column(String(50), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    scheduled_date = Column(Date, nullable=False)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    status = Column(
        SQLEnum("scheduled", "in_progress", "completed", "cancelled", name="work_order_status"),
        nullable=False,
        default="scheduled",
    )
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    worker = relationship("User", back_populates="work_orders")
    work_reports = relationship("WorkReport", back_populates="work_order", cascade="all, delete-orphan")
    chat_history = relationship("ChatHistory", back_populates="work_order", cascade="all, delete-orphan")


class WorkReport(Base):
    __tablename__ = "work_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    work_order_id = Column(UUID(as_uuid=True), ForeignKey("work_orders.id", ondelete="CASCADE"))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    work_duration = Column(DECIMAL(4, 2))
    work_content = Column(Text)
    special_notes = Column(Text)
    customer_signature_url = Column(Text)
    status = Column(
        SQLEnum("draft", "submitted", "approved", name="work_report_status"),
        nullable=False,
        default="draft",
    )
    submitted_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    work_order = relationship("WorkOrder", back_populates="work_reports")
    work_photos = relationship("WorkPhoto", back_populates="work_report", cascade="all, delete-orphan")
    used_materials = relationship("UsedMaterial", back_populates="work_report", cascade="all, delete-orphan")
    work_steps = relationship("WorkStep", back_populates="work_report", cascade="all, delete-orphan")


class WorkPhoto(Base):
    __tablename__ = "work_photos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    work_report_id = Column(UUID(as_uuid=True), ForeignKey("work_reports.id", ondelete="CASCADE"))
    photo_url = Column(Text, nullable=False)
    photo_type = Column(
        SQLEnum("before", "during", "after", "trouble", name="photo_type"), nullable=False
    )
    caption = Column(Text)
    taken_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    work_report = relationship("WorkReport", back_populates="work_photos")


class UsedMaterial(Base):
    __tablename__ = "used_materials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    work_report_id = Column(UUID(as_uuid=True), ForeignKey("work_reports.id", ondelete="CASCADE"))
    material_name = Column(String(100), nullable=False)
    quantity = Column(DECIMAL(10, 2), nullable=False)
    unit = Column(String(20), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    work_report = relationship("WorkReport", back_populates="used_materials")


class WorkStep(Base):
    __tablename__ = "work_steps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    work_report_id = Column(UUID(as_uuid=True), ForeignKey("work_reports.id", ondelete="CASCADE"))
    step_name = Column(String(100), nullable=False)
    step_order = Column(Integer, nullable=False)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    status = Column(
        SQLEnum("pending", "in_progress", "completed", "skipped", name="work_step_status"),
        nullable=False,
        default="pending",
    )
    created_at = Column(DateTime, server_default=func.now())

    work_report = relationship("WorkReport", back_populates="work_steps")


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    work_order_id = Column(UUID(as_uuid=True), ForeignKey("work_orders.id", ondelete="CASCADE"))
    role = Column(SQLEnum("user", "assistant", name="chat_role"), nullable=False)
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, server_default=func.now())

    work_order = relationship("WorkOrder", back_populates="chat_history")
