"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Activity, Radio, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { AudioNarrator } from "./AudioNarrator";

interface NavigationProps {
  lastUpdated?: string;
  latestObsDate?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  lastUpdated = "Today 02:37 UTC",
  latestObsDate = "2026-11-02",
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Overview", href: "#overview" },
    { label: "Telemetry", href: "#telemetry" },
    { label: "Fire Map", href: "#satellite-map" },
    { label: "Trends", href: "#trends" },
    { label: "Weather", href: "#weather" },
    { label: "Forecast", href: "#forecasting" },
    { label: "Methodology", href: "#methodology" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-color)] bg-[var(--bg-surface-glass)] backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Identity */}
        <Link href="#overview" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent-green)] rounded-lg">
          <Logo size="sm" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs uppercase tracking-wider font-mono text-[var(--text-secondary)]">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-[var(--text-primary)] hover:border-b-2 hover:border-[var(--accent-green)] transition py-1"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Action Tools: Freshness Badge, Audio, Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Satellite Freshness Indicator */}
          <div
            title={`Latest NASA VIIRS Observation: ${latestObsDate} | Pipeline sync: ${lastUpdated}`}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-surface)] text-[11px] font-mono text-[var(--text-secondary)] shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-green)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-green)]"></span>
            </span>
            <span className="font-medium text-[var(--text-primary)]">VIIRS {latestObsDate}</span>
          </div>

          {/* Audio Briefing Controller */}
          <div className="hidden md:block">
            <AudioNarrator />
          </div>

          {/* 3-Theme Selector */}
          <ThemeToggle />

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[var(--border-color)] bg-[var(--bg-surface)] px-4 pt-3 pb-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)] text-xs text-[var(--text-muted)] font-mono">
            <span>SATELLITE SYNC: {latestObsDate}</span>
            <AudioNarrator />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm font-mono">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

