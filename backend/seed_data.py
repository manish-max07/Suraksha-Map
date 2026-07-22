"""
seed_data.py — Populates the SQLite DB with realistic fake data for Delhi.

Run from the /backend directory:
    python seed_data.py

Data:
  - 50 streetlight points across Connaught Place, Karol Bagh, Dwarka, Saket, Lajpat Nagar
  - 10 crime hotspot zones with mixed risk levels
"""
import sys
import os

# Ensure app package is importable when running from /backend
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timezone, timedelta
import random

from app.database import engine, SessionLocal, Base
from app.models import Streetlight, CrimeHotspot, StreetlightStatus, RiskLevel

# ── Create tables if they don't exist ────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── Seed Data Definitions ─────────────────────────────────────────────────────

STREETLIGHT_DATA = [
    # ── Connaught Place (10 points) ──────────────────────────────────────────
    (28.6328, 77.2197, "Connaught Place, Block A", "Janpath Metro Station", "working"),
    (28.6315, 77.2185, "Connaught Place, Block B", "Palika Bazaar", "flickering"),
    (28.6340, 77.2210, "Connaught Place, Outer Circle", "Rivoli Cinema", "working"),
    (28.6300, 77.2170, "Connaught Place, Inner Circle", "Central Park", "not_working"),
    (28.6355, 77.2195, "Connaught Place, N Block", "Hanuman Mandir", "working"),
    (28.6320, 77.2230, "Barakhamba Road", "Barakhamba Metro", "flickering"),
    (28.6345, 77.2240, "Sansad Marg", "Parliament Street", "working"),
    (28.6295, 77.2155, "Baba Kharak Singh Marg", "Shivaji Stadium", "not_working"),
    (28.6310, 77.2215, "Radial Road 5, CP", "Regal Cinema", "working"),
    (28.6365, 77.2178, "Patel Chowk area", "Patel Chowk Metro", "flickering"),

    # ── Karol Bagh (10 points) ───────────────────────────────────────────────
    (28.6519, 77.1909, "Ajmal Khan Road, Karol Bagh", "Karol Bagh Metro", "working"),
    (28.6530, 77.1925, "Gaffar Market, Karol Bagh", "Gaffar Market", "not_working"),
    (28.6505, 77.1895, "Arya Samaj Road", "Arya Samaj Mandir", "flickering"),
    (28.6545, 77.1940, "Dev Nagar, Karol Bagh", "Dev Nagar Chowk", "working"),
    (28.6510, 77.1870, "Pusa Road, Karol Bagh", "Shadipur Metro", "not_working"),
    (28.6525, 77.1950, "Rameshwar Nagar", "Mother Dairy Karol Bagh", "working"),
    (28.6490, 77.1915, "Jhandewalan area", "Jhandewalan Metro", "flickering"),
    (28.6560, 77.1900, "Inderpuri, Karol Bagh", "Inderpuri Market", "not_working"),
    (28.6535, 77.1880, "Baljit Nagar", "Baljit Nagar Park", "working"),
    (28.6515, 77.1935, "Rajinder Nagar", "Rajinder Nagar Market", "flickering"),

    # ── Dwarka Sector 12-14 (10 points) ─────────────────────────────────────
    (28.5940, 77.0460, "Dwarka Sector 12, Main Road", "Dwarka Sec 12 Metro", "not_working"),
    (28.5920, 77.0445, "Dwarka Sector 12, Pocket 1", "Dwarka Sector 12 Park", "not_working"),
    (28.5900, 77.0480, "Dwarka Sector 13", "Sector 13 Market", "flickering"),
    (28.5870, 77.0495, "Dwarka Sector 13, Main Market", "Dwarka Sec 13 Metro", "working"),
    (28.5850, 77.0510, "Dwarka Sector 14", "Sector 14 DDA Flats", "not_working"),
    (28.5835, 77.0525, "Dwarka Sector 14, Block C", "Sector 14 Chowk", "not_working"),
    (28.5960, 77.0440, "Dwarka Sector 11, near 12 border", "Sector 11 Metro", "working"),
    (28.5910, 77.0465, "Dwarka Expressway Service Road", "BSES Office Dwarka", "flickering"),
    (28.5880, 77.0500, "Dwarka Sector 13, Outer Ring", "Pocket B Sector 13", "working"),
    (28.5855, 77.0515, "Dwarka Sector 14, Phase 1", "St. Francis School Dwarka", "not_working"),

    # ── Saket (10 points) ────────────────────────────────────────────────────
    (28.5244, 77.2080, "Saket, Press Enclave Road", "Select Citywalk Mall", "working"),
    (28.5230, 77.2065, "Saket, Westend Marg", "Saket Metro", "working"),
    (28.5260, 77.2095, "Malviya Nagar, near Saket", "Malviya Nagar Metro", "working"),
    (28.5220, 77.2050, "Saket Pocket 1", "DDA Sports Complex Saket", "flickering"),
    (28.5275, 77.2110, "Mehrauli-Badarpur Road, Saket", "Amar Colony Market", "working"),
    (28.5235, 77.2075, "Saket Block D", "Max Hospital Saket", "working"),
    (28.5255, 77.2085, "Saket Block E", "South Extension nearby", "flickering"),
    (28.5210, 77.2040, "Sheikh Sarai Phase 1", "Sheikh Sarai Metro", "not_working"),
    (28.5265, 77.2100, "Saket PVR Priya area", "PVR Priya Cinema", "working"),
    (28.5245, 77.2070, "Saket Block A", "Fortis Hospital Saket", "working"),

    # ── Lajpat Nagar (10 points) ─────────────────────────────────────────────
    (28.5686, 77.2432, "Lajpat Nagar Central Market", "Lajpat Nagar Metro", "working"),
    (28.5700, 77.2445, "Lajpat Nagar II", "Moolchand Metro nearby", "flickering"),
    (28.5670, 77.2420, "Lajpat Nagar III", "Zamrudpur Chowk", "not_working"),
    (28.5715, 77.2460, "Lajpat Nagar IV", "Andrews Ganj nearby", "working"),
    (28.5680, 77.2410, "Ring Road, Lajpat Nagar", "Defence Colony flyover", "flickering"),
    (28.5695, 77.2450, "Lajpat Nagar I", "AIIMS nearby Lajpat side", "working"),
    (28.5660, 77.2435, "Jangpura Extension", "Jangpura Metro", "not_working"),
    (28.5725, 77.2470, "Andrews Ganj, near Lajpat", "Khan Market nearby", "working"),
    (28.5705, 77.2455, "Nizamuddin West", "Nizamuddin Railway Station", "flickering"),
    (28.5675, 77.2425, "South Extension Part II", "South Ex Part 2 Market", "working"),
]

