"""
NASA FIRMS Satellite Data Fetcher for ParaliWatch.
Retrieves VIIRS S-NPP fire detections for Punjab, India.
Filters by confidence (nominal, high) and clips to Indian Punjab boundaries.
"""
import sys
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import io
import time
import logging
from datetime import datetime, timedelta
from typing import Optional, List
import pandas as pd
import requests

from src.config import (
    FIRMS_MAP_KEY,
    FIRMS_BASE_URL,
    DEFAULT_SENSOR,
    PUNJAB_BBOX,
    RAW_DIR,
    PROCESSED_DIR,
    is_point_in_punjab_india,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("fetch_fires")


def fetch_fires_chunk(
    sensor: str = DEFAULT_SENSOR,
    day_range: int = 5,
    date_str: Optional[str] = None,
    map_key: Optional[str] = None,
) -> pd.DataFrame:
    """
    Fetches fire detections for the configured Punjab bounding box from NASA FIRMS.
    day_range must be between 1 and 5.
    """
    key = map_key or FIRMS_MAP_KEY
    bbox_str = f"{PUNJAB_BBOX[0]},{PUNJAB_BBOX[1]},{PUNJAB_BBOX[2]},{PUNJAB_BBOX[3]}"
    
    if date_str:
        url = f"{FIRMS_BASE_URL}/area/csv/{key}/{sensor}/{bbox_str}/{day_range}/{date_str}"
    else:
        url = f"{FIRMS_BASE_URL}/area/csv/{key}/{sensor}/{bbox_str}/{day_range}"
        
    masked_url = url.replace(key, "MAP_KEY_HIDDEN")
    logger.info(f"Requesting FIRMS data: {masked_url}")
    
    try:
        response = requests.get(url, timeout=30)
        if response.status_code != 200:
            logger.error(f"FIRMS API error {response.status_code}: {response.text[:200]}")
            return pd.DataFrame()
            
        csv_data = response.text.strip()
        if not csv_data or csv_data.startswith("Invalid API call") or "No fires" in csv_data:
            logger.warning(f"No fires or invalid call returned for {date_str or 'latest'}")
            return pd.DataFrame()
            
        df = pd.read_csv(io.StringIO(csv_data))
        return df
    except Exception as e:
        logger.error(f"Failed to fetch FIRMS chunk: {e}")
        return pd.DataFrame()


def clean_and_filter_fires(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans raw FIRMS data:
    1. Validates required columns.
    2. Keeps only 'nominal' and 'high' confidence.
    3. Excludes Pakistani Punjab using geographic boundary rules.
    4. Removes duplicate detections.
    5. Converts dates/types.
    """
    if df.empty:
        return df
        
    required_cols = {"latitude", "longitude", "acq_date", "acq_time", "confidence", "frp"}
    if not required_cols.issubset(set(df.columns)):
        logger.warning(f"Missing required columns in FIRMS data: {required_cols - set(df.columns)}")
        return pd.DataFrame()
        
    # Filter confidence: only nominal (n) and high (h)
    # VIIRS uses 'n', 'h', 'l' or full names
    df = df.copy()
    df["confidence_str"] = df["confidence"].astype(str).str.lower().str.strip()
    valid_conf = df["confidence_str"].isin(["nominal", "high", "n", "h"])
    df = df[valid_conf]
    
    # Clip strictly to Indian Punjab
    is_punjab = df.apply(lambda r: is_point_in_punjab_india(float(r["latitude"]), float(r["longitude"])), axis=1)
    df = df[is_punjab]
    
    # Deduplicate
    df = df.drop_duplicates(subset=["latitude", "longitude", "acq_date", "acq_time"])
    
    # Sort chronologically
    df["acq_date"] = pd.to_datetime(df["acq_date"]).dt.strftime("%Y-%m-%d")
    df = df.sort_values(by=["acq_date", "acq_time"]).reset_index(drop=True)
    
    return df


def fetch_season_fires(start_date: str, end_date: str, sensor: str = DEFAULT_SENSOR) -> pd.DataFrame:
    """
    Fetches fire detections across a date range in 5-day increments.
    """
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    
    curr = end
    all_chunks: List[pd.DataFrame] = []
    
    while curr >= start:
        chunk_date_str = curr.strftime("%Y-%m-%d")
        logger.info(f"Fetching 5-day chunk ending on {chunk_date_str}")
        chunk_df = fetch_fires_chunk(sensor=sensor, day_range=5, date_str=chunk_date_str)
        if not chunk_df.empty:
            all_chunks.append(chunk_df)
        curr -= timedelta(days=5)
        time.sleep(1.0)  # Gentle on API rate limits
        
    if not all_chunks:
        return pd.DataFrame()
        
    combined = pd.concat(all_chunks, ignore_index=True)
    cleaned = clean_and_filter_fires(combined)
    return cleaned


if __name__ == "__main__":
    logger.info("Running standalone fire fetcher test...")
    # Fetch latest 5 days
    df_recent = fetch_fires_chunk(day_range=5)
    cleaned = clean_and_filter_fires(df_recent)
    logger.info(f"Cleaned recent detections: {len(cleaned)} rows")
    if not cleaned.empty:
        print(cleaned[["latitude", "longitude", "acq_date", "confidence", "frp"]].head())
