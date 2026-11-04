"""
Tests for ParaliWatch Pipeline: Data Cleaning, Boundary Clipping, Deduplication.
"""
import unittest
import pandas as pd
from src.config import is_point_in_punjab_india
from src.fetch_fires import clean_and_filter_fires


class TestPipeline(unittest.TestCase):

    def test_boundary_clipping_indian_punjab(self):
        # Known Indian Punjab coordinates
        ludhiana_lat, ludhiana_lon = 30.9010, 75.8573
        amritsar_lat, amritsar_lon = 31.6340, 74.8723
        bathinda_lat, bathinda_lon = 30.2110, 74.9455
        
        self.assertTrue(is_point_in_punjab_india(ludhiana_lat, ludhiana_lon))
        self.assertTrue(is_point_in_punjab_india(amritsar_lat, amritsar_lon))
        self.assertTrue(is_point_in_punjab_india(bathinda_lat, bathinda_lon))
        
        # Coordinates in Pakistani Punjab (Lahore, Kasur, Okara, Bahawalnagar)
        lahore_lat, lahore_lon = 31.5497, 74.3436  # West of Radcliffe line
        kasur_lat, kasur_lon = 31.1167, 74.4500
        okara_lat, okara_lon = 30.8100, 73.4500
        
        self.assertFalse(is_point_in_punjab_india(lahore_lat, lahore_lon))
        self.assertFalse(is_point_in_punjab_india(kasur_lat, kasur_lon))
        self.assertFalse(is_point_in_punjab_india(okara_lat, okara_lon))
        
        # Coordinates outside India completely
        self.assertFalse(is_point_in_punjab_india(0.0, 0.0))
        self.assertFalse(is_point_in_punjab_india(50.0, 10.0))

    def test_clean_and_filter_fires(self):
        raw_data = pd.DataFrame([
            # Valid nominal confidence in Ludhiana
            {"latitude": 30.9, "longitude": 75.85, "acq_date": "2026-10-25", "acq_time": "0830", "confidence": "nominal", "frp": 15.2},
            # Valid high confidence in Amritsar
            {"latitude": 31.6, "longitude": 74.88, "acq_date": "2026-10-25", "acq_time": "0831", "confidence": "high", "frp": 24.1},
            # Low confidence (should be filtered out)
            {"latitude": 30.9, "longitude": 75.85, "acq_date": "2026-10-25", "acq_time": "0832", "confidence": "low", "frp": 5.0},
            # Pakistan fire (should be filtered out)
            {"latitude": 31.5, "longitude": 74.20, "acq_date": "2026-10-25", "acq_time": "0833", "confidence": "high", "frp": 30.0},
            # Duplicate detection of row 1
            {"latitude": 30.9, "longitude": 75.85, "acq_date": "2026-10-25", "acq_time": "0830", "confidence": "nominal", "frp": 15.2},
        ])
        
        cleaned = clean_and_filter_fires(raw_data)
        # Should keep only 2 valid rows
        self.assertEqual(len(cleaned), 2)
        self.assertTrue(set(cleaned["confidence"]).issubset({"nominal", "high"}))


if __name__ == "__main__":
    unittest.main()
