"""
Inference and Prospective Prediction Logging for ParaliWatch.
Generates next-day paddy residue burning forecasts.
Records prospective predictions with immutable generation timestamps
and matches them against actual subsequent observations as they arrive.
"""
import sys
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
import joblib
import numpy as np
import pandas as pd

from src.config import (
    FEATURE_COLS,
    MODELS_DIR,
    PROCESSED_DIR,
    PUBLIC_DATA_DIR,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("predict")

FORECAST_HISTORY_FILE = PROCESSED_DIR / "forecast_history.json"


def load_model_artifact():
    """Loads saved model pipeline and metadata."""
    model_path = MODELS_DIR / "model.joblib"
    if not model_path.exists():
        raise FileNotFoundError(f"Model artifact not found at {model_path}. Train the model first.")
    return joblib.load(model_path)


def generate_next_day_forecast(
    latest_features_df: pd.DataFrame,
) -> Dict[str, Any]:
    """
    Generates next-day fire count forecast from the latest available features row.
    """
    artifact = load_model_artifact()
    pipeline = artifact["pipeline"]
    metrics = artifact["metrics"]
    
    if latest_features_df.empty:
        raise ValueError("Cannot predict on empty features DataFrame.")
        
    latest_row = latest_features_df.iloc[-1]
    obs_date_str = str(latest_row["date"])
    obs_date = datetime.strptime(obs_date_str, "%Y-%m-%d")
    target_date = obs_date + timedelta(days=1)
    target_date_str = target_date.strftime("%Y-%m-%d")
    
    X_latest = pd.DataFrame([latest_row[FEATURE_COLS]])
    
    # Predict in log scale and invert
    pred_log = float(pipeline.predict(X_latest)[0])
    pred_count = float(np.expm1(max(0.0, pred_log)))
    
    # Baselines
    persistence_pred = float(latest_row["fire_count_today"])
    rolling7d_pred = float(latest_row["rolling_mean_7d"])
    
    # Estimate forecast interval from model test RMSE
    rmse = metrics.get("metrics", {}).get("model_rmse", 50.0)
    lower_bound = max(0.0, pred_count - 1.28 * rmse)
    upper_bound = pred_count + 1.28 * rmse
    
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    
    forecast_entry = {
        "forecast_id": f"FC-{obs_date_str}-{target_date_str}",
        "generated_at": now_str,
        "observation_date": obs_date_str,
        "target_date": target_date_str,
        "predicted_count": round(pred_count, 1),
        "prediction_lower": round(lower_bound, 1),
        "prediction_upper": round(upper_bound, 1),
        "baseline_persistence": round(persistence_pred, 1),
        "baseline_rolling7d": round(rolling7d_pred, 1),
        "today_observed_count": round(persistence_pred, 1),
        "model_name": metrics.get("model_name", "Ridge Regression"),
        "model_version": metrics.get("model_version", "v1.2.0"),
        "is_statistical_estimate": True,
        "disclaimer": "Statistical estimate based on satellite lags and weather covariates. Not a guaranteed outcome.",
        # Prospective evaluation fields (filled when actual arrives)
        "actual_observed_count": None,
        "absolute_error_model": None,
        "absolute_error_persistence": None,
        "is_evaluated": False,
    }
    
    logger.info(
        f"Generated forecast for {target_date_str}: {forecast_entry['predicted_count']} fires "
        f"(Persistence: {forecast_entry['baseline_persistence']}, 7d Avg: {forecast_entry['baseline_rolling7d']})"
    )
    
    return forecast_entry


def update_forecast_history(
    new_forecast: Dict[str, Any],
    daily_fires_df: pd.DataFrame,
) -> Dict[str, Any]:
    """
    Appends new forecast if not present, and reconciles past forecasts
    with actual observed counts without retrospective alteration.
    """
    history = []
    if FORECAST_HISTORY_FILE.exists():
        try:
            with open(FORECAST_HISTORY_FILE, "r") as f:
                history = json.load(f).get("predictions", [])
        except Exception as e:
            logger.warning(f"Failed to read existing forecast history: {e}")
            history = []
            
    # Check if this forecast already exists
    existing_idx = None
    for idx, item in enumerate(history):
        if item.get("forecast_id") == new_forecast["forecast_id"]:
            existing_idx = idx
            break
            
    if existing_idx is None:
        history.append(new_forecast)
    else:
        # Keep original generated_at and predictions; only update if unevaluated
        if not history[existing_idx].get("is_evaluated", False):
            # Preserve creation time
            new_forecast["generated_at"] = history[existing_idx]["generated_at"]
            history[existing_idx] = new_forecast
            
    # Map actual counts from daily_fires_df to evaluate completed target dates
    if not daily_fires_df.empty:
        actual_map = dict(zip(
            daily_fires_df["date"].astype(str),
            daily_fires_df["fire_count"].astype(float)
        ))
        
        for item in history:
            target_d = item.get("target_date")
            if target_d in actual_map and item.get("actual_observed_count") is None:
                actual_val = actual_map[target_d]
                item["actual_observed_count"] = round(actual_val, 1)
                item["absolute_error_model"] = round(abs(item["predicted_count"] - actual_val), 1)
                item["absolute_error_persistence"] = round(abs(item["baseline_persistence"] - actual_val), 1)
                item["is_evaluated"] = True
                
    # Calculate prospective scorecard stats across all evaluated items
    evaluated_items = [h for h in history if h.get("is_evaluated", False)]
    if evaluated_items:
        model_errors = [h["absolute_error_model"] for h in evaluated_items]
        persistence_errors = [h["absolute_error_persistence"] for h in evaluated_items]
        scorecard_mae_model = float(np.mean(model_errors))
        scorecard_mae_persistence = float(np.mean(persistence_errors))
        if scorecard_mae_persistence > 0:
            scorecard_skill = float(1.0 - (scorecard_mae_model / scorecard_mae_persistence))
        else:
            scorecard_skill = 0.0
    else:
        scorecard_mae_model = None
        scorecard_mae_persistence = None
        scorecard_skill = None
        
    result_data = {
        "last_updated": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "latest_forecast": new_forecast,
        "scorecard_summary": {
            "total_predictions": len(history),
            "evaluated_predictions": len(evaluated_items),
            "scorecard_mae_model": round(scorecard_mae_model, 2) if scorecard_mae_model is not None else None,
            "scorecard_mae_persistence": round(scorecard_mae_persistence, 2) if scorecard_mae_persistence is not None else None,
            "scorecard_skill": round(scorecard_skill, 3) if scorecard_skill is not None else None,
        },
        "predictions": history,
    }
    
    # Save to both processed and public
    with open(FORECAST_HISTORY_FILE, "w") as f:
        json.dump(result_data, f, indent=2)
    with open(PUBLIC_DATA_DIR / "forecast_history.json", "w") as f:
        json.dump(result_data, f, indent=2)
        
    return result_data
