# ParaliWatch System Architecture (Project 007)

**Tagline:** A Self-Updating Satellite Fire Tracker for Punjab's Paddy-Residue Burning Season.

## High-Level Architecture Overview

ParaliWatch decouples raw satellite ingestion and machine learning from client-side presentation, ensuring zero API secret exposure, high reliability on Vercel, and reproducible time-series evaluation.

```
+-------------------------------------------------------------------------+
|                              DATA PIPELINE                              |
+-------------------------------------------------------------------------+
|                                                                         |
|  [NASA FIRMS API]                [Open-Meteo Historical Weather API]    |
|   (VIIRS S-NPP Sensor)            (5 Stations: ASR, LDH, PAT, SNG, BTI) |
|           |                                       |                     |
|           v                                       v                     |
|  [src/fetch_fires.py]                    [src/fetch_weather.py]         |
|   - Confidence filter (nominal/high)      - Daily mean/max temp,        |
|   - Indian Punjab boundary clipping         precip sum, wind speed      |
|   - Deduplication & time indexing                 |                     |
|           \                                      /                      |
|            +-----------------+------------------+                       |
|                              v                                          |
|                   [src/build_features.py]                               |
|                    - Lags (1, 2, 3 days)                                |
|                    - 7-day rolling average (zero lookahead)             |
|                    - Day of burning season                              |
|                    - Weather covariates                                 |
|                              v                                          |
|                      [src/train.py]                                     |
|                    - Ridge Regression (alpha=1.5, StandardScaler)       |
|                    - Target: log1p(next_day_fire_count)                 |
|                    - Temporal season holdout (Test: 2025 season)        |
|                    - Baselines: Persistence & 7-day Average             |
|                              v                                          |
|                     [src/predict.py]                                    |
|                    - Generates next-day prospective forecast            |
|                    - Logs predictions immutably to forecast_history     |
|                    - Reconciles past forecasts with actuals             |
|                              v                                          |
|                    [src/update_data.py]                                 |
|                    - Exports verified JSON artifacts to public/data/    |
|                                                                         |
+----------------------------------+--------------------------------------+
                                   |
                                   v  (Committed by GitHub Actions)
+----------------------------------+--------------------------------------+
|                     VERSIONED DATA REPOSITORY                           |
|       public/data/{summary, recent_fires, daily_activity,               |
|                    seasonal_comparison, weather, forecast_history}.json  |
+----------------------------------+--------------------------------------+
                                   |
                                   v  (Static & client fetch)
+----------------------------------+--------------------------------------+
|                     NEXT.JS APPLICATION (VERCEL)                        |
+-------------------------------------------------------------------------+
|                                                                         |
|  - Chapter 01 to 07 Signature Storytelling Scroll Narrative             |
|  - Dynamic 3-Theme System: Light (Ivory), Dark (Forest), Dusk (Sage)    |
|  - Interactive Leaflet Satellite Fire Map with FRP Heat Styling         |
|  - Recharts Daily Fire Activity & Multi-Season Progressions             |
|  - Open-Meteo Meteorological Intelligence Cards                         |
|  - Fire Forecasting Centre with Honest Baseline Skill Scorecard         |
|  - Web Speech API Audio Narration Controller                            |
|  - Complete Security & Scientific Data Integrity Transparency           |
|                                                                         |
+-------------------------------------------------------------------------+
```

## Security Model
- **Zero Frontend Secrets:** No NASA FIRMS API key (`FIRMS_MAP_KEY`) is ever included in frontend code, environment variables for Next.js, or browser payloads.
- **Serverless Resilience:** The Next.js frontend reads versioned JSON artifacts directly from `public/data/` or public raw GitHub URLs, ensuring the site never crashes even during external API maintenance.
- **Geographic Boundary Clipping:** Prevents attribution errors by explicitly filtering out points in Pakistani Punjab west of the Radcliffe Line.

