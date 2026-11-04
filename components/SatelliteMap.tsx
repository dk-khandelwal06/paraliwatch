"use client";

import React from "react";
import dynamic from "next/dynamic";
import { FireDetection } from "@/lib/types";
import { Compass, Satellite, ShieldAlert } from "lucide-react";

const MapInnerDynamic = dynamic(
  () => import("./MapInner").then((mod) => mod.MapInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-[620px] w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] flex flex-col items-center justify-center space-y-3 font-mono text-sm text-[var(--text-muted)] animate-pulse">
        <Satellite className="w-8 h-8 text-[var(--accent-green)] animate-spin" />
        <span>Initializing Interactive Satellite Cartography...</span>
      </div>
    ),
  }
);

interface SatelliteMapProps {
  fires: FireDetection[];
  latestObsDate?: string;
}

export const SatelliteMap: React.FC<SatelliteMapProps> = ({
  fires,
  latestObsDate = "2026-11-02",
}) => {
  return (
    <section id="satellite-map" className="py-16 border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-color)] pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-[var(--accent-green)]">
              <span>CHAPTER 04</span>
              <span className="text-[var(--text-muted)]">&bull;</span>
              <span>THE LIVE PICTURE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Interactive Satellite Fire Map
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
              Spatial distribution of 375m VIIRS thermal anomalies across Punjab, India.
              Filtered for nominal and high confidence detections, strictly excluding cross-border detections.
            </p>
          </div>

          {/* Scientific Disclaimer Pill */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-xs font-mono text-[var(--text-muted)] shadow-sm">
            <ShieldAlert className="w-4 h-4 text-[var(--accent-amber)]" />
            <span>FRP: Radiative energy, not fire severity or land ownership.</span>
          </div>
        </div>

        {/* Dynamic Map Component */}
        <MapInnerDynamic fires={fires} latestObsDate={latestObsDate} />

      </div>
    </section>
  );
};
