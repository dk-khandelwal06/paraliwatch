"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { DailyActivityItem } from "@/lib/types";
import { useTheme } from "./ThemeProvider";
import { Calendar, BarChart2, Flame, TrendingUp, Maximize2 } from "lucide-react";

interface DailyActivityChartProps {
  data: DailyActivityItem[];
}

export const DailyActivityChart: React.FC<DailyActivityChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const [rangeFilter, setRangeFilter] = useState<"all" | "14d" | "7d">("all");

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (rangeFilter === "7d") return data.slice(-7);
    if (rangeFilter === "14d") return data.slice(-14);
    return data;
  }, [data, rangeFilter]);

  // Peak fire day
  const peakDay = useMemo(() => {
    if (!data || data.length === 0) return null;
    return [...data].sort((a, b) => b.fire_count - a.fire_count)[0];
  }, [data]);

  // Chart theme colors
  const colors = useMemo(() => {
    if (theme === "dark") {
      return {
        bar: "#f97316",
        line: "#22c55e",
        grid: "#1e3325",
        text: "#a3b8aa",
        tooltipBg: "#0f1c14",
        tooltipBorder: "#1e3325",
      };
    } else if (theme === "dusk") {
      return {
        bar: "#e09f3e",
        line: "#5a8a68",
        grid: "#38423c",
        text: "#b0aba2",
        tooltipBg: "#222724",
        tooltipBorder: "#38423c",
      };
    } else {
      return {
        bar: "#c25e3d",
        line: "#2e5b38",
        grid: "#e5ded5",
        text: "#536357",
        tooltipBg: "#ffffff",
        tooltipBorder: "#e5ded5",
      };
    }
  }, [theme]);

  if (!data || data.length === 0) {
    return (
      <div className="p-12 text-center border border-[var(--border-color)] rounded-xl bg-[var(--bg-surface)] text-[var(--text-muted)] font-mono">
        No daily activity observations available yet.
      </div>
    );
  }

  return (
    <section id="trends" className="py-16 border-t border-[var(--border-color)] bg-[var(--bg-surface-elevated)]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-color)] pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-[var(--accent-green)]">
              <span>CHAPTER 05</span>
              <span className="text-[var(--text-muted)]">&bull;</span>
              <span>DAILY PROGRESSION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Daily Fire Activity & 7-Day Trend
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
              Chronological daily detection totals observed by VIIRS across the 2026 burning season,
              contrasted against the 7-day rolling baseline.
            </p>
          </div>

          {/* Range Buttons & Peak Highlight */}
          <div className="flex flex-wrap items-center gap-3">
            {peakDay && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-xs font-mono text-[var(--accent-amber)] font-medium">
                <Flame className="w-3.5 h-3.5" />
                <span>Peak: {peakDay.fire_count} on {peakDay.date}</span>
              </div>
            )}

            <div className="flex items-center p-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] font-mono text-xs">
              {(["all", "14d", "7d"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRangeFilter(r)}
                  className={`px-3 py-1 rounded font-medium transition ${
                    rangeFilter === r
                      ? "bg-[var(--accent-green)] text-white shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {r === "all" ? "Season" : r === "14d" ? "14 Days" : "7 Days"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Analytical Chart Card */}
        <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-md space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)] pb-2">
            <span className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded bg-[var(--accent-terracotta)]" />
              <span>Daily Count</span>
              <span className="inline-block w-4 h-0.5 bg-[var(--accent-green)] ml-3" />
              <span>7-Day Rolling Average</span>
            </span>
            <span className="text-[var(--text-muted)]">Source: NASA FIRMS VIIRS</span>
          </div>

          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={filteredData}
                margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
              >
                <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke={colors.text}
                  fontSize={11}
                  fontFamily="monospace"
                  tickLine={false}
                  tickFormatter={(val: string) => val.slice(5)} // MM-DD
                />
                <YAxis
                  stroke={colors.text}
                  fontSize={11}
                  fontFamily="monospace"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div
                          style={{
                            backgroundColor: colors.tooltipBg,
                            borderColor: colors.tooltipBorder,
                          }}
                          className="p-3 rounded-xl border shadow-xl text-xs font-mono space-y-1.5"
                        >
                          <div className="font-bold text-[var(--text-primary)] border-b border-[var(--border-color-subtle)] pb-1">
                            {label}
                          </div>
                          <div className="flex items-center justify-between gap-4 text-orange-500 font-semibold">
                            <span>Daily Fire Count:</span>
                            <span>{payload[0]?.value}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-emerald-600 font-semibold">
                            <span>7-Day Moving Avg:</span>
                            <span>{payload[1]?.value}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="fire_count"
                  name="Daily Fires"
                  fill={colors.bar}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Line
                  type="monotone"
                  dataKey="rolling_7d"
                  name="7-Day Avg"
                  stroke={colors.line}
                  strokeWidth={2.5}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </section>
  );
};
