"""
Feature Engineering module for ParaliWatch.
Constructs time-series lag features, rolling windows, and meteorological covariates
for next-day paddy residue burning prediction.
Ensures ZERO lookahead bias.
"""
import logging
from datetime import datetime
import numpy as np
import pandas as pd

from src.config import (
    FEATURE_COLS,
    TARGET_COL,
    SEASON_START_MONTH,
    SEASON_START_DAY,
    PROCESSED_DIR,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("build_features")


def compute_day_of_season(date_series: pd.Series) -> pd.Series:
    """
    Computes day of burning season where October 1 is Day 1.
    """
    dt_series = pd.to_datetime(date_series)
    
    def get_day(dt):
        season_year = dt.year
        season_start = datetime(season_year, SEASON_START_MONTH, SEASON_START_DAY)
        delta = (dt - season_start).days + 1
        return delta
        
    return dt_series.apply(get_day)


def build_daily_features(
    daily_fires: pd.DataFrame,
    daily_weather: pd.DataFrame,
) -> pd.DataFrame:
    """
    Combines daily fire counts and weather observations into a complete ML dataset.
    
    daily_fires columns: ['date', 'fire_count']
    daily_weather columns: ['date', 'temp_mean', 'temp_max', 'temp_min', 'precip_sum', 'wind_speed_max']
    """
    if daily_fires.empty:
        logger.warning("Empty daily fires DataFrame passed to build_daily_features")
        return pd.DataFrame()
        
    df = daily_fires.copy()
    df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")
    df = df.sort_values("date").reset_index(drop=True)
    
    # Fill missing dates in the sequence with zero if confirmed observation range
    # Or ensure date indexing is strictly daily
    df["fire_count_today"] = df["fire_count"].fillna(0).astype(float)
    
    # Lag features (past fire counts) - NO LOOKAHEAD
    df["lag_1"] = df["fire_count_today"].shift(1)
    df["lag_2"] = df["fire_count_today"].shift(2)
    df["lag_3"] = df["fire_count_today"].shift(3)
    
    # Rolling 7-day average (including today, min_periods=1)
    df["rolling_mean_7d"] = df["fire_count_today"].rolling(window=7, min_periods=1).mean()
    
    # Day of burning season
    df["day_of_season"] = compute_day_of_season(df["date"])
    
    # Merge weather
    if not daily_weather.empty:
        w_df = daily_weather.copy()
        w_df["date"] = pd.to_datetime(w_df["date"]).dt.strftime("%Y-%m-%d")
        df = pd.merge(df, w_df, on="date", how="left")
    else:
        # Defaults if weather is missing
        df["temp_mean"] = 25.0
        df["temp_max"] = 32.0
        df["precip_sum"] = 0.0
        df["wind_speed_max"] = 12.0
        
    # Weather lags
    df["precip_lag1"] = df["precip_sum"].shift(1).fillna(0.0)
    
    # Forward fill or interpolate any mild weather gaps
    for col in ["temp_mean", "temp_max", "precip_sum", "wind_speed_max"]:
        if col in df.columns:
            df[col] = df[col].ffill().bfill().fillna(0.0)
            
    # Target: Next-day fire count log1p
    # target = log(1 + fire_count_{t+1})
    df["target_next_day_raw"] = df["fire_count_today"].shift(-1)
    df[TARGET_COL] = np.log1p(df["target_next_day_raw"])
    
    # Baselines for tomorrow:
    # 1. Persistence baseline: tomorrow equals today
    df["baseline_persistence_raw"] = df["fire_count_today"]
    # 2. 7-day rolling average baseline: tomorrow equals today's 7-day rolling mean
    df["baseline_rolling7d_raw"] = df["rolling_mean_7d"]
    
    # Season identifier
    df["season"] = pd.to_datetime(df["date"]).dt.year
    
    return df

