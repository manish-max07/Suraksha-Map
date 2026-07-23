"""
routes/hotspots.py — Read-only endpoints for crime hotspot zones.

Endpoints (all paths are canonical — trailing slashes where shown):
  GET /hotspots/  → List all crime hotspot zones (trailing slash required)

Note: redirect_slashes=False is set on the FastAPI app, so the exact path
called by the client must match the decorator — no 307 redirect fallback.
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
