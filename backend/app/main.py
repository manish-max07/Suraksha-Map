"""
main.py — FastAPI application entry point.

Configures:
  - CORS (allows frontend dev server)
  - OpenAPI metadata (title, description, version)
  - Registers routers: /streetlights, /hotspots
  - Auto-creates DB tables on startup
"""
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routes import streetlights, hotspots

load_dotenv()

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create all DB tables on startup (idempotent — safe to run repeatedly)."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Suraksha Map API",
    description=(
        "Backend API for the Suraksha Map module of Shield For She. "
        "Provides CRUD for streetlight reports and read access to crime hotspot zones for Delhi. "
        "Part of a standalone deployable service — connect via REST from other Shield For She modules."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ──────────────────────────────────────────────────────────
app.include_router(streetlights.router)
app.include_router(hotspots.router)


@app.get("/", tags=["Health"])
def root():
    """Health check — confirms the API is running."""
    return {"status": "ok", "service": "Suraksha Map API", "version": "1.0.0"}
