"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { ExternalLink, Heart, Satellite, Shield, Terminal } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-surface)] py-12 text-xs font-mono text-[var(--text-muted)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[var(--border-color-subtle)]">
          <div className="space-y-2">
            <Logo showTagline={true} size="md" />
            <p className="text-xs text-[var(--text-secondary)] font-sans max-w-md">
              A self-updating satellite fire tracker and predictive modeling platform for Punjab&apos;s paddy residue burning season.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[var(--text-secondary)]">
            <a
              href="https://firms.modaps.eosdis.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[var(--text-primary)] transition"
            >
              <span>NASA FIRMS</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[var(--text-primary)] transition"
            >
              <span>Open-Meteo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <Link href="#overview" className="hover:text-[var(--text-primary)] transition">
              Overview
            </Link>
            <Link href="#telemetry" className="hover:text-[var(--text-primary)] transition">
              Telemetry
            </Link>
            <Link href="#forecasting" className="hover:text-[var(--text-primary)] transition">
              Forecasting
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span>ParaliWatch &bull; Project 007</span>
            <span>&bull;</span>
            <span>Environmental Remote Sensing &amp; ML</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Powered by Next.js &bull; Deployed on Vercel</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