HOTSPOT_DATA = [
    # (label, lat, lng, radius_meters, risk_level)
    ("ISBT Kashmere Gate", 28.6680, 77.2272, 400, "red"),
    ("Paharganj Main Bazaar", 28.6448, 77.2167, 350, "red"),
    ("Nehru Place Market", 28.5497, 77.2513, 350, "red"),
    ("Sadar Bazaar", 28.6575, 77.1921, 300, "yellow"),
    ("Lajpat Nagar Market", 28.5677, 77.2432, 250, "yellow"),
    ("Karol Bagh Market", 28.6519, 77.1909, 300, "yellow"),
    ("Shahdara Chowk", 28.6729, 77.2898, 400, "yellow"),
    ("Dwarka Sector 10", 28.5733, 77.0599, 400, "green"),
    ("Rohini Sector 3", 28.7357, 77.1246, 300, "green"),
    ("Vasant Kunj Area", 28.5207, 77.1559, 350, "green"),
]

STATUS_MAP = {
    "working": StreetlightStatus.working,
    "not_working": StreetlightStatus.not_working,
    "flickering": StreetlightStatus.flickering,
}
RISK_MAP = {
    "red": RiskLevel.red,
    "yellow": RiskLevel.yellow,
    "green": RiskLevel.green,
}


def seed():
    db = SessionLocal()
    try:
        # ── Clear existing seed data ─────────────────────────────────────────
        existing_lights = db.query(Streetlight).count()
        existing_hotspots = db.query(CrimeHotspot).count()

        if existing_lights > 0 or existing_hotspots > 0:
            print(f"ℹ️  Found existing data ({existing_lights} streetlights, {existing_hotspots} hotspots).")
            confirm = input("Clear and re-seed? [y/N]: ").strip().lower()
            if confirm != "y":
                print("⚠️  Seed aborted. Existing data preserved.")
                return
            db.query(Streetlight).delete()
            db.query(CrimeHotspot).delete()
            db.commit()
            print("🗑️  Cleared existing data.")

        # ── Seed Streetlights ────────────────────────────────────────────────
        now = datetime.now(timezone.utc)
        lights = []
        for i, (lat, lng, address, landmark, status) in enumerate(STREETLIGHT_DATA):
            # Stagger reported_at across the last 30 days for realism
            reported = now - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
            lights.append(Streetlight(
                latitude=lat,
                longitude=lng,
                address=address,
                nearest_landmark=landmark,
                status=STATUS_MAP[status],
                reported_at=reported,
            ))

        db.bulk_save_objects(lights)
        print(f"✅  Inserted {len(lights)} streetlight records.")

        # ── Seed Crime Hotspots ──────────────────────────────────────────────
        hotspots = []
        for label, lat, lng, radius, risk in HOTSPOT_DATA:
            hotspots.append(CrimeHotspot(
                label=label,
                latitude=lat,
                longitude=lng,
                radius_meters=radius,
                risk_level=RISK_MAP[risk],
            ))

        db.bulk_save_objects(hotspots)
        print(f"✅  Inserted {len(hotspots)} crime hotspot zones.")

        db.commit()
        print("\n🎉  Database seeded successfully!")
        print("    Run: uvicorn app.main:app --reload")
        print("    API docs at: http://localhost:8000/docs\n")

    except Exception as e:
        db.rollback()
        print(f"❌  Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
