"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { SeasonalComparisonData } from "@/lib/types";
import { useTheme } from "./ThemeProvider";
import { History, TrendingUp, Layers, Info } from "lucide-react";

interface SeasonalComparisonProps {
  data: SeasonalComparisonData;
}

export const SeasonalComparisonChart: React.FC<SeasonalComparisonProps> = ({ data }) => {
  const { theme } = useTheme();
  const [metricMode, setMetricMode] = useState<"cumulative" | "daily">("cumulative");

  // Format data aligned by day_of_season (1 to 61)
  const chartData = useMemo(() => {
    const daysMap: Record<number, any> = {};

    for (let d = 1; d <= 61; d++) {
      daysMap[d] = { day_of_season: d };
    }

    Object.entries(data).forEach(([year, list]) => {
      list.forEach((item) => {
        if (daysMap[item.day_of_season]) {
          daysMap[item.day_of_season][`count_${year}`] =
            metricMode === "cumulative" ? item.cumulative_count : item.daily_count;
          daysMap[item.day_of_season][`date_${year}`] = item.date;
        }
      });
    });

    return Object.values(daysMap);
  }, [data, metricMode]);

  const yearColors: Record<string, string> = {
    "2023": "#94a3b8", // Slate / Light grey
    "2024": "#64748b", // Medium slate
    "2025": "#3b82f6", // Blue
    "2026": "#f97316", // Vibrant Orange for current season
  };

  const gridColor = theme === "dark" ? "#1e3325" : theme === "dusk" ? "#38423c" : "#e5ded5";
  const textColor = theme === "dark" ? "#a3b8aa" : theme === "dusk" ? "#b0aba2" : "#536357";

  return (
    <section className="py-16 border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-color)] pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-[var(--accent-green)]">
              <span>CHAPTER 05 &bull; HISTORICAL BENCHMARKING</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Seasonal Fire Progression (2023–2026)
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
              Comparative progression across equivalent burning windows (Day 1 = Oct 1).
              Highlights peak burn timing, enforcement policy impacts, and multi-year trajectory.
            </p>
          </div>

          {/* Metric Mode Toggle (Cumulative vs Daily) */}
          <div className="flex items-center p-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] font-mono text-xs shadow-sm">
            <button
              onClick={() => setMetricMode("cumulative")}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                metricMode === "cumulative"
                  ? "bg-[var(--accent-green)] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              Cumulative Trajectory
            </button>
            <button
              onClick={() => setMetricMode("daily")}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                metricMode === "daily"
                  ? "bg-[var(--accent-green)] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              Daily Detection Spikes
            </button>
          </div>
        </div>

        {/* Multi-Year Chart Card */}
        <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-5">
              {Object.keys(data).map((yr) => (
                <div key={yr} className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-1.5 rounded-full"
                    style={{ backgroundColor: yearColors[yr] || "#a855f7" }}
                  />
                  <span className={yr === "2026" ? "font-bold text-[var(--text-primary)]" : "text-[var(--text-muted)]"}>
                    {yr} Season {yr === "2026" ? "(Current — Ongoing)" : "(Complete)"}
                  </span>
                </div>
              ))}
            </div>

            <span className="text-[var(--text-muted)]">Day 1: Oct 1 &bull; Day 61: Nov 30</span>
          </div>

          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
              >
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="day_of_season"
                  stroke={textColor}
                  fontSize={11}
                  fontFamily="monospace"
                  tickLine={false}
                  label={{ value: "Day of Burning Season (Oct 1 to Nov 30)", position: "insideBottom", offset: -10, fill: textColor, fontSize: 11 }}
                />
                <YAxis
                  stroke={textColor}
                  fontSize={11}
                  fontFamily="monospace"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-glass)] backdrop-blur shadow-xl text-xs font-mono space-y-1.5">
                          <div className="font-bold text-[var(--text-primary)] border-b border-[var(--border-color-subtle)] pb-1">
                            Day {label} of Season
                          </div>
                          {payload.map((p) => {
                            const yr = String(p.dataKey).replace("count_", "");
                            return (
                              <div
                                key={yr}
                                className="flex items-center justify-between gap-4 font-medium"
                                style={{ color: p.color }}
                              >
                                <span>{yr} {metricMode === "cumulative" ? "Cumulative" : "Daily"}:</span>
                                <span className="font-bold">{Number(p.value).toLocaleString()}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {Object.keys(data).map((yr) => (
                  <Line
                    key={yr}
                    type="monotone"
                    dataKey={`count_${yr}`}
                    name={yr}
                    stroke={yearColors[yr] || "#a855f7"}
                    strokeWidth={yr === "2026" ? 3 : 1.75}
                    strokeDasharray={yr === "2023" ? "4 4" : undefined}
                    dot={false}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </section>
  );
};

