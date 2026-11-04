import { promises as fs } from "fs";
import path from "path";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { CommandCentre } from "@/components/CommandCentre";
import { SatelliteMap } from "@/components/SatelliteMap";
import { DailyActivityChart } from "@/components/DailyActivityChart";
import { SeasonalComparisonChart } from "@/components/SeasonalComparisonChart";
import { WeatherIntelligence } from "@/components/WeatherIntelligence";
import { ForecastingCentre } from "@/components/ForecastingCentre";
import { ForecastScorecard } from "@/components/ForecastScorecard";
import { MethodologySection } from "@/components/MethodologySection";
import { SecuritySection } from "@/components/SecuritySection";
import { AboutSection } from "@/components/AboutSection";
import { Footer } from "@/components/Footer";
import {
  SummaryData,
  FireDetection,
  DailyActivityItem,
  SeasonalComparisonData,
  WeatherData,
  ForecastHistoryData,
  EvaluationReport,
} from "@/lib/types";

// Helper to safely read JSON from public/data/
async function readPublicJson<T>(filename: string): Promise<T | null> {
  try {
    const filePath = path.join(process.cwd(), "public", "data", filename);
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch (err) {
    console.warn(`[page.tsx] Could not read ${filename}:`, err);
    return null;
  }
}

export default async function HomePage() {
  const [
    summary,
    recentFires,
    dailyActivity,
    seasonalComparison,
    weatherData,
    forecastData,
    evalReport,
  ] = await Promise.all([
    readPublicJson<SummaryData>("summary.json"),
    readPublicJson<FireDetection[]>("recent_fires.json"),
    readPublicJson<DailyActivityItem[]>("daily_activity.json"),
    readPublicJson<SeasonalComparisonData>("seasonal_comparison.json"),
    readPublicJson<WeatherData>("weather.json"),
    readPublicJson<ForecastHistoryData>("forecast_history.json"),
    readPublicJson<EvaluationReport>("evaluation_report.json"),
  ]);

  return (
    <main className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Sticky Global Navigation */}
      <Navigation
        lastUpdated={summary?.pipeline_run_time}
        latestObsDate={summary?.latest_observation_date}
      />

      {/* Chapter 01 & 02: Hero Overview */}
      <HeroSection summary={summary} />

      {/* Chapter 03: Telemetry Command Centre */}
      <CommandCentre summary={summary} />

      {/* Chapter 04: Interactive Satellite Fire Map */}
      <SatelliteMap
        fires={recentFires || []}
        latestObsDate={summary?.latest_observation_date}
      />

      {/* Chapter 05: Daily Progression & Multi-Year Benchmarks */}
      <DailyActivityChart data={dailyActivity || []} />
      <SeasonalComparisonChart data={seasonalComparison || {}} />

      {/* Meteorological State: Open-Meteo Covariates */}
      <WeatherIntelligence weather={weatherData} />

      {/* Chapter 06: Fire Forecasting Centre (Ridge Regression) */}
      <ForecastingCentre
        forecastData={forecastData}
        evalReport={evalReport}
      />

      {/* Prospective Scorecard: Historical Predictions vs Subsequent Actuals */}
      <ForecastScorecard
        forecastData={forecastData}
        evalReport={evalReport}
      />

      {/* Chapter 07: Provenance & Methodology */}
      <MethodologySection />

      {/* Security & System Integrity */}
      <SecuritySection summary={summary} />

      {/* About ParaliWatch Mission & Limitations */}
      <AboutSection />

      {/* Scientific Footer */}
      <Footer />
    </main>
  );
}
