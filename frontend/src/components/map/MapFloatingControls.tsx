"use client";

import React from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
} from "lucide-react";

interface MapFloatingControlsProps {
  centerLat: number;
  centerLng: number;
  shapeMode: "draw_circle" | "circle" | "polygon";
  locale: "en" | "bn";
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetShape: () => void;
  onScaleField: (multiplier: number) => void;
}

export const MapFloatingControls: React.FC<MapFloatingControlsProps> = ({
  centerLat,
  centerLng,
  shapeMode,
  locale,
  onZoomIn,
  onZoomOut,
  onResetShape,
  onScaleField,
}) => {
  return (
    <>
      {/* Floating HUD Badge */}
      <div className="absolute top-3 left-3 pointer-events-none text-[10px] font-mono text-emerald-400 bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-emerald-500/30 shadow-md z-[1000]">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            LIVE GEO-MAP •{" "}
            {shapeMode === "draw_circle"
              ? "CIRCLE TO SELECT"
              : shapeMode === "circle"
              ? "AUTO-RADIUS"
              : "WGS-84"}
          </span>
        </div>
        <div className="text-slate-300 mt-0.5">
          {centerLat.toFixed(5)}°N, {centerLng.toFixed(5)}°E
        </div>
      </div>

      <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 z-[1000] flex flex-col items-center">
        <Compass className="w-4 h-4 text-emerald-400" />
        <span className="text-[9px] font-mono font-bold text-slate-200">N</span>
      </div>

      {/* Zoom & Reset Floating Controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-[1000]">
        <button
          type="button"
          onClick={onZoomIn}
          className="p-2 bg-slate-900/85 hover:bg-slate-800 text-white rounded-lg backdrop-blur-md border border-slate-700 shadow-md transition-all active:scale-95 cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          className="p-2 bg-slate-900/85 hover:bg-slate-800 text-white rounded-lg backdrop-blur-md border border-slate-700 shadow-md transition-all active:scale-95 cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onResetShape}
          className="p-2 bg-slate-900/85 hover:bg-slate-800 text-white rounded-lg backdrop-blur-md border border-slate-700 shadow-md transition-all active:scale-95 cursor-pointer"
          title="Reset Shape"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Area Scale Controls */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs text-white z-[1000]">
        <span className="text-[11px] font-medium text-slate-300">
          {locale === "bn" ? "আকার:" : "Size:"}
        </span>
        <button
          type="button"
          onClick={() => onScaleField(1.15)}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-emerald-700 text-white text-xs font-bold border border-slate-600 transition-all cursor-pointer"
          title="Increase Field Area by 15%"
        >
          +15%
        </button>
        <button
          type="button"
          onClick={() => onScaleField(0.85)}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-emerald-700 text-white text-xs font-bold border border-slate-600 transition-all cursor-pointer"
          title="Decrease Field Area by 15%"
        >
          -15%
        </button>
      </div>
    </>
  );
};
