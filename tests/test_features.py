"""
Tests for ParaliWatch Feature Engineering: Zero Lookahead Bias, Lags, Weather Merges.
"""
import unittest
import pandas as pd
import numpy as np
from src.build_features import build_daily_features, compute_day_of_season


class TestFeatures(unittest.TestCase):

    def test_compute_day_of_season(self):
        dates = pd.Series(["2026-10-01", "2026-10-15", "2026-11-01"])
        days = compute_day_of_season(dates)
        self.assertEqual(days.iloc[0], 1)
        self.assertEqual(days.iloc[1], 15)
        self.assertEqual(days.iloc[2], 32)

    def test_feature_lags_and_no_lookahead(self):
        # 10 synthetic days
        dates = [f"2026-10-{i:02d}" for i in range(1, 11)]
        fire_counts = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
        daily_fires = pd.DataFrame({"date": dates, "fire_count": fire_counts})
        
        # Weather
        daily_weather = pd.DataFrame({
            "date": dates,
            "temp_mean": [28.0] * 10,
            "temp_max": [33.0] * 10,
            "precip_sum": [0.0, 5.0] + [0.0] * 8,
            "wind_speed_max": [12.0] * 10,
        })
        
        features_df = build_daily_features(daily_fires, daily_weather)
        
        # Check lag 1 on Day 4 (index 3) should equal fire count on Day 3 (30)
        self.assertEqual(features_df.loc[3, "lag_1"], 30.0)
        self.assertEqual(features_df.loc[3, "lag_2"], 20.0)
        self.assertEqual(features_df.loc[3, "lag_3"], 10.0)
        
        # Check target on Day 3 should equal log1p of Day 4 fire count (40)
        expected_target_log = np.log1p(40.0)
        self.assertAlmostEqual(features_df.loc[2, "target_next_day_log"], expected_target_log, places=4)
        
        # Check persistence baseline on Day 3 should equal today's fire count (30)
        self.assertEqual(features_df.loc[2, "baseline_persistence_raw"], 30.0)
        
        # Check precip lag 1 on Day 3 should equal Day 2 precip (5.0)
        self.assertEqual(features_df.loc[2, "precip_lag1"], 5.0)


if __name__ == "__main__":
    unittest.main()
