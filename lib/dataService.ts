import {
  SummaryData,
  FireDetection,
  DailyActivityItem,
  SeasonalComparisonData,
  WeatherData,
  ForecastHistoryData,
  EvaluationReport,
} from "./types";

const DATA_BASE_URL = process.env.NEXT_PUBLIC_DATA_BASE_URL || "";

async function fetchJson<T>(filename: string): Promise<T | null> {
  const url = `${DATA_BASE_URL}/data/${filename}`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      cache: "default",
    });
    if (!res.ok) {
      console.warn(`[dataService] Failed to fetch ${url} (HTTP ${res.status})`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[dataService] Error fetching ${url}:`, err);
    return null;
  }
}

export async function getSummaryData(): Promise<SummaryData | null> {
  return fetchJson<SummaryData>("summary.json");
}

export async function getRecentFires(): Promise<FireDetection[]> {
  const fires = await fetchJson<FireDetection[]>("recent_fires.json");
  return fires || [];
}

export async function getDailyActivity(): Promise<DailyActivityItem[]> {
  const activity = await fetchJson<DailyActivityItem[]>("daily_activity.json");
  return activity || [];
}

export async function getSeasonalComparison(): Promise<SeasonalComparisonData> {
  const seasons = await fetchJson<SeasonalComparisonData>("seasonal_comparison.json");
  return seasons || {};
}

export async function getWeatherData(): Promise<WeatherData | null> {
  return fetchJson<WeatherData>("weather.json");
}

export async function getForecastHistory(): Promise<ForecastHistoryData | null> {
  return fetchJson<ForecastHistoryData>("forecast_history.json");
}

export async function getEvaluationReport(): Promise<EvaluationReport | null> {
  return fetchJson<EvaluationReport>("evaluation_report.json");
}

