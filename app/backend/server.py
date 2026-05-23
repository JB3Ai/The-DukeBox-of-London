import os
import uuid
import secrets
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import Optional

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")

PHASES = [
    {
        "code": 1,
        "name": "PEAK-BASS",
        "vibe": "Peak Hour & Heavy Bass",
        "color": "#EA00F2",
        "bg": "#0A0A0F",
        "bpm_range": [140, 180],
        "description": "Warehouse techno at peak intensity. Neurofunk, hard techno, dubstep, jungle."
    },
    {
        "code": 2,
        "name": "MAIN-FLOOR",
        "vibe": "Groove & Flow",
        "color": "#00E6F2",
        "bg": "#0A0A0F",
        "bpm_range": [120, 140],
        "description": "Deep house, tech house, UK garage, melodic techno. The steady groove."
    },
    {
        "code": 3,
        "name": "SUNRISE",
        "vibe": "The Transition",
        "color": "#A7C7E7",
        "bg": "#0F0F1A",
        "bpm_range": [100, 128],
        "description": "Organic house, balearic beat, breakbeat, future garage. Dawn is breaking."
    },
    {
        "code": 4,
        "name": "ZONED-OUT",
        "vibe": "Chilled After-Party",
        "color": "#E9967A",
        "bg": "#1A1610",
        "bpm_range": [60, 100],
        "description": "Trip-hop, downtempo, ambient dub, lo-fi. The contemplative after-hours."
    }
]

GENRES = [
    {"code": "B-01", "name": "Peak Hour Techno", "phase": 1, "bpm": [145, 160]},
    {"code": "B-02", "name": "Neurofunk", "phase": 1, "bpm": [170, 180]},
    {"code": "B-03", "name": "Hard Techno", "phase": 1, "bpm": [150, 165]},
    {"code": "B-04", "name": "Bass House", "phase": 1, "bpm": [125, 135]},
    {"code": "B-05", "name": "Dubstep (Riddim)", "phase": 1, "bpm": [140, 150]},
    {"code": "B-06", "name": "Dubstep (OG)", "phase": 1, "bpm": [138, 142]},
    {"code": "B-07", "name": "Brostep", "phase": 1, "bpm": [140, 150]},
    {"code": "B-08", "name": "Jungle", "phase": 1, "bpm": [160, 180]},
    {"code": "B-09", "name": "Drumstep", "phase": 1, "bpm": [165, 175]},
    {"code": "B-10", "name": "Acid Techno", "phase": 1, "bpm": [140, 155]},
    {"code": "B-11", "name": "Psytrance", "phase": 1, "bpm": [138, 150]},
    {"code": "B-12", "name": "Ghetto House / Juke", "phase": 1, "bpm": [155, 165]},
    {"code": "B-13", "name": "Hardstyle", "phase": 1, "bpm": [150, 160]},
    {"code": "H-13", "name": "Deep House", "phase": 2, "bpm": [120, 125]},
    {"code": "H-14", "name": "Tech House", "phase": 2, "bpm": [124, 130]},
    {"code": "M-15", "name": "Minimal Techno", "phase": 2, "bpm": [128, 135]},
    {"code": "M-16", "name": "Melodic Techno", "phase": 2, "bpm": [122, 132]},
    {"code": "G-17", "name": "UK Garage (2-Step)", "phase": 2, "bpm": [130, 140]},
    {"code": "G-18", "name": "Bassline", "phase": 2, "bpm": [130, 140]},
    {"code": "H-19", "name": "Progressive House", "phase": 2, "bpm": [126, 132]},
    {"code": "H-20", "name": "Afro House", "phase": 2, "bpm": [120, 128]},
    {"code": "H-21", "name": "Amapiano", "phase": 2, "bpm": [110, 120]},
    {"code": "H-22", "name": "Jackin' House", "phase": 2, "bpm": [124, 130]},
    {"code": "D-23", "name": "Nu-Disco", "phase": 2, "bpm": [118, 126]},
    {"code": "D-24", "name": "Italo Disco", "phase": 2, "bpm": [118, 125]},
    {"code": "D-25", "name": "Liquid D&B", "phase": 2, "bpm": [170, 178]},
    {"code": "O-26", "name": "Organic House", "phase": 3, "bpm": [118, 124]},
    {"code": "O-27", "name": "Microhouse", "phase": 3, "bpm": [120, 130]},
    {"code": "O-28", "name": "Balearic Beat", "phase": 3, "bpm": [100, 118]},
    {"code": "O-29", "name": "Breakbeat", "phase": 3, "bpm": [120, 140]},
    {"code": "O-30", "name": "French House", "phase": 3, "bpm": [120, 128]},
    {"code": "O-31", "name": "Electro (Detroit)", "phase": 3, "bpm": [125, 135]},
    {"code": "O-32", "name": "Future Garage", "phase": 3, "bpm": [130, 140]},
    {"code": "O-33", "name": "Leftfield House", "phase": 3, "bpm": [118, 128]},
    {"code": "O-34", "name": "Dub Techno", "phase": 3, "bpm": [120, 130]},
    {"code": "L-35", "name": "Lo-Fi House", "phase": 3, "bpm": [115, 125]},
    {"code": "A-36", "name": "Trip-Hop", "phase": 4, "bpm": [70, 100]},
    {"code": "A-37", "name": "Downtempo", "phase": 4, "bpm": [80, 110]},
    {"code": "A-38", "name": "Lo-Fi Hip Hop", "phase": 4, "bpm": [70, 90]},
    {"code": "A-39", "name": "Ambient Dub", "phase": 4, "bpm": [60, 90]},
    {"code": "A-40", "name": "Chillwave", "phase": 4, "bpm": [80, 110]},
    {"code": "A-41", "name": "Vaporwave", "phase": 4, "bpm": [60, 100]},
    {"code": "A-42", "name": "Psybient", "phase": 4, "bpm": [80, 120]},
    {"code": "A-43", "name": "IDM", "phase": 4, "bpm": [100, 140]},
    {"code": "A-44", "name": "Folktronica", "phase": 4, "bpm": [80, 120]},
    {"code": "A-45", "name": "Glitch-Hop", "phase": 4, "bpm": [90, 110]},
    {"code": "A-46", "name": "Ethereal Wave", "phase": 4, "bpm": [80, 120]},
    {"code": "A-47", "name": "Dark Ambient", "phase": 4, "bpm": [60, 80]},
    {"code": "A-48", "name": "Illbient", "phase": 4, "bpm": [60, 90]},
    {"code": "A-49", "name": "Space Music", "phase": 4, "bpm": [60, 80]},
    {"code": "A-50", "name": "Post-Classical", "phase": 4, "bpm": [60, 90]},
]

