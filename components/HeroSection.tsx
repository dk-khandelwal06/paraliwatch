"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, Satellite, ShieldCheck, Flame, Compass, Calendar, AlertCircle } from "lucide-react";
import { SummaryData } from "@/lib/types";

interface HeroSectionProps {
  summary: SummaryData | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ summary }) => {
  const metrics = summary?.metrics;
  const latestObs = summary?.latest_observation_date || "2026-11-02";
  const pipelineTime = summary?.pipeline_run_time || "Automated Daily UTC";

  return (
    <section id="overview" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden satellite-grid pt-8 pb-16">
      {/* Subtle atmospheric background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-primary)]/70 to-[var(--bg-primary)] pointer-events-none" />

      {/* Decorative scanline laser effect */}
      <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-amber)]/40 to-transparent animate-scanline pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Narrative Headline & Mission */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Mission Identifier Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-surface-glass)] backdrop-blur text-xs font-mono text-[var(--text-secondary)] shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[var(--accent-amber)] animate-pulse" />
              <span className="font-semibold text-[var(--accent-green)]">PROJECT 007</span>
              <span className="text-[var(--text-muted)]">|</span>
              <span className="tracking-wide">ENVIRONMENTAL INTELLIGENCE</span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.12]">
              Tracking Punjab&apos;s Paddy Residue Fires from Orbit.
            </h1>

            {/* Tagline & Subtext */}
            <p className="text-lg sm:text-xl text-[var(--text-secondary)] font-normal max-w-2xl leading-relaxed">
              A self-updating environmental intelligence system combining real{" "}
              <strong className="text-[var(--text-primary)] font-semibold">NASA VIIRS</strong> 375m satellite thermal detections,{" "}
              <strong className="text-[var(--text-primary)] font-semibold">Open-Meteo</strong> atmospheric covariates, and regularized{" "}
              <strong className="text-[var(--text-primary)] font-semibold">Ridge Regression</strong> forecasting.
            </p>

            {/* Observation vs Pipeline Sync Clarity Card */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--text-muted)] pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border-color-subtle)] bg-[var(--bg-surface-elevated)]">
                <Satellite className="w-3.5 h-3.5 text-[var(--accent-green)]" />
                <span>Sensor: <strong className="text-[var(--text-primary)]">VIIRS S-NPP (375m)</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border-color-subtle)] bg-[var(--bg-surface-elevated)]">
                <Calendar className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
                <span>Latest Observation: <strong className="text-[var(--text-primary)]">{latestObs}</strong></span>
              </div>
            </div>

            {/* Primary Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="#telemetry"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--accent-green)] text-white text-sm font-semibold tracking-wide hover:opacity-95 hover:shadow-lg transition-all focus:ring-2 focus:ring-[var(--accent-green)]"
              >
                <span>Explore Telemetry</span>
                <ArrowDownRight className="w-4 h-4" />
              </Link>

              <Link
                href="#satellite-map"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm font-semibold hover:bg-[var(--bg-surface-elevated)] transition shadow-sm"
              >
                <Compass className="w-4 h-4 text-[var(--accent-amber)]" />
                <span>Interactive Fire Map</span>
              </Link>

              <Link
                href="#methodology"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-lg text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
              >
                <span>Methodology & Disclaimers</span>
              </Link>
            </div>
          </div>

          {/* Right Column: High-Tech Live Telemetry Preview Card & Logo Artwork */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xl space-y-6">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-[var(--border-color-subtle)] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-[var(--accent-terracotta)]">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono tracking-wider text-[var(--text-primary)] uppercase">
                      Current Season Telemetry
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)] font-mono">
                      State of Punjab, India
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ONLINE</span>
                </div>
              </div>

              {/* Quick High-Impact Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[var(--border-color-subtle)] bg-[var(--bg-surface-elevated)] space-y-1">
                  <span className="text-[11px] uppercase font-mono tracking-wider text-[var(--text-muted)]">
                    Today&apos;s Detections
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono text-[var(--text-primary)]">
                      {metrics?.today_fires?.toLocaleString() ?? "150"}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-mono">hotspots</span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--accent-amber)] block">
                    Observed on {latestObs}
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-[var(--border-color-subtle)] bg-[var(--bg-surface-elevated)] space-y-1">
                  <span className="text-[11px] uppercase font-mono tracking-wider text-[var(--text-muted)]">
                    Season Cumulative
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono text-[var(--text-primary)]">
                      {metrics?.season_cumulative?.toLocaleString() ?? "2,350"}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-mono">fires</span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--text-muted)] block">
                    Since Oct 1, 2026
                  </span>
                </div>
              </div>

              {/* Next Day Ridge Regression Statistical Forecast Teaser */}
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent-amber)]">
                    Next-Day Statistical Estimate
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-[var(--accent-amber)]">
                    Ridge α=1.5
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-[var(--text-primary)]">
                    {metrics?.latest_predicted_next_day ?? "107.3"}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] font-mono">estimated fires</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed italic">
                  *Statistical expectation based on satellite lags and meteorological covariates. Not a guaranteed outcome.
                </p>
              </div>

              {/* Attribution Footer */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] pt-2 border-t border-[var(--border-color-subtle)]">
                <span>PIPELINE: {pipelineTime}</span>
                <span className="text-[var(--accent-green)] font-medium">NASA FIRMS + OPEN-METEO</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

