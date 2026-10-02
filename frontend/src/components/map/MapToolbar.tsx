"use client";

import React from "react";
import {
  MapPin,
  CircleDot,
  Hexagon,
  Edit3,
  Wand2,
} from "lucide-react";

interface MapToolbarProps {
  district: string;
  centerLat: number;
  centerLng: number;
  areaHectares: number;
  shapeMode: "draw_circle" | "circle" | "polygon";
  mapMode: "satellite" | "streets" | "terrain";
  isEditMode: boolean;
  locale: "en" | "bn";
  onSwitchShapeMode: (mode: "draw_circle" | "circle" | "polygon") => void;
  onSwitchMapMode: (mode: "satellite" | "streets" | "terrain") => void;
  onToggleEditMode: () => void;
}

export const MapToolbar: React.FC<MapToolbarProps> = ({
  district,
  centerLat,
  centerLng,
  areaHectares,
  shapeMode,
  mapMode,
  isEditMode,
  locale,
  onSwitchShapeMode,
  onSwitchMapMode,
  onToggleEditMode,
}) => {
  return (
    <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-emerald-100 text-emerald-700">
            <MapPin className="w-4 h-4" />
          </span>
          <h3 className="font-bold text-sm text-slate-800">
            {locale === "bn" ? "ক্ষেতের সীমানা ও লাইভ স্যাটেলাইট মানচিত্র" : "Field Boundary & Live Satellite Map"}
          </h3>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {areaHectares} ha ({(areaHectares * 7.47).toFixed(1)} bigha)
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {locale === "bn"
            ? `অবস্থান: ${centerLat.toFixed(4)}° N, ${centerLng.toFixed(4)}° E • জেলা: ${district}`
            : `Centroid: ${centerLat.toFixed(4)}° N, ${centerLng.toFixed(4)}° E • District: ${district}`}
        </p>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Shape Mode Selector */}
        <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => onSwitchShapeMode("draw_circle")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
              shapeMode === "draw_circle"
                ? "bg-emerald-600 text-white shadow-sm font-bold"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>{locale === "bn" ? "সার্কেল ড্র (মাউস)" : "Draw Circle"}</span>
          </button>
          <button
            type="button"
            onClick={() => onSwitchShapeMode("circle")}
            className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-all ${
              shapeMode === "circle"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CircleDot className="w-3.5 h-3.5 text-emerald-600" />
            <span>{locale === "bn" ? "ব্যাসার্ধ বৃত্ত" : "Radius Circle"}</span>
          </button>
          <button
            type="button"
            onClick={() => onSwitchShapeMode("polygon")}
            className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-all ${
              shapeMode === "polygon"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Hexagon className="w-3.5 h-3.5 text-slate-600" />
            <span>{locale === "bn" ? "বহুভুজ" : "Polygon"}</span>
          </button>
        </div>

        {/* Map Tile Switcher */}
        <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => onSwitchMapMode("satellite")}
            className={`px-2 py-1 rounded-md font-medium transition-all ${
              mapMode === "satellite"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {locale === "bn" ? "স্যাটেলাইট" : "Satellite"}
          </button>
          <button
            type="button"
            onClick={() => onSwitchMapMode("streets")}
            className={`px-2 py-1 rounded-md font-medium transition-all ${
              mapMode === "streets"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {locale === "bn" ? "রাস্তা" : "Streets"}
          </button>
        </div>

        {shapeMode === "polygon" && (
          <button
            type="button"
            onClick={onToggleEditMode}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              isEditMode
                ? "bg-amber-600 text-white border-amber-700 shadow-sm"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>
              {isEditMode
                ? locale === "bn"
                  ? "সম্পাদনা শেষ"
                  : "Done Editing"
                : locale === "bn"
                ? "সীমানা পরিবর্তন"
                : "Edit Vertices"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
