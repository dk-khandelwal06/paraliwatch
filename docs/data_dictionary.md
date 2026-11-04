# ParaliWatch Data Dictionary (Project 007)

## 1. Satellite Fire Detections (`recent_fires.json`)

Source: NASA FIRMS (VIIRS 375m S-NPP)

| Field | Type | Description | Units / Values |
| :--- | :--- | :--- | :--- |
| `lat` | Float | Latitude of detection center point | Decimal degrees (29.5 to 32.6) |
| `lon` | Float | Longitude of detection center point | Decimal degrees (73.8 to 77.0) |
| `date` | String | Acquisition date of satellite overpass | `YYYY-MM-DD` |
| `time` | String | Acquisition time in UTC | `HHMM` (4-digit UTC) |
| `conf` | String | Sensor detection quality confidence | `nominal`, `high` (`low` filtered out) |
| `frp` | Float | Fire Radiative Power | Megawatts (MW) |
| `dn` | String | Day or Night overpass indicator | `D` (Day, ~13:30 local) or `N` (Night, ~01:30 local) |

## 2. Daily Summary Metrics (`summary.json`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `today_fires` | Integer | Confirmed fire hotspots detected on latest observation date |
| `yesterday_fires` | Integer | Fire hotspots detected on the immediately preceding observation date |
| `daily_change` | Integer | Net difference in daily detected fires (`today - yesterday`) |
| `daily_change_pct` | Float | Percentage change compared to previous observation date |
| `rolling_7d_average` | Float | Unweighted 7-day rolling mean of daily detections |
| `season_cumulative` | Integer | Cumulative detections recorded since October 1 of current season |
| `latest_observation_date`| String | Date of latest satellite data acquired by FIRMS |
| `pipeline_run_time` | String | Timestamp when the automated pipeline executed |

## 3. Weather Covariates (`weather.json`)

Source: Open-Meteo Historical Weather API

| Field | Type | Description | Units |
| :--- | :--- | :--- | :--- |
| `temp_mean` | Float | Daily mean 2-meter air temperature | °C |
| `temp_max` | Float | Daily maximum 2-meter air temperature | °C |
| `temp_min` | Float | Daily minimum 2-meter air temperature | °C |
| `precip_sum` | Float | Daily total precipitation | millimeters (mm) |
| `wind_speed_max`| Float | Daily maximum 10-meter wind speed | km/h |

## 4. Machine Learning & Forecasting (`forecast_history.json`, `evaluation_report.json`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `target_next_day_log`| Float | Predicted quantity: $\ln(1 + \text{fire\_count}_{t+1})$ |
| `predicted_count` | Float | Next-day fire forecast: $\exp(\hat{y}) - 1$ |
| `baseline_persistence` | Float | Baseline 1 prediction: $\hat{y}_{t+1} = y_t$ (tomorrow equals today) |
| `baseline_rolling7d` | Float | Baseline 2 prediction: $\hat{y}_{t+1} = \frac{1}{7}\sum_{i=0}^6 y_{t-i}$ |
| `skill_vs_persistence` | Float | Relative forecasting skill: $1 - \frac{\text{MAE}_{\text{model}}}{\text{MAE}_{\text{persistence}}}$ |
