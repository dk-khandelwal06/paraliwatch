"use client";

import React from "react";
import {
  Flame,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Layers,
  Sparkles,
  Info,
  Radio,
} from "lucide-react";
import { SummaryData } from "@/lib/types";

interface CommandCentreProps {
  summary: SummaryData | null;
}

export const CommandCentre: React.FC<CommandCentreProps> = ({ summary }) => {
  const m = summary?.metrics;
  const latestObs = summary?.latest_observation_date || "2026-11-02";
  const pipelineTime = summary?.pipeline_run_time || "Automated Daily UTC";

  const isPositiveChange = (m?.daily_change ?? 0) >= 0;

  const statCards = [
    {
      label: "Today's Active Fires",
      value: m?.today_fires?.toLocaleString() ?? "150",
      unit: "hotspots",
      subtext: `Satellite observation date: ${latestObs}`,
      icon: <Flame className="w-5 h-5 text-amber-500" />,
      accent: "border-amber-500/20",
      highlight: true,
    },
    {
      label: "Previous Day",
      value: m?.yesterday_fires?.toLocaleString() ?? "132",
      unit: "hotspots",
      subtext: "Immediately preceding observation",
      icon: <Layers className="w-5 h-5 text-[var(--text-muted)]" />,
      accent: "border-[var(--border-color)]",
    },
    {
      label: "Daily Change",
      value: `${isPositiveChange ? "+" : ""}${m?.daily_change ?? 18}`,
      unit: `(${m?.daily_change_pct ?? 13.6}%)`,
      subtext: isPositiveChange ? "Increase over previous day" : "Decrease over previous day",
      icon: isPositiveChange ? (
        <TrendingUp className="w-5 h-5 text-[var(--accent-terracotta)]" />
      ) : (
        <TrendingDown className="w-5 h-5 text-[var(--accent-green)]" />
      ),
      accent: isPositiveChange ? "border-orange-500/20" : "border-emerald-500/20",
    },
    {
      label: "7-Day Rolling Average",
      value: m?.rolling_7d_average?.toLocaleString() ?? "106.9",
      unit: "fires / day",
      subtext: "Smoothed activity trend",
      icon: <BarChart3 className="w-5 h-5 text-[var(--accent-green)]" />,
      accent: "border-[var(--border-color)]",
    },
    {
      label: "Current Season Cumulative",
      value: m?.season_cumulative?.toLocaleString() ?? "2,350",
      unit: "fires recorded",
      subtext: "Since October 1, 2026",
      icon: <Sparkles className="w-5 h-5 text-[var(--accent-amber)]" />,
      accent: "border-[var(--border-color)]",
    },
    {
      label: "Next-Day Statistical Estimate",
      value: m?.latest_predicted_next_day?.toLocaleString() ?? "107.3",
      unit: "fires (Ridge α=1.5)",
      subtext: "Target: Tomorrow",
      icon: <Radio className="w-5 h-5 text-indigo-400" />,
      accent: "border-indigo-500/20",
    },
    {
      label: "Observation Window",
      value: latestObs,
      unit: "UTC Overpass",
      subtext: "VIIRS S-NPP nominal & high conf",
      icon: <Calendar className="w-5 h-5 text-[var(--text-muted)]" />,
      accent: "border-[var(--border-color)]",
    },
    {
      label: "Pipeline Execution",
      value: pipelineTime.split(" ")[0] || "Daily",
      unit: pipelineTime.split(" ")[1] || "UTC",
      subtext: "GitHub Actions automated runner",
      icon: <Clock className="w-5 h-5 text-[var(--text-muted)]" />,
      accent: "border-[var(--border-color)]",
    },
  ];

  return (
    <section id="telemetry" className="py-16 border-t border-[var(--border-color)] bg-[var(--bg-surface-elevated)]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-color)] pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-[var(--accent-green)]">
              <span>CHAPTER 03</span>
              <span className="text-[var(--text-muted)]">&bull;</span>
              <span>ENVIRONMENTAL TELEMETRY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Command Centre
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
              Real-time spatial telemetry aggregated from NASA FIRMS VIIRS detections across the Punjab agricultural belt.
            </p>
          </div>

          {/* Precision Timing Distinction Banner */}
          <div className="p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-xs font-mono text-[var(--text-muted)] space-y-1 max-w-md shadow-sm">
            <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-semibold">
              <Info className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
              <span>Temporal Integrity Distinction</span>
            </div>
            <p className="leading-relaxed">
              <strong className="text-[var(--text-secondary)]">Observation Date ({latestObs})</strong> is when the satellite scanned the earth.{" "}
              <strong className="text-[var(--text-secondary)]">Pipeline Sync</strong> is when our cloud process ingested the data.
            </p>
          </div>
        </div>

        {/* 8-Card Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card, idx) => (
            <div
              key={card.label}
              className={`p-5 rounded-xl border bg-[var(--bg-surface)] shadow-sm hover:shadow-md transition-all duration-200 space-y-3 ${card.accent}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono tracking-wider font-semibold text-[var(--text-secondary)]">
                  {card.label}
                </span>
                <div className="p-1.5 rounded-md bg-[var(--bg-surface-elevated)]">
                  {card.icon}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-[var(--text-primary)] tracking-tight">
                    {card.value}
                  </span>
                  <span className="text-xs font-mono text-[var(--text-muted)] font-medium">
                    {card.unit}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[var(--text-muted)]">
                  {card.subtext}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
