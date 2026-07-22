"""
routes/streetlights.py — CRUD endpoints for streetlight reports.

Endpoints:
  POST   /streetlights          → Create a new streetlight report
  GET    /streetlights          → List all streetlights (optional ?status= filter)
  GET    /streetlights/stats    → Aggregated counts by status
  GET    /streetlights/{id}     → Get a single streetlight by ID
"""
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Streetlight, StreetlightStatus
from app.schemas import StreetlightCreate, StreetlightResponse, StreetlightStats, StatusCount

router = APIRouter(prefix="/streetlights", tags=["Streetlights"])


@router.post("/", response_model=StreetlightResponse, status_code=201)
def create_streetlight(payload: StreetlightCreate, db: Session = Depends(get_db)):
    """Submit a new streetlight status report."""
    streetlight = Streetlight(
        latitude=payload.latitude,
        longitude=payload.longitude,
        address=payload.address,
        nearest_landmark=payload.nearest_landmark,
        status=payload.status,
        reported_at=payload.reported_at or datetime.now(timezone.utc),
    )
    db.add(streetlight)
    db.commit()
    db.refresh(streetlight)
    return streetlight


@router.get("/stats", response_model=StreetlightStats)
def get_stats(db: Session = Depends(get_db)):
    """Return total count and breakdown by status."""
    rows = (
        db.query(Streetlight.status, func.count(Streetlight.id).label("count"))
        .group_by(Streetlight.status)
        .all()
    )
    total = sum(r.count for r in rows)
    by_status = [StatusCount(status=r.status.value, count=r.count) for r in rows]
    return StreetlightStats(total=total, by_status=by_status)


@router.get("/", response_model=list[StreetlightResponse])
def list_streetlights(
    status: Optional[StreetlightStatus] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
):
    """Return all streetlights, optionally filtered by status."""
    query = db.query(Streetlight)
    if status:
        query = query.filter(Streetlight.status == status)
    return query.order_by(Streetlight.reported_at.desc()).all()


@router.get("/{streetlight_id}", response_model=StreetlightResponse)
def get_streetlight(streetlight_id: int, db: Session = Depends(get_db)):
    """Return a single streetlight by ID."""
    light = db.query(Streetlight).filter(Streetlight.id == streetlight_id).first()
    if not light:
        raise HTTPException(status_code=404, detail="Streetlight not found")
    return light
