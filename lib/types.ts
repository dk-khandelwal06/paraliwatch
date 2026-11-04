export type ThemeMode = "light" | "dark" | "dusk";

export interface SummaryData {
  project: string;
  project_number: string;
  tagline: string;
  pipeline_run_time: string;
  latest_observation_date: string;
  satellite_sensor: string;
  system_status: string;
  data_freshness: string;
  study_region: string;
  metrics: {
    today_fires: number;
    yesterday_fires: number;
    daily_change: number;
    daily_change_pct: number;
    rolling_7d_average: number;
    season_cumulative: number;
    total_all_seasons_recorded: number;
    latest_predicted_next_day: number;
  };
  integrity: {
    server_side_credentials: boolean;
    no_client_secrets: boolean;
    boundary_clipping_active: boolean;
    duplicate_detection_passed: boolean;
    idempotent_pipeline: boolean;
    validation_status: string;
  };
}

export interface FireDetection {
  lat: number;
  lon: number;
  date: string;
  time: string;
  conf: string;
  frp: number;
  dn: string;
}

export interface DailyActivityItem {
  date: string;
  fire_count: number;
  rolling_7d: number;
}

export interface SeasonDayItem {
  day_of_season: number;
  date: string;
  daily_count: number;
  cumulative_count: number;
}

export type SeasonalComparisonData = Record<string, SeasonDayItem[]>;

export interface WeatherStationDetail {
  lat: number;
  lon: number;
  elev: number;
}

export interface WeatherDayRegional {
  date: string;
  temp_mean: number;
  temp_max: number;
  temp_min: number;
  precip_sum: number;
  wind_speed_max: number;
}

export interface WeatherData {
  stations: string[];
  latest_date: string;
  daily_regional: WeatherDayRegional[];
  station_details: Record<string, WeatherStationDetail>;
  attribution: string;
}

export interface ProspectivePrediction {
  forecast_id: string;
  generated_at: string;
  observation_date: string;
  target_date: string;
  predicted_count: number;
  prediction_lower: number;
  prediction_upper: number;
  baseline_persistence: number;
  baseline_rolling7d: number;
  today_observed_count: number;
  model_name: string;
  model_version: string;
  is_statistical_estimate: boolean;
  disclaimer: string;
  actual_observed_count: number | null;
  absolute_error_model: number | null;
  absolute_error_persistence: number | null;
  is_evaluated: boolean;
}

export interface ForecastHistoryData {
  last_updated: string;
  latest_forecast: ProspectivePrediction;
  scorecard_summary: {
    total_predictions: number;
    evaluated_predictions: number;
    scorecard_mae_model: number | null;
    scorecard_mae_persistence: number | null;
    scorecard_skill: number | null;
  };
  predictions: ProspectivePrediction[];
}

export interface EvaluationReport {
  report_generated_at: string;
  model_architecture: {
    algorithm: string;
    regularization_strength_alpha: number;
    target_transformation: string;
    validation_method: string;
    features_used: string[];
  };
  test_season_evaluation: {
    model_mae: number;
    model_rmse: number;
    model_r2: number;
    persistence_mae: number;
    persistence_rmse: number;
    rolling7d_mae: number;
    rolling7d_rmse: number;
    skill_vs_persistence: number;
    skill_percentage: number;
  };
  feature_coefficients: Record<string, number>;
  prospective_scorecard: {
    total_predictions: number;
    evaluated_predictions: number;
    scorecard_mae_model: number | null;
    scorecard_mae_persistence: number | null;
    scorecard_skill: number | null;
  };
  scientific_honesty_statement: string;
}

