"""
schemas.py — Pydantic v2 schemas for request validation and API responses.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models import StreetlightStatus, RiskLevel


# ─────────────────────────── Streetlight Schemas ───────────────────────────

class StreetlightCreate(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Latitude of the streetlight")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude of the streetlight")
    address: Optional[str] = Field(None, max_length=300)
    nearest_landmark: Optional[str] = Field(None, max_length=300)
    status: StreetlightStatus = Field(..., description="Current status of the light")
    reported_at: Optional[datetime] = Field(None, description="Auto-set to now if omitted")

    model_config = {"from_attributes": True}


class StreetlightResponse(BaseModel):
    id: int
    latitude: float
    longitude: float
    address: Optional[str]
    nearest_landmark: Optional[str]
    status: StreetlightStatus
    reported_at: Optional[datetime]

    model_config = {"from_attributes": True}


class StatusCount(BaseModel):
    status: str
    count: int


class StreetlightStats(BaseModel):
    total: int
    by_status: list[StatusCount]


# ─────────────────────────── CrimeHotspot Schemas ──────────────────────────

class HotspotResponse(BaseModel):
    id: int
    label: Optional[str]
    latitude: float
    longitude: float
    radius_meters: int
    risk_level: RiskLevel

    model_config = {"from_attributes": True}
