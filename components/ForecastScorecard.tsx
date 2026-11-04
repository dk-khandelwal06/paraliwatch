"use client";

import React from "react";
import {
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Scale,
  Sparkles,
} from "lucide-react";
import { ForecastHistoryData, EvaluationReport } from "@/lib/types";

interface ForecastScorecardProps {
  forecastData: ForecastHistoryData | null;
  evalReport: EvaluationReport | null;
}

export const ForecastScorecard: React.FC<ForecastScorecardProps> = ({
  forecastData,
  evalReport,
}) => {
  const predictions = forecastData?.predictions || [];
  const scorecard = forecastData?.scorecard_summary;
  const evaluatedCount = scorecard?.evaluated_predictions ?? 0;

  return (
    <section className="py-16 border-t border-[var(--border-color)] bg-[var(--bg-surface-elevated)]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-color)] pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-[var(--accent-green)]">
              <span>PROSPECTIVE VERIFICATION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Forecast Performance Scorecard
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
              An unalterable audit log matching forward-looking predictions made prior to the event
              against actual subsequent satellite observations.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-xs font-mono text-[var(--text-muted)] shadow-sm">
            <Scale className="w-4 h-4 text-[var(--accent-green)]" />
            <span>Immutable Prospective Tracking</span>
          </div>
        </div>

        {/* Scorecard Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-1 font-mono">
            <span className="text-xs uppercase text-[var(--text-muted)] font-semibold">
              Predictions Logged
            </span>
            <div className="text-3xl font-black text-[var(--text-primary)]">
              {scorecard?.total_predictions ?? predictions.length}
            </div>
            <span className="text-[11px] text-[var(--text-muted)] block">
              {evaluatedCount} evaluated with actual satellite overpass
            </span>
          </div>

          <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-1 font-mono">
            <span className="text-xs uppercase text-[var(--text-muted)] font-semibold">
              Prospective Model MAE
            </span>
            <div className="text-3xl font-black text-[var(--text-primary)]">
              {scorecard?.scorecard_mae_model !== null && scorecard?.scorecard_mae_model !== undefined
                ? `${scorecard.scorecard_mae_model} fires`
                : "Awaiting Next Sync"}
            </div>
            <span className="text-[11px] text-[var(--text-muted)] block">
              Mean absolute error of recorded predictions
            </span>
          </div>

          <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-1 font-mono">
            <span className="text-xs uppercase text-[var(--text-muted)] font-semibold">
              Skill vs Persistence
            </span>
            <div className="text-3xl font-black text-[var(--accent-amber)]">
              {scorecard?.scorecard_skill !== null && scorecard?.scorecard_skill !== undefined
                ? `${(scorecard.scorecard_skill * 100).toFixed(1)}%`
                : "Awaiting Overpass"}
            </div>
            <span className="text-[11px] text-[var(--text-muted)] block">
              Relative skill on live prospective forecasts
            </span>
          </div>
        </div>

        {/* Prediction Audit Table or Explanatory Empty State */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-md overflow-hidden">
          <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
            <span className="font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Prospective Predictions Log
            </span>
            <span className="text-[var(--text-muted)]">
              Zero retrospective overwrites
            </span>
          </div>

          {predictions.length === 0 ? (
            <div className="p-12 text-center space-y-3 font-mono">
              <Clock className="w-8 h-8 text-[var(--text-muted)] mx-auto animate-pulse" />
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                No prospective forecast records logged yet.
              </div>
              <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                As the automated daily pipeline runs before each day&apos;s overpass, predictions will be permanently
                logged here and scored when corresponding FIRMS data arrives.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="border-b border-[var(--border-color-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] uppercase">
                  <tr>
                    <th className="py-3 px-4">Forecast ID</th>
                    <th className="py-3 px-4">Generated (UTC)</th>
                    <th className="py-3 px-4">Target Date</th>
                    <th className="py-3 px-4">Predicted (Fires)</th>
                    <th className="py-3 px-4">Persistence Baseline</th>
                    <th className="py-3 px-4">Observed Actual</th>
                    <th className="py-3 px-4">Model Abs Error</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color-subtle)] text-[var(--text-secondary)]">
                  {predictions.map((p) => (
                    <tr key={p.forecast_id} className="hover:bg-[var(--bg-surface-elevated)]/50 transition">
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                        {p.forecast_id}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-muted)]">
                        {p.generated_at}
                      </td>
                      <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                        {p.target_date}
                      </td>
                      <td className="py-3 px-4 font-bold text-[var(--accent-amber)]">
                        {p.predicted_count}
                      </td>
                      <td className="py-3 px-4">
                        {p.baseline_persistence}
                      </td>
                      <td className="py-3 px-4 font-bold text-[var(--text-primary)]">
                        {p.actual_observed_count !== null ? p.actual_observed_count : "Pending Overpass"}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {p.absolute_error_model !== null ? (
                          <span className={p.absolute_error_model < (p.absolute_error_persistence ?? 999) ? "text-emerald-500" : "text-amber-500"}>
                            {p.absolute_error_model}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">&ndash;</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {p.is_evaluated ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                            <CheckCircle2 className="w-3 h-3" /> EVALUATED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">
                            <Clock className="w-3 h-3" /> PENDING ACTUAL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

