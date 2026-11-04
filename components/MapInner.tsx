"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Rectangle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FireDetection } from "@/lib/types";
import { useTheme } from "./ThemeProvider";
import {
  Filter,
  Flame,
  Compass,
  Maximize2,
  Minimize2,
  RotateCcw,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";

interface MapInnerProps {
  fires: FireDetection[];
  latestObsDate: string;
}

// Available Free / Public Map Tile Providers (No API Key Required)
type MapLayerId = "osm" | "satellite" | "topo";

interface LayerMeta {
  id: MapLayerId;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  minZoom: number;
}

const TILE_LAYERS: Record<MapLayerId, LayerMeta> = {
  osm: {
    id: "osm",
    name: "OpenStreetMap",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
    minZoom: 6,
  },
  satellite: {
    id: "satellite",
    name: "Esri Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
    minZoom: 6,
  },
  topo: {
    id: "topo",
    name: "Esri Topographic",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution:
      'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey',
    maxZoom: 18,
    minZoom: 6,
  },
};

// Map Controller Component to manage zoom level, invalidation, and programmatic navigation
interface MapControllerProps {
  onZoomChange: (zoom: number) => void;
  isFullscreen: boolean;
  theme: string;
  triggerReset: number;
}

const PUNJAB_CENTER: [number, number] = [30.9, 75.5];
const PUNJAB_DEFAULT_ZOOM = 8;

const MapController: React.FC<MapControllerProps> = ({
  onZoomChange,
  isFullscreen,
  theme,
  triggerReset,
}) => {
  const map = useMap();

  useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });

  // Invalidate map size on theme change or fullscreen toggle
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map, isFullscreen, theme]);

  // Handle programmatic reset to default extent
  useEffect(() => {
    if (triggerReset > 0) {
      map.flyTo(PUNJAB_CENTER, PUNJAB_DEFAULT_ZOOM, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [triggerReset, map]);

  return null;
};

export const MapInner: React.FC<MapInnerProps> = ({ fires, latestObsDate }) => {
  const { theme } = useTheme();

  // Selected base layer: osm (default), satellite, or topo
  const [activeLayer, setActiveLayer] = useState<MapLayerId>("osm");

  // Filters state
  const [selectedConf, setSelectedConf] = useState<string>("all");
  const [minFrp, setMinFrp] = useState<number>(0);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [overpassFilter, setOverpassFilter] = useState<string>("all");
  const [showBoundary, setShowBoundary] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [legendOpen, setLegendOpen] = useState<boolean>(true);

  // Map state
  const [currentZoom, setCurrentZoom] = useState<number>(PUNJAB_DEFAULT_ZOOM);
  const [resetCount, setResetCount] = useState<number>(0);
  const [tileError, setTileError] = useState<boolean>(false);
  const [tileKey, setTileKey] = useState<number>(1);

  // Approximate Punjab Study Bounding Box: 29.5-32.6 N, 73.8-77.0 E
  const punjabBounds: [[number, number], [number, number]] = useMemo(
    () => [
      [29.5, 73.8],
      [32.6, 77.0],
    ],
    []
  );

  // Unique observation dates available
  const availableDates = useMemo(() => {
    const set = new Set(fires.map((f) => f.date));
    return Array.from(set).sort().reverse();
  }, [fires]);

  // Sanitized and filtered detections
  const filteredFires = useMemo(() => {
    return fires.filter((f) => {
      // Validate coordinates
      if (
        typeof f.lat !== "number" ||
        typeof f.lon !== "number" ||
        isNaN(f.lat) ||
        isNaN(f.lon)
      ) {
        return false;
      }
      if (
        selectedConf !== "all" &&
        f.conf.toLowerCase() !== selectedConf.toLowerCase()
      ) {
        return false;
      }
      if (f.frp < minFrp) {
        return false;
      }
      if (dateFilter !== "all" && f.date !== dateFilter) {
        return false;
      }
      if (overpassFilter !== "all" && f.dn !== overpassFilter) {
        return false;
      }
      return true;
    });
  }, [fires, selectedConf, minFrp, dateFilter, overpassFilter]);

  // FRP Visual Intensity Categories:
  // Yellow: Lower intensity (< 10 MW)
  // Orange: Medium intensity (10 - 25 MW)
  // Red: Higher intensity (>= 25 MW)
  const getMarkerColor = useCallback((frp: number) => {
    if (frp >= 25) return "#ef4444"; // Red (Higher visual intensity)
    if (frp >= 10) return "#f97316"; // Orange (Medium visual intensity)
    return "#eab308"; // Yellow (Lower visual intensity)
  }, []);

  // Zoom-aware marker radius
  const getMarkerRadius = useCallback(
    (frp: number) => {
      const zoomFactor =
        currentZoom <= 7 ? 0.75 : currentZoom >= 11 ? 1.4 : currentZoom >= 9 ? 1.15 : 1.0;

      if (frp >= 25) return Math.round(7 * zoomFactor);
      if (frp >= 10) return Math.round(5 * zoomFactor);
      return Math.round(3.5 * zoomFactor);
    },
    [currentZoom]
  );

  // Theme-aware CSS filter class for base tiles
  const getTileClassName = useCallback(() => {
    if (activeLayer === "satellite") {
      return "map-tiles-satellite";
    }
    if (activeLayer === "topo") {
      return `map-tiles-topo-${theme}`;
    }
    return `map-tiles-osm-${theme}`;
  }, [activeLayer, theme]);

  const activeLayerConfig = TILE_LAYERS[activeLayer];

  const handleResetView = () => {
    setResetCount((prev) => prev + 1);
  };

  const handleRetryTiles = () => {
    setTileError(false);
    setTileKey((prev) => prev + 1);
  };

  const handleResetFilters = () => {
    setSelectedConf("all");
    setMinFrp(0);
    setDateFilter("all");
    setOverpassFilter("all");
  };

  return (
    <div
      className={`space-y-4 ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-[var(--bg-primary)] p-4 overflow-y-auto flex flex-col"
          : "relative"
      }`}
    >
      {/* Interactive Controls & Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm text-xs font-mono">
        {/* Left Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-semibold">
            <Filter className="w-3.5 h-3.5 text-[var(--accent-green)]" />
            <span>FILTERS:</span>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="map-date" className="text-[var(--text-muted)]">
              Date:
            </label>
            <select
              id="map-date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-green)] text-xs"
            >
              <option value="all">All Dates ({fires.length})</option>
              {availableDates.map((d) => (
                <option key={d} value={d}>
                  {d} {d === latestObsDate ? "(Latest)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Overpass Selector */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="map-overpass" className="text-[var(--text-muted)]">
              Pass:
            </label>
            <select
              id="map-overpass"
              value={overpassFilter}
              onChange={(e) => setOverpassFilter(e.target.value)}
              className="px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-green)] text-xs"
            >
              <option value="all">Day & Night Passes</option>
              <option value="D">Daytime (~1:30 PM)</option>
              <option value="N">Nighttime (~1:30 AM)</option>
            </select>
          </div>

          {/* Confidence Selector */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="map-conf" className="text-[var(--text-muted)]">
              Confidence:
            </label>
            <select
              id="map-conf"
              value={selectedConf}
              onChange={(e) => setSelectedConf(e.target.value)}
              className="px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-green)] text-xs"
            >
              <option value="all">Nominal & High</option>
              <option value="high">High Confidence Only</option>
              <option value="nominal">Nominal Confidence Only</option>
            </select>
          </div>

          {/* Min FRP Slider */}
          <div className="flex items-center gap-2">
            <label htmlFor="map-frp" className="text-[var(--text-muted)]">
              Min FRP:
            </label>
            <input
              id="map-frp"
              type="range"
              min="0"
              max="50"
              step="5"
              value={minFrp}
              onChange={(e) => setMinFrp(Number(e.target.value))}
              className="w-20 accent-[var(--accent-amber)] cursor-pointer"
            />
            <span className="text-[var(--accent-amber)] font-bold min-w-[42px]">
              {minFrp} MW
            </span>
          </div>

          {/* Reset Filters Button if Active */}
          {(dateFilter !== "all" ||
            overpassFilter !== "all" ||
            selectedConf !== "all" ||
            minFrp > 0) && (
            <button
              onClick={handleResetFilters}
              className="px-2 py-1 rounded border border-[var(--border-color)] text-[var(--accent-terracotta)] hover:bg-[var(--accent-terracotta)]/10 transition-colors text-[11px]"
              title="Reset all filters"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Right Active Detections Counter & Boundary Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBoundary(!showBoundary)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] transition-colors ${
              showBoundary
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                : "border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--text-muted)]"
            }`}
            title="Toggle Approximate Study Boundary Outline"
          >
            {showBoundary ? (
              <Eye className="w-3 h-3" />
            ) : (
              <EyeOff className="w-3 h-3" />
            )}
            <span>Study Boundary</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/20 text-[var(--accent-green)] font-bold text-xs">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse" />
            <span>
              {filteredFires.length} / {fires.length} Hotspots
            </span>
          </div>
        </div>
      </div>

      {/* Main Map Container Wrapper */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-xl ${
          isFullscreen ? "flex-1 min-h-[500px]" : "h-[640px]"
        }`}
      >
        {/* On-Map Floating Toolbar (Top-Right): Layer Picker & View Utilities */}
        <div className="absolute top-3 right-3 z-[400] flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Base Layer Switcher */}
          <div className="flex items-center p-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-glass)] backdrop-blur shadow-md font-mono text-xs">
            <button
              onClick={() => setActiveLayer("osm")}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeLayer === "osm"
                  ? "bg-[var(--accent-green)] text-white font-bold shadow-sm"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]"
              }`}
              title="OpenStreetMap Standard (Theme Adaptive)"
            >
              <span>Street (OSM)</span>
            </button>
            <button
              onClick={() => setActiveLayer("satellite")}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeLayer === "satellite"
                  ? "bg-[var(--accent-green)] text-white font-bold shadow-sm"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]"
              }`}
              title="Esri World Imagery High-Resolution Satellite Remote Sensing"
            >
              <span>Satellite</span>
            </button>
            <button
              onClick={() => setActiveLayer("topo")}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeLayer === "topo"
                  ? "bg-[var(--accent-green)] text-white font-bold shadow-sm"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]"
              }`}
              title="Esri World Topographic Map"
            >
              <span>Topo</span>
            </button>
          </div>

          {/* Reset Extent Button */}
          <button
            onClick={handleResetView}
            className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-glass)] backdrop-blur shadow-md text-[var(--text-primary)] hover:text-[var(--accent-green)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
            title="Reset view to Punjab study extent"
            aria-label="Reset Map View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-glass)] backdrop-blur shadow-md text-[var(--text-primary)] hover:text-[var(--accent-green)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            aria-label="Toggle Map Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Tile Network Warning / Retry Banner if tile error occurs */}
        {tileError && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[400] max-w-md p-3 rounded-xl border border-amber-500/40 bg-[var(--bg-surface-glass)] backdrop-blur shadow-xl text-xs font-mono text-[var(--text-primary)] flex items-center justify-between gap-3 pointer-events-auto">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Tile network request delayed or blocked.</span>
            </div>
            <button
              onClick={handleRetryTiles}
              className="px-2.5 py-1 rounded bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors shrink-0"
            >
              Retry Tiles
            </button>
          </div>
        )}

        {/* Leaflet Map Canvas */}
        <MapContainer
          center={PUNJAB_CENTER}
          zoom={PUNJAB_DEFAULT_ZOOM}
          minZoom={6}
          maxZoom={activeLayerConfig.maxZoom}
          scrollWheelZoom={true}
          preferCanvas={true}
          className="h-full w-full"
        >
          <MapController
            onZoomChange={setCurrentZoom}
            isFullscreen={isFullscreen}
            theme={theme}
            triggerReset={resetCount}
          />

          {/* Verified Free Tile Provider Layer */}
          <TileLayer
            key={`${activeLayer}-${theme}-${tileKey}`}
            url={activeLayerConfig.url}
            attribution={activeLayerConfig.attribution}
            maxZoom={activeLayerConfig.maxZoom}
            minZoom={activeLayerConfig.minZoom}
            className={getTileClassName()}
            eventHandlers={{
              tileerror: () => setTileError(true),
              load: () => setTileError(false),
            }}
          />

          {/* Approximate Study Region Bounding Box Overlay (Without overlapping tooltips) */}
          {showBoundary && (
            <Rectangle
              bounds={punjabBounds}
              pathOptions={{
                color: "#10b981",
                weight: 1.5,
                fill: false,
                dashArray: "6, 8",
                interactive: false,
              }}
            />
          )}

          {/* NASA FIRMS VIIRS 375m Fire Hotspots */}
          {filteredFires.map((fire, i) => {
            const color = getMarkerColor(fire.frp);
            const radius = getMarkerRadius(fire.frp);

            return (
              <CircleMarker
                key={`${fire.lat.toFixed(4)}-${fire.lon.toFixed(4)}-${fire.date}-${fire.time}-${i}`}
                center={[fire.lat, fire.lon]}
                radius={radius}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.88,
                  color: "#ffffff",
                  weight: 1.2,
                  opacity: 0.9,
                }}
              >
                <Popup className="font-mono text-xs">
                  <div className="space-y-2 p-1 text-[var(--text-primary)] min-w-[240px]">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 border-b border-[var(--border-color-subtle)] pb-1.5 font-bold">
                      <span className="flex items-center gap-1.5 text-sm" style={{ color }}>
                        <Flame className="w-4 h-4" /> Thermal Hotspot
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          fire.conf === "high"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {fire.conf === "high" ? "High Conf" : "Nominal Conf"}
                      </span>
                    </div>

                    {/* Attribute Grid */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
                      <span className="text-[var(--text-muted)]">Coordinates:</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {fire.lat.toFixed(4)}° N, {fire.lon.toFixed(4)}° E
                      </span>

                      <span className="text-[var(--text-muted)]">Observation:</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {fire.date} ({fire.time} UTC)
                      </span>

                      <span className="text-[var(--text-muted)]">Overpass Cycle:</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {fire.dn === "D"
                          ? "Daytime (Solar Peak)"
                          : "Nighttime (Cool Earth)"}
                      </span>

                      <span className="text-[var(--text-muted)]">Radiative Power:</span>
                      <span className="font-bold text-[var(--accent-amber)]">
                        {fire.frp.toFixed(2)} MW
                      </span>

                      <span className="text-[var(--text-muted)]">Intensity Tier:</span>
                      <span className="font-semibold" style={{ color }}>
                        {fire.frp >= 25
                          ? "Higher (>25 MW)"
                          : fire.frp >= 10
                          ? "Medium (10–25 MW)"
                          : "Lower (<10 MW)"}
                      </span>
                    </div>

                    {/* Sensor & Scientific Disclaimer */}
                    <div className="pt-1.5 text-[9.5px] leading-relaxed text-[var(--text-muted)] border-t border-[var(--border-color-subtle)] italic">
                      Sensor: NASA VIIRS S-NPP 375m. Indicates pixel-level brightness temperature anomaly. Does not establish private ownership or legal liability.
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Floating Comprehensive Map Legend & Study Boundary Indicator */}
        <div className="absolute bottom-4 left-4 z-[400] max-w-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-glass)] backdrop-blur text-xs font-mono shadow-xl pointer-events-auto overflow-hidden">
          {/* Header */}
          <div
            onClick={() => setLegendOpen(!legendOpen)}
            className="flex items-center justify-between gap-3 px-3 py-2 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-color-subtle)] cursor-pointer select-none font-bold text-[var(--text-primary)]"
          >
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[var(--accent-green)]" />
              <span>MAP INTELLIGENCE</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">
              {legendOpen ? "Collapse" : "Expand"}
            </span>
          </div>

          {/* Legend Body */}
          {legendOpen && (
            <div className="p-3 space-y-2.5 text-[11px]">
              {/* FRP Scale */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold block">
                  Fire Radiative Power (MW)
                </span>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#ef4444] border border-white shadow-sm shrink-0" />
                      <span className="text-[var(--text-secondary)]">Higher Intensity</span>
                    </div>
                    <span className="font-bold text-[#ef4444]">&ge; 25 MW</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] border border-white shadow-sm shrink-0" />
                      <span className="text-[var(--text-secondary)]">Medium Intensity</span>
                    </div>
                    <span className="font-bold text-[#f97316]">10 &ndash; 25 MW</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#eab308] border border-white shadow-sm shrink-0" />
                      <span className="text-[var(--text-secondary)]">Lower Intensity</span>
                    </div>
                    <span className="font-bold text-[#eab308]">&lt; 10 MW</span>
                  </div>
                </div>
              </div>

              {/* Study Extent Indicator */}
              <div className="pt-2 border-t border-[var(--border-color-subtle)] space-y-1 text-[10px]">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-4 h-0 border-t-2 border-dashed border-emerald-500 shrink-0" />
                  <span>Study Extent (29.5&ndash;32.6 N, 73.8&ndash;77.0 E)</span>
                </div>
                <p className="text-[9px] text-[var(--text-muted)] leading-tight">
                  Bounding region clipped at the Radcliffe Line to exclude Pakistan.
                  Approximate study filter, not official state boundary.
                </p>
              </div>

              {/* Sensor Spec */}
              <div className="pt-1.5 border-t border-[var(--border-color-subtle)] text-[9.5px] text-[var(--text-muted)] flex items-center justify-between">
                <span>Sensor: VIIRS S-NPP 375m</span>
                <span className="text-[var(--accent-green)] font-semibold">
                  Zoom {currentZoom}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
