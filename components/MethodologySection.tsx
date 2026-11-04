"use client";

import React from "react";
import {
  Satellite,
  Database,
  Compass,
  BrainCircuit,
  ShieldCheck,
  Flame,
  CloudRain,
  Binary,
} from "lucide-react";

export const MethodologySection: React.FC = () => {
  const steps = [
    {
      title: "1. NASA FIRMS VIIRS Sensing",
      icon: <Satellite className="w-5 h-5 text-[var(--accent-green)]" />,
      text: (
        <>
          We utilize the <strong className="text-[var(--text-primary)]">Visible Infrared Imaging Radiometer Suite (VIIRS)</strong> aboard Suomi-NPP.
          Its 375m I-bands detect thermal anomalies with 3x higher spatial resolution than legacy MODIS 1km, resolving smaller field-edge stubble fires.
        </>
      ),
    },
    {
      title: "2. NRT vs Standard Processing",
      icon: <Database className="w-5 h-5 text-[var(--accent-amber)]" />,
      text: (
        <>
          Near-Real-Time (NRT) data provides rapid 3-hour latency observations for active seasonal monitoring.
          Standard Processing (SP) science quality data is utilized for multi-year historical training (2023–2025) to guarantee calibrated baselines.
        </>
      ),
    },
    {
      title: "3. Boundary & Confidence Filtration",
      icon: <Compass className="w-5 h-5 text-indigo-400" />,
      text: (
        <>
          Detections are restricted to <strong className="text-[var(--text-primary)]">nominal</strong> and <strong className="text-[var(--text-primary)]">high</strong> confidence,
          eliminating false alarms from solar glint. A piecewise polygon clips detections strictly to Indian Punjab, preventing attribution of Pakistani Punjab fires.
        </>
      ),
    },
    {
      title: "4. Fire Radiative Power (FRP)",
      icon: <Flame className="w-5 h-5 text-[var(--accent-terracotta)]" />,
      text: (
        <>
          FRP measures the instantaneous radiant energy output in Megawatts (MW). While correlated with biomass combustion rate,
          it represents thermal radiation at overpass time, not overall crop-residue fire severity or land ownership.
        </>
      ),
    },
    {
      title: "5. Open-Meteo Meteorology",
      icon: <CloudRain className="w-5 h-5 text-blue-400" />,
      text: (
        <>
          Daily surface weather is aggregated across five representative monitoring stations (Amritsar, Ludhiana, Patiala, Sangrur, Bathinda).
          Precipitation, wind speed, and temperatures provide exogenous environmental covariates.
        </>
      ),
    },
    {
      title: "6. Ridge Regression & Baselines",
      icon: <BrainCircuit className="w-5 h-5 text-purple-400" />,
      text: (
        <>
          We train regularized Ridge Regression (<strong className="text-[var(--text-primary)]">α = 1.5</strong>) to predict <strong className="text-[var(--text-primary)]">log(1 + Count)</strong>.
          Evaluations strictly benchmark against Persistence (tomorrow equals today) and 7-day rolling means using temporal season holdouts (never random split).
        </>
      ),
    },
  ];

  return (
    <section id="methodology" className="py-16 border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="space-y-2 border-b border-[var(--border-color)] pb-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-[var(--accent-green)]">
            <span>CHAPTER 07 &bull; SCIENTIFIC TRANSPARENCY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Data Provenance & Methodology
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed">
            ParaliWatch maintains complete scientific openness. We clearly distinguish raw satellite measurements,
            meteorological covariates, statistical forecasts, and environmental interpretations.
          </p>
        </div>

        {/* 6 Step Scientific Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.title}
              className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--bg-surface-elevated)]">
                  {s.icon}
                </div>
                <h3 className="text-sm font-bold font-mono tracking-tight text-[var(--text-primary)]">
                  {s.title}
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                {s.text}
              </p>
            </div>
          ))}
        </div>

        {/* Temporal Holdout Evaluation Formula Table */}
        <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface-elevated)]/40 font-mono text-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color-subtle)] pb-2">
            <span className="font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Formal Forecasting Target & Metrics Specification
            </span>
            <span className="text-[var(--accent-green)] font-semibold">Zero Lookahead Bias</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] leading-relaxed">
            <div className="space-y-1">
              <span className="text-[var(--text-muted)] block uppercase font-bold">Target Formulation</span>
              <p className="text-[var(--text-secondary)]">
                {"Target: y_hat = exp(w^T * x_t + b) - 1, where features x_t include past lags, 7d rolling mean, and weather."}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[var(--text-muted)] block uppercase font-bold">Persistence Baseline</span>
              <p className="text-[var(--text-secondary)]">
                {"Baseline 1: y_hat = y_t. Tomorrow's fires equal today's observed count. A critical benchmark in time series."}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[var(--text-muted)] block uppercase font-bold">Skill Score Definition</span>
              <p className="text-[var(--text-secondary)]">
                {"Skill = 1 - (MAE_model / MAE_persistence). Positive values indicate skill superior to simple persistence."}
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
