"""
Model Training and Honest Baseline Comparison for ParaliWatch.
Trains a Ridge Regression model to predict next-day fire counts
using historical VIIRS satellite detections and meteorological covariates.
Compares strictly against Persistence and 7-day Rolling Average baselines.
"""
import sys
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import json
import logging
from typing import Dict, Any, Tuple
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from src.config import (
    FEATURE_COLS,
    TARGET_COL,
    RIDGE_ALPHA,
    MODELS_DIR,
    PROCESSED_DIR,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("train")


def train_and_evaluate_model(
    df: pd.DataFrame,
    test_season: int = 2025,
) -> Tuple[Pipeline, Dict[str, Any]]:
    """
    Trains Ridge Regression on seasons < test_season and evaluates on test_season.
    Strict temporal split - NO random train/test split.
    """
    # Drop rows where target or key lag features are NaN
    valid_df = df.dropna(subset=FEATURE_COLS + [TARGET_COL, "target_next_day_raw"]).copy()
    
    seasons = sorted(valid_df["season"].unique())
    logger.info(f"Available seasons in training dataset: {seasons}")
    
    if test_season not in seasons and len(seasons) > 1:
        test_season = seasons[-1]
        
    train_mask = valid_df["season"] < test_season
    test_mask = valid_df["season"] == test_season
    
    if not train_mask.any():
        logger.warning("Only single season available. Using first 70% of season for train, last 30% for test.")
        split_idx = int(len(valid_df) * 0.7)
        train_df = valid_df.iloc[:split_idx]
        test_df = valid_df.iloc[split_idx:]
    else:
        train_df = valid_df[train_mask]
        test_df = valid_df[test_mask]
        
    logger.info(f"Train samples: {len(train_df)} | Test samples: {len(test_df)} (Season {test_season})")
    
    X_train = train_df[FEATURE_COLS]
    y_train = train_df[TARGET_COL]
    
    X_test = test_df[FEATURE_COLS]
    y_test_log = test_df[TARGET_COL]
    y_test_raw = test_df["target_next_day_raw"].values
    
    # Ridge regression pipeline with standard scaling
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("ridge", Ridge(alpha=RIDGE_ALPHA, random_state=42)),
    ])
    
    pipeline.fit(X_train, y_train)
    
    # Model predictions
    y_pred_log = pipeline.predict(X_test)
    # Inverse transform: expm1 to get back to non-negative fire counts
    y_pred_raw = np.expm1(np.clip(y_pred_log, 0, None))
    
    # Baselines on test set:
    # 1. Persistence: tomorrow equals today
    persistence_raw = test_df["baseline_persistence_raw"].values
    # 2. 7-day rolling mean
    rolling7d_raw = test_df["baseline_rolling7d_raw"].values
    
    # Evaluation Metrics in raw fire counts
    model_mae = float(mean_absolute_error(y_test_raw, y_pred_raw))
    model_rmse = float(np.sqrt(mean_squared_error(y_test_raw, y_pred_raw)))
    model_r2 = float(r2_score(y_test_raw, y_pred_raw))
    
    persistence_mae = float(mean_absolute_error(y_test_raw, persistence_raw))
    persistence_rmse = float(np.sqrt(mean_squared_error(y_test_raw, persistence_raw)))
    
    rolling7d_mae = float(mean_absolute_error(y_test_raw, rolling7d_raw))
    rolling7d_rmse = float(np.sqrt(mean_squared_error(y_test_raw, rolling7d_raw)))
    
    # Skill score relative to persistence: 1 - (MAE_model / MAE_persistence)
    if persistence_mae > 0:
        skill_score = float(1.0 - (model_mae / persistence_mae))
    else:
        skill_score = 0.0
        
    # Feature importances / coefficients
    ridge_model: Ridge = pipeline.named_steps["ridge"]
    coefs = dict(zip(FEATURE_COLS, [float(c) for c in ridge_model.coef_]))
    
    metrics = {
        "model_name": "Ridge Regression",
        "model_version": "v1.2.0-VIIRS",
        "alpha": RIDGE_ALPHA,
        "trained_date": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "test_season": int(test_season),
        "test_sample_count": len(test_df),
        "metrics": {
            "model_mae": round(model_mae, 2),
            "model_rmse": round(model_rmse, 2),
            "model_r2": round(model_r2, 3),
            "persistence_mae": round(persistence_mae, 2),
            "persistence_rmse": round(persistence_rmse, 2),
            "rolling7d_mae": round(rolling7d_mae, 2),
            "rolling7d_rmse": round(rolling7d_rmse, 2),
            "skill_vs_persistence": round(skill_score, 3),
            "skill_percentage": round(skill_score * 100, 1),
        },
        "feature_coefficients": {k: round(v, 4) for k, v in sorted(coefs.items(), key=lambda x: abs(x[1]), reverse=True)},
        "evaluation_summary": (
            f"Evaluated on complete {test_season} season. "
            f"Ridge MAE: {round(model_mae, 2)} fires vs Persistence MAE: {round(persistence_mae, 2)} fires. "
            f"Skill relative to persistence: {round(skill_score * 100, 1)}%."
        ),
    }
    
    logger.info(f"Model MAE: {model_mae:.2f} | Persistence MAE: {persistence_mae:.2f} | Skill: {skill_score:.1%}")
    
    # Save artifacts
    joblib.dump({"pipeline": pipeline, "metrics": metrics, "features": FEATURE_COLS}, MODELS_DIR / "model.joblib")
    with open(MODELS_DIR / "metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
        
    return pipeline, metrics


if __name__ == "__main__":
    logger.info("Standalone training test...")
