"use client";

import React, { useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Rectangle, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FireDetection } from "@/lib/types";
import { useTheme } from "./ThemeProvider";
import { Filter, Flame, Info, Layers, Compass, ZoomIn } from "lucide-react";

interface MapInnerProps {
  fires: FireDetection[];
  latestObsDate: string;
}

export const MapInner: React.FC<MapInnerProps> = ({ fires, latestObsDate }) => {
  const { theme } = useTheme();

  // Filters state
  const [selectedConf, setSelectedConf] = useState<string>("all");
  const [minFrp, setMinFrp] = useState<number>(0);
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Approximate Punjab Study Bounding Box: 29.5-32.6 N, 73.8-77.0 E
  const punjabBounds: [[number, number], [number, number]] = [
    [29.5, 73.8],
    [32.6, 77.0],
  ];

  // Map Tile layer based on theme
  const tileConfig = useMemo(() => {
    if (theme === "dark") {
      return {
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
      };
    } else if (theme === "dusk") {
      return {
        url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
      };
    } else {
      return {
        url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
      };
    }
  }, [theme]);

  // Unique dates available
  const availableDates = useMemo(() => {
    const set = new Set(fires.map((f) => f.date));
    return Array.from(set).sort().reverse();
  }, [fires]);

  // Filtered detections
  const filteredFires = useMemo(() => {
    return fires.filter((f) => {
      if (selectedConf !== "all" && f.conf.toLowerCase() !== selectedConf.toLowerCase()) {
        return false;
      }
      if (f.frp < minFrp) {
        return false;
      }
      if (dateFilter !== "all" && f.date !== dateFilter) {
        return false;
      }
      return true;
    });
  }, [fires, selectedConf, minFrp, dateFilter]);

  // FRP-Aware styling (Yellow < 10 MW, Orange 10-25 MW, Red > 25 MW)
  const getMarkerColor = (frp: number) => {
    if (frp >= 25) return "#ef4444"; // Red (High visual intensity)
    if (frp >= 10) return "#f97316"; // Orange (Medium visual intensity)
    return "#eab308"; // Yellow (Lower visual intensity)
  };

  const getMarkerRadius = (frp: number) => {
    if (frp >= 35) return 8;
    if (frp >= 15) return 6;
    return 4.5;
  };

  return (
    <div className="space-y-4">
      {/* Interactive Controls & Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm text-xs font-mono">
        
        {/* Left Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-semibold">
            <Filter className="w-3.5 h-3.5 text-[var(--accent-green)]" />
            <span>FILTERS:</span>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-1">
            <label htmlFor="map-date" className="text-[var(--text-muted)]">Date:</label>
            <select
              id="map-date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-2.5 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-green)]"
            >
              <option value="all">All Dates ({fires.length})</option>
              {availableDates.map((d) => (
                <option key={d} value={d}>
                  {d} {d === latestObsDate ? "(Latest)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Confidence Selector */}
          <div className="flex items-center gap-1">
            <label htmlFor="map-conf" className="text-[var(--text-muted)]">Confidence:</label>
            <select
              id="map-conf"
              value={selectedConf}
              onChange={(e) => setSelectedConf(e.target.value)}
              className="px-2.5 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-green)]"
            >
              <option value="all">All (Nominal & High)</option>
              <option value="high">High Only</option>
              <option value="nominal">Nominal Only</option>
            </select>
          </div>

          {/* Min FRP Slider */}
          <div className="flex items-center gap-2">
            <label htmlFor="map-frp" className="text-[var(--text-muted)]">Min FRP:</label>
            <input
              id="map-frp"
              type="range"
              min="0"
              max="50"
              step="5"
              value={minFrp}
              onChange={(e) => setMinFrp(Number(e.target.value))}
              className="w-20 accent-[var(--accent-amber)]"
            />
            <span className="text-[var(--accent-amber)] font-bold">{minFrp} MW</span>
          </div>
        </div>

        {/* Right Active Detections Counter */}
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)]">Showing:</span>
          <span className="px-2 py-0.5 rounded bg-[var(--accent-green)]/10 text-[var(--accent-green)] font-bold">
            {filteredFires.length} Hotspots
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[620px] w-full rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-lg">
        <MapContainer
          center={[30.9, 75.5]}
          zoom={8}
          minZoom={6}
          maxZoom={14}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            key={theme}
            url={tileConfig.url}
            attribution={tileConfig.attribution}
          />

          {/* Approximate Study Region Bounding Box Overlay */}
          <Rectangle
            bounds={punjabBounds}
            pathOptions={{
              color: "var(--accent-green)",
              weight: 1.5,
              fillOpacity: 0.02,
              dashArray: "4 4",
            }}
          >
            <Tooltip permanent direction="top" opacity={0.7} className="font-mono text-xs">
              Punjab Study Extent (Lat 29.5-32.6, Lon 73.8-77.0)
            </Tooltip>
          </Rectangle>

          {/* Active Hotspot Markers */}
          {filteredFires.map((fire, i) => {
            const color = getMarkerColor(fire.frp);
            const radius = getMarkerRadius(fire.frp);

            return (
              <CircleMarker
                key={`${fire.lat}-${fire.lon}-${fire.date}-${fire.time}-${i}`}
                center={[fire.lat, fire.lon]}
                radius={radius}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.85,
                  color: "#ffffff",
                  weight: 1,
                }}
              >
                <Popup className="font-mono text-xs">
                  <div className="space-y-1.5 p-1 text-[var(--text-primary)]">
                    <div className="flex items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-700 pb-1 font-bold">
                      <span className="text-orange-600 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" /> Thermal Hotspot
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {fire.dn === "D" ? "Daytime Overpass" : "Nighttime Overpass"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                      <span className="text-gray-500">Coordinates:</span>
                      <span className="font-semibold">{fire.lat.toFixed(4)}, {fire.lon.toFixed(4)}</span>

                      <span className="text-gray-500">Observation:</span>
                      <span className="font-semibold">{fire.date} ({fire.time} UTC)</span>

                      <span className="text-gray-500">Fire Radiative Power:</span>
                      <span className="font-bold text-amber-600">{fire.frp.toFixed(1)} MW</span>

                      <span className="text-gray-500">Confidence:</span>
                      <span className="capitalize font-semibold text-emerald-600">{fire.conf}</span>
                    </div>

                    <div className="pt-1 text-[9px] text-gray-400 italic">
                      Sensor: VIIRS S-NPP (375m). A thermal detection is not proof of crop-residue fire.
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Floating Map Legend Overlay */}
        <div className="absolute bottom-4 right-4 z-[400] p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-glass)] backdrop-blur text-xs font-mono shadow-md space-y-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-bold pb-1 border-b border-[var(--border-color-subtle)]">
            <Compass className="w-3.5 h-3.5 text-[var(--accent-green)]" />
            <span>FRP INTENSITY LEGEND</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ef4444] border border-white shadow-sm" />
              <span className="text-[var(--text-secondary)]">&gt; 25 MW (Higher Intensity)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] border border-white shadow-sm" />
              <span className="text-[var(--text-secondary)]">10 – 25 MW (Medium Intensity)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#eab308] border border-white shadow-sm" />
              <span className="text-[var(--text-secondary)]">&lt; 10 MW (Lower Intensity)</span>
            </div>
          </div>

          <div className="pt-1 text-[10px] text-[var(--text-muted)] border-t border-[var(--border-color-subtle)]">
            Dashed Box: Punjab Study Boundary
          </div>
        </div>

      </div>
    </div>
  );
};
