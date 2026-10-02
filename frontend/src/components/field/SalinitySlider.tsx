"use client";

import React from "react";

interface SalinitySliderProps {
  value: number;
  onChange: (value: number) => void;
  locale: "en" | "bn";
}

export const SalinitySlider: React.FC<SalinitySliderProps> = ({
  value,
  onChange,
  locale,
}) => {
  const getSalinityColor = (ec: number) => {
    if (ec < 2.0) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (ec < 4.0) return "text-teal-700 bg-teal-50 border-teal-200";
    if (ec < 8.0) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-rose-700 bg-rose-50 border-rose-200";
  };

  const getSalinityLabel = (ec: number) => {
    if (ec < 2.0) return locale === "bn" ? "মিষ্টি মাটি (লবণহীন)" : "Non-Saline Sweet Soil";
    if (ec < 4.0) return locale === "bn" ? "হালকা লবণাক্ত" : "Slightly Saline";
    if (ec < 8.0) return locale === "bn" ? "মাঝারি লবণাক্ত" : "Moderately Saline";
    if (ec < 12.0) return locale === "bn" ? "উচ্চ লবণাক্ত" : "Strongly Saline";
    return locale === "bn" ? "তীব্র লবণাক্ত" : "Severely Saline";
  };

  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            {locale === "bn" ? "মাটির লবণাক্ততার মাত্রা (ECe)" : "Soil Salinity Level (ECe)"}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">dS/m</span>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getSalinityColor(value)}`}>
          {value.toFixed(1)} dS/m • {getSalinityLabel(value)}
        </div>
      </div>

      <input
        type="range"
        min="0.2"
        max="15.0"
        step="0.2"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
      />

      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
        <span>0.2 (Sweet Water)</span>
        <span>4.0 (Threshold)</span>
        <span>8.0 (High Saline)</span>
        <span>15.0 (Severe)</span>
      </div>
    </div>
  );
};