ARTIST_SEEDS = [
    {"id": "architect", "name": "The Architect", "artists": "Anyma / Charlotte de Witte", "phase": "P1-P2", "aesthetic": "Obsidian & Chrome", "signature": "Cinematic sub-bass architecture"},
    {"id": "glitch", "name": "The Glitch", "artists": "Aphex Twin / Arca", "phase": "P3", "aesthetic": "Liquid Glitch", "signature": "Polyrhythmic IDM percussion"},
    {"id": "zen", "name": "The Zen", "artists": "Bonobo / Tycho", "phase": "P4", "aesthetic": "Organic Mist", "signature": "Acoustic instrument layering"},
]

LONDON_SEEDS = [
    {"id": "jungle-90s", "name": "1990s Jungle / Hardcore", "era": "1990-1997", "traits": "Fast breakbeats, ragga vocals, deep sub-bass"},
    {"id": "2step-garage", "name": "UK 2-Step Garage", "era": "1998-2003", "traits": "Shuffling rhythms, vocal chops, soulful production"},
    {"id": "uk-dubstep", "name": "UK Dubstep (Original 140)", "era": "2003-2010", "traits": "Deep sub-bass focus, sparse syncopation"},
]

TRACK_NAMES = [
    "Neural Drift", "Warehouse Protocol", "Sub-Bass Architecture", "Phase Lock",
    "London Calling", "Concrete Frequency", "Night Bus", "Ragga Signal",
    "2AM Transmission", "Vinyl Ghost", "Deep Pressure", "Jungle Memory",
    "Garage Theory", "Dark Matter", "Frequency Collapse", "Echo Chamber",
    "Brixton Bass", "Hackney Wick", "Fabric Session", "Ministry Bounce",
    "Pirate Radio", "Amen Break", "Rewind Selector", "Dubplate Special",
    "Sound System", "Bass Weight", "Rinse FM", "Sub Low", "Rude Boy",
    "Jungle Massive", "Steppers Delight", "Dub Siren", "MC Chat",
]

