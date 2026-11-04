"""
Configuration settings for ParaliWatch (Project 007).
Contains bounding boxes, sensor configurations, weather stations, and paths.
"""
import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
HISTORICAL_DIR = DATA_DIR / "historical"
MODELS_DIR = BASE_DIR / "models"
PUBLIC_DATA_DIR = BASE_DIR / "public" / "data"

# Ensure directories exist
for p in [RAW_DIR, PROCESSED_DIR, HISTORICAL_DIR, MODELS_DIR, PUBLIC_DATA_DIR]:
    p.mkdir(parents=True, exist_ok=True)

# Load .env file if present (without requiring external package)
env_file = BASE_DIR / ".env"
if env_file.exists():
    with open(env_file, "r") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

# NASA FIRMS API Config
# Note: In production and GitHub Actions, FIRMS_MAP_KEY MUST be provided via environment variable.
FIRMS_MAP_KEY = os.environ.get("FIRMS_MAP_KEY", "")
FIRMS_BASE_URL = "https://firms.modaps.eosdis.nasa.gov/api"
DEFAULT_SENSOR = "VIIRS_SNPP_NRT"

# Geographic Bounding Box for Punjab Study Region (W, S, E, N)
PUNJAB_BBOX = [73.8, 29.5, 77.0, 32.6]
PUNJAB_LAT_MIN = 29.5
PUNJAB_LAT_MAX = 32.6
PUNJAB_LON_MIN = 73.8
PUNJAB_LON_MAX = 77.0

# Weather Stations (5 focal monitoring hubs in Punjab)
WEATHER_STATIONS = {
    "Amritsar": {"lat": 31.6340, "lon": 74.8723, "elev": 234},
    "Ludhiana": {"lat": 30.9010, "lon": 75.8573, "elev": 244},
    "Patiala": {"lat": 30.3398, "lon": 76.3869, "elev": 250},
    "Sangrur": {"lat": 30.2458, "lon": 75.8421, "elev": 232},
    "Bathinda": {"lat": 30.2110, "lon": 74.9455, "elev": 211},
}

# Paddy Residue Burning Season Definitions
# Peak burning takes place between October 1 and November 30
SEASON_START_MONTH = 10
SEASON_START_DAY = 1
SEASON_END_MONTH = 11
SEASON_END_DAY = 30

# Machine Learning & Feature Engineering Parameters
FEATURE_COLS = [
    "fire_count_today",
    "lag_1",
    "lag_2",
    "lag_3",
    "rolling_mean_7d",
    "day_of_season",
    "temp_mean",
    "temp_max",
    "precip_sum",
    "precip_lag1",
    "wind_speed_max",
]

TARGET_COL = "target_next_day_log"  # log1p(next_day_fire_count)
RIDGE_ALPHA = 1.5

def is_point_in_punjab_india(lat: float, lon: float) -> bool:
    """
    Validates whether a coordinate falls inside Indian Punjab,
    strictly excluding neighboring Pakistani Punjab across the Radcliffe Line.
    """
    if not (PUNJAB_LAT_MIN <= lat <= PUNJAB_LAT_MAX and PUNJAB_LON_MIN <= lon <= PUNJAB_LON_MAX):
        return False
    
    # Border filtration piecewise thresholds
    if lat < 30.2:
        if lon < 74.00:
            return False
    elif lat < 30.8:
        if lon < 74.35:
            return False
    elif lat < 31.4:
        if lon < 74.60:
            return False
    elif lat < 32.0:
        if lon < 74.80:
            return False
    else:
        if lon < 75.10:
            return False
            
    return True
