"use client";

import React from "react";
import {
  BrainCircuit,
  Radio,
  Calendar,
  Target,
  BarChart,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { ForecastHistoryData, EvaluationReport } from "@/lib/types";

interface ForecastingCentreProps {
  forecastData: ForecastHistoryData | null;
  evalReport: EvaluationReport | null;
}

export const ForecastingCentre: React.FC<ForecastingCentreProps> = ({
  forecastData,
  evalReport,
}) => {
  const latestForecast = forecastData?.latest_forecast;
  const metrics = evalReport?.test_season_evaluation;
  const coefs = evalReport?.feature_coefficients || {};

  const skill = metrics?.skill_vs_persistence ?? -0.65;
  const modelBeatsPersistence = skill > 0;

  return (
    <section id="forecasting" className="py-16 border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-color)] pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-[var(--accent-green)]">
              <span>CHAPTER 06</span>
              <span className="text-[var(--text-muted)]">&bull;</span>
              <span>MACHINE LEARNING INTELLIGENCE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Fire Forecasting Centre
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
              Next-day fire count prediction formulated on <strong className="text-[var(--text-primary)] font-semibold">log(1 + Count)</strong> Ridge Regression,
              strictly evaluated against persistence baselines.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-xs font-mono text-[var(--text-secondary)] shadow-sm">
            <BrainCircuit className="w-4 h-4 text-[var(--accent-amber)]" />
            <span>Algorithm: Ridge Regression (α=1.5)</span>
          </div>
        </div>

        {/* Primary Forecast Showcase Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Tomorrow's Prediction Card */}
          <div className="lg:col-span-7 rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-surface-elevated)] p-8 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent-amber)]">
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>NEXT-DAY STATISTICAL ESTIMATE</span>
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  Target: {latestForecast?.target_date ?? "Tomorrow"}
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase font-mono tracking-wider text-[var(--text-muted)]">
                  Predicted Fire Hotspots in Punjab
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl sm:text-6xl font-black font-mono text-[var(--text-primary)] tracking-tight">
                    {latestForecast?.predicted_count ?? "107.3"}
                  </span>
                  <span className="text-base font-mono text-[var(--text-secondary)] font-medium">
                    detected fires
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] pt-1">
                  <span>Estimated Interval:</span>
                  <strong className="text-[var(--text-primary)] font-semibold">
                    [{latestForecast?.prediction_lower ?? "72.4"} &ndash; {latestForecast?.prediction_upper ?? "142.2"}] fires
                  </strong>
                </div>
              </div>
            </div>

            {/* Baseline Comparisons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--border-color)]">
              <div className="p-3.5 rounded-xl border border-[var(--border-color-subtle)] bg-[var(--bg-surface)] space-y-1">
                <span className="text-[11px] uppercase font-mono text-[var(--text-muted)]">
                  Baseline 1: Persistence
                </span>
                <div className="text-xl font-bold font-mono text-[var(--text-primary)]">
                  {latestForecast?.baseline_persistence ?? "150.0"} fires
                </div>
                <p className="text-[10px] text-[var(--text-muted)] font-mono">
                  Assuming tomorrow equals today
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[var(--border-color-subtle)] bg-[var(--bg-surface)] space-y-1">
                <span className="text-[11px] uppercase font-mono text-[var(--text-muted)]">
                  Baseline 2: 7-Day Average
                </span>
                <div className="text-xl font-bold font-mono text-[var(--text-primary)]">
                  {latestForecast?.baseline_rolling7d ?? "106.9"} fires
                </div>
                <p className="text-[10px] text-[var(--text-muted)] font-mono">
                  Rolling moving average
                </p>
              </div>
            </div>

            {/* Scientific Caveat Label */}
            <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-[var(--text-muted)] font-mono leading-relaxed">
              <strong className="text-[var(--accent-amber)] font-semibold">Statistically honest disclosure:</strong>{" "}
              {latestForecast?.disclaimer ?? "Statistical estimate based on satellite lags and weather covariates. Not a guaranteed outcome."}
            </div>
          </div>

          {/* Right Column: Model Specs & Feature Importance */}
          <div className="lg:col-span-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-color-subtle)] pb-3">
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                  Model Architecture & Features
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[var(--accent-green)]/10 text-[var(--accent-green)] font-semibold">
                  v1.2.0-VIIRS
                </span>
              </div>

              {/* Feature Coefficients Bar */}
              <div className="space-y-3 font-mono text-xs">
                <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] block">
                  Ridge Feature Coefficients (Standardized)
                </span>

                <div className="space-y-2">
                  {Object.entries(coefs).slice(0, 6).map(([feat, coef]) => {
                    const isPositive = coef >= 0;
                    const magnitude = Math.min(100, Math.abs(coef) * 120);

                    return (
                      <div key={feat} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[var(--text-secondary)] font-medium">{feat}</span>
                          <span className={isPositive ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                            {isPositive ? "+" : ""}{coef.toFixed(3)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--bg-surface-elevated)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isPositive ? "bg-emerald-500" : "bg-amber-500"}`}
                            style={{ width: `${magnitude}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Offline Season Holdout Metrics Table */}
            <div className="p-4 rounded-xl border border-[var(--border-color-subtle)] bg-[var(--bg-surface-elevated)] space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold border-b border-[var(--border-color-subtle)] pb-1.5">
                <span>Holdout Benchmark (Season 2025)</span>
                <span>MAE (fires)</span>
              </div>

              <div className="flex items-center justify-between text-[var(--text-primary)]">
                <span>Ridge Regression:</span>
                <span className="font-bold">{metrics?.model_mae ?? "265.9"}</span>
              </div>
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Persistence Baseline (Tomorrow = Today):</span>
                <span className="font-bold">{metrics?.persistence_mae ?? "160.5"}</span>
              </div>
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>7-Day Rolling Baseline:</span>
                <span className="font-bold">{metrics?.rolling7d_mae ?? "320.1"}</span>
              </div>

              <div className="pt-2 border-t border-[var(--border-color-subtle)] flex items-center justify-between text-[11px]">
                <span className="text-[var(--text-muted)]">Skill vs Persistence:</span>
                <span className={modelBeatsPersistence ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                  {metrics?.skill_vs_persistence !== undefined ? `${(metrics.skill_vs_persistence * 100).toFixed(1)}%` : "-65.6%"}
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