BRIDGE_NAMES = [
    "Phase Shift", "Cross-Frequency", "Transition Bridge", "Morph Sequence",
    "Blended Signal", "Fade Protocol", "Phase Lock", "Bridge Circuit",
    "Signal Drift", "Harmonic Blend", "Frequency Merge", "Phase Crossover",
    "Dual Spectrum", "Waveform Splice", "Sonic Gateway", "Tunnel Transit",
]


class ConductRequest(BaseModel):
    phase: int
    atmosphere: str = "balanced"
    bpm: int = 128
    vocal_style: Optional[str] = None
    surprise_me: bool = False
    genre_code: Optional[str] = None
    artist_seed: Optional[str] = None


class TransitionRequest(BaseModel):
    from_phase: int
    to_phase: int
    crossfade_pct: float = 50.0
    bpm: Optional[int] = None
    atmosphere: str = "balanced"


class SessionAction(BaseModel):
    session_id: str
    track_id: str
    action: str


# --- Helpers ---

def find_phase(code):
    return next((p for p in PHASES if p["code"] == code), None)


def select_genre(phase_code, genre_code=None):
    if genre_code:
        found = next((g for g in GENRES if g["code"] == genre_code), None)
        if found:
            return found
    pool = [g for g in GENRES if g["phase"] == phase_code]
    return secrets.choice(pool) if pool else None


def generate_waveform(size=64):
    return [secrets.randbelow(800) / 1000 + 0.2 for _ in range(size)]


def make_seed_state():
    return secrets.randbelow(900000) + 100000


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.mongodb_client = AsyncIOMotorClient(MONGO_URL)
    app.db = app.mongodb_client[DB_NAME]
    await seed_data(app.db)
    yield
    app.mongodb_client.close()


async def seed_data(db):
    count = await db.genres.count_documents({})
    if count == 0:
        await db.genres.insert_many([{**g} for g in GENRES])
    count = await db.phases.count_documents({})
    if count == 0:
        await db.phases.insert_many([{**p} for p in PHASES])


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "jukebox-api"}


@app.get("/api/phases")
async def get_phases():
    phases = await app.db.phases.find({}, {"_id": 0}).to_list(10)
    if not phases:
        return PHASES
    return phases


@app.get("/api/genres")
async def get_genres(phase: Optional[int] = None):
    query = {}
    if phase is not None:
        query["phase"] = phase
    genres = await app.db.genres.find(query, {"_id": 0}).to_list(100)
    if not genres:
        return [g for g in GENRES if phase is None or g["phase"] == phase]
    return genres


@app.get("/api/genres/{code}")
async def get_genre(code: str):
    genre = await app.db.genres.find_one({"code": code}, {"_id": 0})
    if not genre:
        for g in GENRES:
            if g["code"] == code:
                return g
        raise HTTPException(404, "Genre not found")
    return genre


@app.get("/api/artist-seeds")
async def get_artist_seeds():
    return ARTIST_SEEDS


@app.get("/api/london-seeds")
async def get_london_seeds():
    return LONDON_SEEDS


@app.post("/api/conduct")
async def conduct(req: ConductRequest):
    phase_data = find_phase(req.phase)
    if not phase_data:
        raise HTTPException(400, "Invalid phase")

    bpm = req.bpm
    atmosphere = req.atmosphere
    if req.surprise_me:
        bpm_lo, bpm_hi = phase_data["bpm_range"]
        bpm = secrets.randbelow(bpm_hi - bpm_lo + 1) + bpm_lo
        atmosphere = secrets.choice(["dark", "balanced", "uplifting"])

    selected_genre = select_genre(req.phase, req.genre_code)

    track = {
        "track_id": str(uuid.uuid4())[:8],
        "name": f"{secrets.choice(TRACK_NAMES)} [{selected_genre['name']}]",
        "genre": selected_genre,
        "phase": req.phase,
        "bpm": bpm,
        "atmosphere": atmosphere,
        "vocal_style": req.vocal_style,
        "artist_seed": req.artist_seed,
        "waveform": generate_waveform(),
        "duration_s": secrets.randbelow(301) + 180,
        "cost_per_hour": 0.02,
        "processing_tier": "standard",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "seed": {
            "phase": req.phase,
            "atmosphere": atmosphere,
            "bpm": bpm,
            "genre_code": selected_genre["code"],
            "vocal_style": req.vocal_style,
            "random_state": make_seed_state(),
        }
    }

    await app.db.history.insert_one({**track})
    track.pop("_id", None)
    return track


@app.get("/api/history")
async def get_history(limit: int = 50):
    tracks = await app.db.history.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return tracks


