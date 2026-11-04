"use client";

import React from "react";
import { Info, HelpCircle, Eye, CloudOff, Sun, FileText, CheckCircle2 } from "lucide-react";

export const AboutSection: React.FC = () => {
  return (
    <section className="py-16 border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="space-y-2 border-b border-[var(--border-color)] pb-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-[var(--accent-green)]">
            <span>ENVIRONMENTAL INTELLIGENCE MISSION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            About ParaliWatch & Scientific Context
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed">
            ParaliWatch is an independent open-data environmental intelligence platform designed to track,
            model, and demystify agricultural fire occurrences across Punjab&apos;s post-monsoon harvesting window.
          </p>
        </div>

        {/* Narrative Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm leading-relaxed text-[var(--text-secondary)]">
          
          {/* Card 1: The Agro-Ecological Context */}
          <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-mono font-bold text-sm text-[var(--text-primary)] uppercase">
              <Sun className="w-5 h-5 text-[var(--accent-amber)]" />
              <span>The Paddy Harvest Window</span>
            </div>
            <p>
              Punjab&apos;s agricultural sector produces millions of tons of paddy (rice) each autumn.
              Following the mechanised combine harvesting of long-duration rice varieties in October, farmers face a tight
              15-to-20 day window to prepare the seedbed for rabi wheat sowing by mid-November.
            </p>
            <p>
              Due to combine harvesters leaving tall stubble and straw windrows, rapid in-field residue combustion
              has historically been used to clear fields swiftly and economically.
            </p>
          </div>

          {/* Card 2: Scientific Sensor Limitations */}
          <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-mono font-bold text-sm text-[var(--text-primary)] uppercase">
              <CloudOff className="w-5 h-5 text-[var(--accent-terracotta)]" />
              <span>Sensor Limitations &amp; Observational Caveats</span>
            </div>
            <p>
              Thermal anomaly detection from polar-orbiting satellites carries physical constraints:
            </p>
            <ul className="space-y-2 text-xs font-mono text-[var(--text-muted)]">
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-green)] font-bold">&bull;</span>
                <span><strong>Overpass Timing:</strong> Suomi-NPP orbits Punjab roughly twice per 24 hours (daytime ~13:30 IST, nighttime ~01:30 IST). Fires lit outside these overpasses may evade detection.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-green)] font-bold">&bull;</span>
                <span><strong>Cloud & Smoke Obscuration:</strong> Heavy cloud cover and thick surface smoke plumes attenuate infrared emission, suppressing satellite brightness temperatures.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-green)] font-bold">&bull;</span>
                <span><strong>Thermal Nature:</strong> Sensors detect radiated heat; they do not establish legal culpability or identify individual farmers.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Responsible Air Quality Context Banner */}
        <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface-elevated)]/60 text-xs text-[var(--text-secondary)] space-y-3 font-mono">
          <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-primary)]">
            <Info className="w-4 h-4 text-[var(--accent-green)]" />
            <span>Air Quality Dynamics &amp; Multi-Factorial Atmospheric Dispersion</span>
          </div>
          <p className="leading-relaxed">
            While agricultural smoke contributes to regional particulate loading, satellite fire counts cannot be used
            in isolation to assert direct linear causation of urban air quality indexes (such as Delhi NCR AQI).
            Atmospheric dispersion depends critically on meteorological boundary layer height, temperature inversions,
            synoptic wind directions, humidity, and baseline urban-industrial emissions.
          </p>
        </div>

      </div>
    </section>
  );
};

