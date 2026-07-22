"""
routes/hotspots.py — Read-only endpoints for crime hotspot zones.

Endpoints:
  GET /hotspots → List all crime hotspot zones
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import CrimeHotspot
from app.schemas import HotspotResponse

router = APIRouter(prefix="/hotspots", tags=["Crime Hotspots"])


@router.get("/", response_model=list[HotspotResponse])
def list_hotspots(db: Session = Depends(get_db)):
    """Return all seeded crime hotspot zones."""
    return db.query(CrimeHotspot).order_by(CrimeHotspot.risk_level).all()