@app.post("/api/history/action")
async def track_action(action: SessionAction):
    track = await app.db.history.find_one({"track_id": action.track_id})
    if not track:
        raise HTTPException(404, "Track not found")

    if action.action == "love":
        await app.db.history.update_one({"track_id": action.track_id}, {"$set": {"loved": True}})
    elif action.action == "dislike":
        await app.db.history.update_one({"track_id": action.track_id}, {"$set": {"disliked": True}})
    elif action.action == "pin":
        await app.db.history.update_one({"track_id": action.track_id}, {"$set": {"pinned": True}})

    return {"status": "ok", "action": action.action, "track_id": action.track_id}


@app.delete("/api/history/{track_id}")
async def delete_track(track_id: str):
    result = await app.db.history.delete_one({"track_id": track_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Track not found")
    return {"status": "deleted", "track_id": track_id}


@app.get("/api/stats")
async def get_stats():
    total_tracks = await app.db.history.count_documents({})
    loved = await app.db.history.count_documents({"loved": True})
    pinned = await app.db.history.count_documents({"pinned": True})
    phase_counts = {}
    for p in [1, 2, 3, 4]:
        c = await app.db.history.count_documents({"phase": p})
        phase_counts[str(p)] = c
    return {
        "total_tracks": total_tracks,
        "loved": loved,
        "pinned": pinned,
        "phase_counts": phase_counts,
        "session_cost": round(total_tracks * 0.02, 2),
    }


@app.post("/api/transition")
async def create_transition(req: TransitionRequest):
    from_phase = find_phase(req.from_phase)
    to_phase = find_phase(req.to_phase)
    if not from_phase or not to_phase:
        raise HTTPException(400, "Invalid phase")

    pct = max(0, min(100, req.crossfade_pct)) / 100
    from_bpm_mid = (from_phase["bpm_range"][0] + from_phase["bpm_range"][1]) / 2
    to_bpm_mid = (to_phase["bpm_range"][0] + to_phase["bpm_range"][1]) / 2
    blended_bpm = req.bpm or int(from_bpm_mid * (1 - pct) + to_bpm_mid * pct)

    from_genre = select_genre(req.from_phase)
    to_genre = select_genre(req.to_phase)

    track = {
        "track_id": str(uuid.uuid4())[:8],
        "name": f"{secrets.choice(BRIDGE_NAMES)} [P{req.from_phase}\u2192P{req.to_phase}]",
        "from_phase": req.from_phase,
        "to_phase": req.to_phase,
        "from_genre": from_genre,
        "to_genre": to_genre,
        "crossfade_pct": req.crossfade_pct,
        "phase": req.to_phase if pct > 0.5 else req.from_phase,
        "bpm": blended_bpm,
        "atmosphere": req.atmosphere,
        "waveform": generate_waveform(),
        "duration_s": secrets.randbelow(181) + 120,
        "cost_per_hour": 0.04,
        "processing_tier": "transition_bridge",
        "transition": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "seed": {
            "from_phase": req.from_phase,
            "to_phase": req.to_phase,
            "crossfade_pct": req.crossfade_pct,
            "bpm": blended_bpm,
            "random_state": make_seed_state(),
        }
    }

    await app.db.history.insert_one({**track})
    track.pop("_id", None)
    return track



class VibeLinkCreate(BaseModel):
    track_id: Optional[str] = None
    phase: int = 1
    atmosphere: str = "balanced"
    bpm: int = 128
    genre_code: Optional[str] = None
    vocal_style: Optional[str] = None
    artist_seed: Optional[str] = None
    name: Optional[str] = None


@app.post("/api/vibe-link")
async def create_vibe_link(req: VibeLinkCreate):
    code = str(uuid.uuid4())[:6].upper()
    doc = {
        "code": code,
        "track_id": req.track_id,
        "phase": req.phase,
        "atmosphere": req.atmosphere,
        "bpm": req.bpm,
        "genre_code": req.genre_code,
        "vocal_style": req.vocal_style,
        "artist_seed": req.artist_seed,
        "name": req.name,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "opens": 0,
    }
    await app.db.vibe_links.insert_one({**doc})
    return {"code": code, "url": f"/vibe/{code}"}


@app.get("/api/vibe-link/{code}")
async def get_vibe_link(code: str):
    link = await app.db.vibe_links.find_one({"code": code.upper()}, {"_id": 0})
    if not link:
        raise HTTPException(404, "Vibe link not found")
    await app.db.vibe_links.update_one({"code": code.upper()}, {"$inc": {"opens": 1}})
    return link
