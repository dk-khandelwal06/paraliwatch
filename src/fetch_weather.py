"""
Open-Meteo Weather Data Fetcher for ParaliWatch.
Retrieves historical and near-real-time meteorological observations
for five representative monitoring hubs in Punjab:
Amritsar, Ludhiana, Patiala, Sangrur, and Bathinda.
"""
import sys
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import time
import logging
from typing import Dict, List, Optional
import pandas as pd
import requests

from src.config import WEATHER_STATIONS, PROCESSED_DIR, RAW_DIR

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("fetch_weather")

OPEN_METEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"


def fetch_station_weather(
    lat: float,
    lon: float,
    start_date: str,
    end_date: str,
) -> pd.DataFrame:
    """
    Fetches daily weather metrics for a single lat/lon coordinate from Open-Meteo.
    """
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "daily": [
            "temperature_2m_max",
            "temperature_2m_min",
            "temperature_2m_mean",
            "precipitation_sum",
            "wind_speed_10m_max",
        ],
        "timezone": "Asia/Kolkata",
    }
    
    try:
        # Try archive API first
        response = requests.get(OPEN_METEO_ARCHIVE_URL, params=params, timeout=20)
        if response.status_code != 200:
            logger.warning(f"Archive API returned {response.status_code}, trying forecast endpoint with past_days...")
            # Fallback to forecast API for recent days
            f_params = {
                "latitude": lat,
                "longitude": lon,
                "daily": [
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "temperature_2m_mean",
                    "precipitation_sum",
                    "wind_speed_10m_max",
                ],
                "timezone": "Asia/Kolkata",
                "past_days": 14,
                "forecast_days": 1,
            }
            response = requests.get(OPEN_METEO_FORECAST_URL, params=f_params, timeout=20)
            
        if response.status_code != 200:
            logger.error(f"Open-Meteo error {response.status_code}: {response.text[:200]}")
            return pd.DataFrame()
            
        data = response.json()
        daily = data.get("daily", {})
        if not daily or "time" not in daily:
            return pd.DataFrame()
            
        df = pd.DataFrame(daily)
        df.rename(columns={"time": "date"}, inplace=True)
        return df
    except Exception as e:
        logger.error(f"Failed to fetch weather for ({lat}, {lon}): {e}")
        return pd.DataFrame()


def fetch_all_stations_weather(start_date: str, end_date: str) -> pd.DataFrame:
    """
    Fetches weather data for all 5 Punjab monitoring stations and computes
    regional daily aggregate metrics.
    """
    station_dfs: List[pd.DataFrame] = []
    
    for name, coords in WEATHER_STATIONS.items():
        logger.info(f"Fetching weather for {name} ({coords['lat']}, {coords['lon']})...")
        df_stn = fetch_station_weather(coords["lat"], coords["lon"], start_date, end_date)
        if not df_stn.empty:
            df_stn["station"] = name
            station_dfs.append(df_stn)
        time.sleep(0.5)
        
    if not station_dfs:
        logger.error("No weather data retrieved for any station.")
        return pd.DataFrame()
        
    all_weather = pd.concat(station_dfs, ignore_index=True)
    all_weather.to_csv(RAW_DIR / "weather_stations_raw.csv", index=False)
    
    # Regional daily averages
    agg = all_weather.groupby("date").agg({
        "temperature_2m_mean": "mean",
        "temperature_2m_max": "max",
        "temperature_2m_min": "min",
        "precipitation_sum": "mean",
        "wind_speed_10m_max": "mean",
    }).reset_index()
    
    agg.rename(columns={
        "temperature_2m_mean": "temp_mean",
        "temperature_2m_max": "temp_max",
        "temperature_2m_min": "temp_min",
        "precipitation_sum": "precip_sum",
        "wind_speed_10m_max": "wind_speed_max",
    }, inplace=True)
    
    logger.info(f"Aggregated regional weather across {len(agg)} days.")
    return agg


if __name__ == "__main__":
    logger.info("Running standalone weather test...")
    df = fetch_all_stations_weather("2026-10-01", "2026-11-02")
    if not df.empty:
        print(df.head())
