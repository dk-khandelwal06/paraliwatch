"use client";

import React from "react";
import Image from "next/image";

interface LogoProps {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Logo: React.FC<LogoProps> = ({ showTagline = false, size = "md" }) => {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div className="flex items-center gap-3">
      {/* Custom Scientific Badge: Paddy stalk + Satellite Signal + Thermal Hotspot */}
      <div
        className={`relative flex items-center justify-center rounded-xl border border-[var(--border-color)] bg-gradient-to-br from-[var(--bg-surface-elevated)] to-[var(--bg-surface)] p-1.5 shadow-sm overflow-hidden ${iconSizes[size]}`}
      >
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Satellite Orbit Rings */}
          <circle cx="20" cy="20" r="16" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
          <circle cx="20" cy="20" r="11" stroke="var(--accent-green)" strokeWidth="1.2" opacity="0.7" />
          
          {/* Paddy Stalk Leaf / Grain (Symmetrical golden-green 곡) */}
          <path
            d="M20 32C20 32 14 26 14 18C14 14 17 11 20 11C23 11 26 14 26 18C26 26 20 32 20 32Z"
            fill="var(--accent-green)"
            opacity="0.25"
          />
          <path
            d="M20 31V12M20 20L15 16M20 24L25 20M20 16L16 13M20 18L24 15"
            stroke="var(--accent-green)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Thermal Hotspot / Satellite Radar Ping at top-right */}
          <circle cx="28" cy="12" r="3.5" fill="var(--accent-amber)" className="animate-pulse" />
          <circle cx="28" cy="12" r="6" stroke="var(--accent-terracotta)" strokeWidth="0.8" opacity="0.6" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-bold tracking-wider font-mono text-[var(--text-primary)] ${textSizes[size]}`}>
            PARALI<span className="text-[var(--accent-amber)] font-extrabold">WATCH</span>
          </span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] font-semibold tracking-wider">
            007
          </span>
        </div>
        {showTagline && (
          <span className="text-xs text-[var(--text-secondary)] font-normal tracking-tight">
            Punjab Paddy-Residue Environmental Intelligence
          </span>
        )}
      </div>
    </div>
  );
};
