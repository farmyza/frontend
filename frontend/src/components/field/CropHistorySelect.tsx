"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { FarmFieldInput } from "@/lib/schemas";

interface CropHistorySelectProps {
  currentCrop: FarmFieldInput["currentCrop"];
  previousCrop: FarmFieldInput["previousCrop"];
  onChangeField: (updated: Partial<FarmFieldInput>) => void;
  locale: "en" | "bn";
}

export const CropHistorySelect: React.FC<CropHistorySelectProps> = ({
  currentCrop,
  previousCrop,
  onChangeField,
  locale,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          {locale === "bn" ? "বর্তমান ফসল (Current Crop)" : "Current Crop"}
        </label>
        <select
          value={currentCrop}
          onChange={(e) => onChangeField({ currentCrop: e.target.value as any })}
          className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
        >
          <option value="transplanted_aman_rice">{locale === "bn" ? "রোপা আমন ধান (T. Aman Rice)" : "T. Aman Rice"}</option>
          <option value="boro_rice">{locale === "bn" ? "বোরো ধান (Boro Rice)" : "Boro Rice"}</option>
          <option value="aus_rice">{locale === "bn" ? "আউশ ধান (Aus Rice)" : "Aus Rice"}</option>
          <option value="jute">{locale === "bn" ? "পাট (Jute)" : "Jute"}</option>
          <option value="mustard">{locale === "bn" ? "সরিষা (Mustard)" : "Mustard"}</option>
          <option value="potato">{locale === "bn" ? "আলু (Potato)" : "Potato"}</option>
          <option value="mung_bean">{locale === "bn" ? "মুগডাল (Mung Bean)" : "Mung Bean"}</option>
          <option value="maize">{locale === "bn" ? "ভুট্টা (Maize)" : "Hybrid Maize"}</option>
          <option value="fallow">{locale === "bn" ? "পতিত জমি (Fallow)" : "Fallow (Resting)"}</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {locale === "bn" ? "পূর্ববর্তী ফসল (Previous Crop)" : "Previous Crop"}
        </label>
        <select
          value={previousCrop}
          onChange={(e) => onChangeField({ previousCrop: e.target.value as any })}
          className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
        >
          <option value="boro_rice">{locale === "bn" ? "বোরো ধান (Boro Rice)" : "Boro Rice"}</option>
          <option value="transplanted_aman_rice">{locale === "bn" ? "রোপা আমন ধান (T. Aman Rice)" : "T. Aman Rice"}</option>
          <option value="mustard">{locale === "bn" ? "সরিষা (Mustard)" : "Mustard"}</option>
          <option value="potato">{locale === "bn" ? "আলু (Potato)" : "Potato"}</option>
          <option value="mung_bean">{locale === "bn" ? "মুগডাল (Mung Bean)" : "Mung Bean"}</option>
          <option value="lentil">{locale === "bn" ? "মসুর ডাল (Lentil)" : "Lentil"}</option>
          <option value="fallow">{locale === "bn" ? "পতিত জমি (Fallow)" : "Fallow (Resting)"}</option>
        </select>
      </div>
    </div>
  );
};
