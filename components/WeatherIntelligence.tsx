"use client";

import React, { useState } from "react";
import {
  CloudRain,
  Thermometer,
  Wind,
  Compass,
  Calendar,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { WeatherData } from "@/lib/types";
import { useTheme } from "./ThemeProvider";

interface WeatherIntelligenceProps {
  weather: WeatherData | null;
}

export const WeatherIntelligence: React.FC<WeatherIntelligenceProps> = ({ weather }) => {
  const { theme } = useTheme();
  const [selectedStation, setSelectedStation] = useState<string>("Ludhiana");

  if (!weather || !weather.daily_regional || weather.daily_regional.length === 0) {
    return null;
  }

  const latestDay = weather.daily_regional[weather.daily_regional.length - 1];
  const stationDetail = weather.station_details[selectedStation];

  const weatherMetrics = [
    {
      label: "Mean Temperature",
      value: `${latestDay?.temp_mean ?? 24.5}°C`,
      sub: `Min ${latestDay?.temp_min ?? 18}°C / Max ${latestDay?.temp_max ?? 31}°C`,
      icon: <Thermometer className="w-5 h-5 text-amber-500" />,
      note: "Higher diurnal heat accelerates crop-residue drying.",
    },
    {
      label: "24h Precipitation",
      value: `${latestDay?.precip_sum ?? 0.0} mm`,
      sub: latestDay?.precip_sum === 0 ? "Dry harvest conditions" : "Moisture inhibits combustion",
      icon: <CloudRain className="w-5 h-5 text-blue-400" />,
      note: "Rain dramatically suppresses satellite-detected burning.",
    },
    {
      label: "Max 10m Wind Speed",
      value: `${latestDay?.wind_speed_max ?? 12.4} km/h`,
      sub: "Regional boundary layer velocity",
      icon: <Wind className="w-5 h-5 text-teal-400" />,
      note: "High wind promotes rapid stubble fire spread.",
    },
  ];

  return (
    <section id="weather" className="py-16 border-t border-[var(--border-color)] bg-[var(--bg-surface-elevated)]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-color)] pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-[var(--accent-green)]">
              <span>ATMOSPHERIC COVARIATES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Weather Intelligence & Atmospheric State
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
              Surface meteorology recorded across five monitoring hubs in Punjab.
              Used as exogenous features in the Ridge Regression forecasting model.
            </p>
          </div>

          {/* 5-Station Selector Tabs */}
          <div className="flex flex-wrap items-center p-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] font-mono text-xs shadow-sm">
            {weather.stations.map((stn) => (
              <button
                key={stn}
                onClick={() => setSelectedStation(stn)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  selectedStation === stn
                    ? "bg-[var(--accent-green)] text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {stn}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Metric Cards + Station Meta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {weatherMetrics.map((wm) => (
            <div
              key={wm.label}
              className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono tracking-wider font-semibold text-[var(--text-secondary)]">
                  {wm.label}
                </span>
                <div className="p-2 rounded-lg bg-[var(--bg-surface-elevated)]">
                  {wm.icon}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-3xl font-black font-mono text-[var(--text-primary)]">
                  {wm.value}
                </div>
                <div className="text-xs font-mono text-[var(--text-secondary)]">
                  {wm.sub}
                </div>
              </div>

              <p className="text-xs text-[var(--text-muted)] border-t border-[var(--border-color-subtle)] pt-3 leading-relaxed">
                {wm.note}
              </p>
            </div>
          ))}
        </div>

        {/* Selected Station Geolocation Details & Scientific Caveat */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm font-mono text-xs">
          <div className="lg:col-span-6 space-y-2">
            <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
              <Compass className="w-4 h-4 text-[var(--accent-green)]" />
              <span>STATION: {selectedStation.toUpperCase()}, PUNJAB</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[var(--text-secondary)]">
              <span>Latitude: <strong>{stationDetail?.lat.toFixed(4)}° N</strong></span>
              <span>Longitude: <strong>{stationDetail?.lon.toFixed(4)}° E</strong></span>
              <span>Elevation: <strong>{stationDetail?.elev}m MSL</strong></span>
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              Observation window ending: {weather.latest_date} (Asia/Kolkata timezone)
            </div>
          </div>

          <div className="lg:col-span-6 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[var(--accent-amber)]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Scientific Attribution Disclaimer</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Weather variables provide explanatory environmental context for agricultural readiness and smoke dispersion,
              not direct causation of stubble combustion events.
            </p>
          </div>
        </div>

        {/* Attribution Link */}
        <div className="flex items-center justify-end text-xs font-mono text-[var(--text-muted)]">
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[var(--accent-green)] transition"
          >
            <span>{weather.attribution}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </section>
  );
};
