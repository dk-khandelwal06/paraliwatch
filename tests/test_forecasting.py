"""
Tests for ParaliWatch Forecasting: Model Artifacts, Inference, and Baselines.
"""
import unittest
from pathlib import Path
import numpy as np
import pandas as pd
from src.predict import load_model_artifact, generate_next_day_forecast
from src.config import MODELS_DIR, FEATURE_COLS


class TestForecasting(unittest.TestCase):

    def test_model_artifact_exists(self):
        model_file = MODELS_DIR / "model.joblib"
        metrics_file = MODELS_DIR / "metrics.json"
        self.assertTrue(model_file.exists(), "model.joblib should exist after training")
        self.assertTrue(metrics_file.exists(), "metrics.json should exist after training")

    def test_model_inference_output(self):
        artifact = load_model_artifact()
        pipeline = artifact["pipeline"]
        metrics = artifact["metrics"]
        
        self.assertIn("metrics", metrics)
        self.assertIn("model_mae", metrics["metrics"])
        self.assertIn("persistence_mae", metrics["metrics"])
        self.assertIn("skill_vs_persistence", metrics["metrics"])
        
        # Test synthetic input row
        test_row = pd.DataFrame([{
            "date": "2026-11-04",
            "fire_count_today": 120.0,
            "lag_1": 115.0,
            "lag_2": 95.0,
            "lag_3": 80.0,
            "rolling_mean_7d": 105.0,
            "day_of_season": 35,
            "temp_mean": 24.5,
            "temp_max": 30.2,
            "precip_sum": 0.0,
            "precip_lag1": 0.0,
            "wind_speed_max": 14.0,
        }])
        
        forecast = generate_next_day_forecast(test_row)
        
        self.assertGreaterEqual(forecast["predicted_count"], 0.0)
        self.assertEqual(forecast["baseline_persistence"], 120.0)
        self.assertEqual(forecast["baseline_rolling7d"], 105.0)
        self.assertEqual(forecast["target_date"], "2026-11-05")
        self.assertTrue(forecast["is_statistical_estimate"])


if __name__ == "__main__":
    unittest.main()
