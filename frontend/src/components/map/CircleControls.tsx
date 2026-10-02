"use client";

import React from "react";
import { CircleDot, Sparkles } from "lucide-react";
import { calculateCircleAreaHectares } from "@/lib/geo-utils";

interface CircleControlsProps {
  radiusMeters: number;
  onChangeRadius: (newRadius: number) => void;
  locale: "en" | "bn";
}

const PRESET_RADII = [
  { labelEn: "Small Plot (40m)", labelBn: "ছোট জমি (৪০মি)", radius: 40 },
  { labelEn: "Standard Farm (70m)", labelBn: "মাঝারি ক্ষেত (৭০মি)", radius: 70 },
  { labelEn: "Large Estate (110m)", labelBn: "বড় খামার (১১০মি)", radius: 110 },
  { labelEn: "Commercial (160m)", labelBn: "বাণিজ্যিক (১৬০মি)", radius: 160 },
];

export const CircleControls: React.FC<CircleControlsProps> = ({
  radiusMeters,
  onChangeRadius,
  locale,
}) => {
  const currentAreaHa = calculateCircleAreaHectares(radiusMeters);
  const currentAreaBigha = Number((currentAreaHa * 7.47).toFixed(1));

  return (
    <div className="bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-700 text-white shadow-xl flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CircleDot className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-100">
            {locale === "bn" ? "বৃত্তাকার ক্ষেত্রের ব্যাসার্ধ ও অটো-এরিয়া" : "Circular Field Radius & Auto-Area"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>{radiusMeters}m</span>
          <span className="text-slate-400 font-normal">→</span>
          <span>{currentAreaHa} ha</span>
          <span className="text-slate-400 font-normal">({currentAreaBigha} bigha)</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min="25"
          max="350"
          step="5"
          value={radiusMeters}
          onChange={(e) => onChangeRadius(Number(e.target.value))}
          className="w-full accent-emerald-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
        />
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-slate-400 font-medium mr-1">
          {locale === "bn" ? "প্রিসেট:" : "Presets:"}
        </span>
        {PRESET_RADII.map((p) => {
          const isSelected = Math.abs(radiusMeters - p.radius) < 5;
          return (
            <button
              key={p.radius}
              type="button"
              onClick={() => onChangeRadius(p.radius)}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                isSelected
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              }`}
            >
              {locale === "bn" ? p.labelBn : p.labelEn}
            </button>
          );
        })}
      </div>
    </div>
  );
};
