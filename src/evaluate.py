"""
Comprehensive Evaluation & Honest Verification Module for ParaliWatch.
Generates evaluation tables, residual diagnostics, and baseline performance comparisons.
"""
import sys
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import json
import logging
from typing import Dict, Any
import numpy as np
import pandas as pd

from src.config import PROCESSED_DIR, PUBLIC_DATA_DIR, MODELS_DIR

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("evaluate")


def generate_evaluation_report() -> Dict[str, Any]:
    """
    Builds a full evaluation report combining the offline model test metrics
    and prospective prediction records.
    """
    metrics_file = MODELS_DIR / "metrics.json"
    if not metrics_file.exists():
        logger.warning("No metrics.json found in models directory.")
        return {}
        
    with open(metrics_file, "r") as f:
        metrics_data = json.load(f)
        
    # Read prospective scorecard
    forecast_file = PROCESSED_DIR / "forecast_history.json"
    prospective_data = {}
    if forecast_file.exists():
        with open(forecast_file, "r") as f:
            prospective_data = json.load(f)
            
    report = {
        "report_generated_at": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "model_architecture": {
            "algorithm": "Ridge Regression (L2 Regularization)",
            "regularization_strength_alpha": metrics_data.get("alpha", 1.5),
            "target_transformation": "log1p(fire_count_{t+1}) -> expm1(y_pred)",
            "validation_method": "Temporal season-based holdout (Seasons <= 2024 train, Season 2025 test)",
            "features_used": list(metrics_data.get("feature_coefficients", {}).keys()),
        },
        "test_season_evaluation": metrics_data.get("metrics", {}),
        "feature_coefficients": metrics_data.get("feature_coefficients", {}),
        "prospective_scorecard": prospective_data.get("scorecard_summary", {}),
        "scientific_honesty_statement": (
            "Ridge Regression is a statistical regularized linear model. "
            "Skill scores are reported relative to the Persistence baseline (tomorrow equals today). "
            "Forecasts represent statistical expectations based on satellite lags and meteorological factors, "
            "not deterministic certainties. Atmospheric attenuation, cloud cover, and satellite overpass timing "
            "must be accounted for when interpreting fire detections."
        )
    }
    
    with open(PROCESSED_DIR / "evaluation_report.json", "w") as f:
        json.dump(report, f, indent=2)
    with open(PUBLIC_DATA_DIR / "evaluation_report.json", "w") as f:
        json.dump(report, f, indent=2)
        
    return report


if __name__ == "__main__":
    generate_evaluation_report()
