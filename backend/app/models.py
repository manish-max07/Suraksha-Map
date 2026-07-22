"""
models.py — SQLAlchemy ORM models for Streetlight and CrimeHotspot tables.
"""
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, String, DateTime, Enum as SAEnum
from app.database import Base


class StreetlightStatus(str, enum.Enum):
    working = "working"
    not_working = "not_working"
    flickering = "flickering"


class RiskLevel(str, enum.Enum):
    red = "red"
    yellow = "yellow"
    green = "green"


class Streetlight(Base):
    """Represents a streetlight report submitted by a user or seeded."""
    __tablename__ = "streetlights"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(300), nullable=True)
    nearest_landmark = Column(String(300), nullable=True)
    status = Column(SAEnum(StreetlightStatus), nullable=False, default=StreetlightStatus.working)
    reported_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class CrimeHotspot(Base):
    """Represents a crime hotspot zone (seeded fake data for Delhi)."""
    __tablename__ = "crime_hotspots"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String(200), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius_meters = Column(Integer, nullable=False, default=300)
    risk_level = Column(SAEnum(RiskLevel), nullable=False, default=RiskLevel.yellow)
