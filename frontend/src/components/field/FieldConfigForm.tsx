"use client";

import React from "react";
import {
  Droplets,
  Layers,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  Bug,
  Activity,
  Check,
} from "lucide-react";
import { FarmFieldInput } from "@/lib/schemas";
import { SalinitySlider } from "@/components/field/SalinitySlider";
import { CropHistorySelect } from "@/components/field/CropHistorySelect";

interface FieldConfigFormProps {
  fieldInput: FarmFieldInput;
  onChangeField: (updated: Partial<FarmFieldInput>) => void;
  onSubmit: () => void;
  isAnalyzing: boolean;
  locale: "en" | "bn";
}

const PRIORITIES_LIST = [
  {
    id: "soil_health",
    labelEn: "Soil Health & Nitrogen",
    labelBn: "মাটির উর্বরতা ও নাইট্রোজেন",
    icon: Sparkles,
  },
  {
    id: "reduce_salinity",
    labelEn: "Reduce Salinity / Capillary Salt",
    labelBn: "লবণাক্ততা দূরীকরণ",
    icon: ShieldCheck,
  },
  {
    id: "minimize_water",
    labelEn: "Minimize Water & Save Diesel",
    labelBn: "পানি ও সেচ খরচ সাশ্রয়",
    icon: Droplets,
  },
  {
    id: "maximize_profit",
    labelEn: "Maximize Cash Margin",
    labelBn: "সর্বোচ্চ আর্থিক মুনাফা",
    icon: TrendingUp,
  },
  {
    id: "pest_break",
    labelEn: "Pest & Stem-Borer Break",
    labelBn: "মাজরা পোকা ও রোগ প্রতিরোধ",
    icon: Bug,
  },
  {
    id: "climate_resilience",
    labelEn: "Climate & Heat Resilience",
    labelBn: "আবহাওয়া ও খরা সহনশীলতা",
    icon: Activity,
  },
] as const;

export const FieldConfigForm: React.FC<FieldConfigFormProps> = ({
  fieldInput,
  onChangeField,
  onSubmit,
  isAnalyzing,
  locale,
}) => {
  const togglePriority = (id: typeof PRIORITIES_LIST[number]["id"]) => {
    const current = fieldInput.priorities;
    if (current.includes(id)) {
      if (current.length > 1) {
        onChangeField({ priorities: current.filter((p) => p !== id) });
      }
    } else {
      onChangeField({ priorities: [...current, id] });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            {locale === "bn" ? "মাটি, পানি ও ফসলের ইতিহাস নির্ধারণ" : "Soil, Water & Agronomic Parameters"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {locale === "bn"
              ? "সঠিক সিদ্ধান্ত পেতে আপনার জমির বর্তমান প্যারামিটারগুলো সমন্বয় করুন"
              : "Calibrate field parameters to trigger authentic agro-ecological decision logic"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
            {locale === "bn" ? "জমির নাম" : "Field Name / Plot Label"}
          </label>
          <input
            type="text"
            value={fieldInput.name}
            onChange={(e) => onChangeField({ name: e.target.value })}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            placeholder="e.g. North Plot #4"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
            {locale === "bn" ? "জেলা / অঞ্চল" : "District / Region"}
          </label>
          <input
            type="text"
            value={fieldInput.district}
            onChange={(e) => onChangeField({ district: e.target.value })}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            placeholder="e.g. Satkhira, Mymensingh"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
            {locale === "bn" ? "মাটির প্রকৃতি ও টেক্সচার" : "Soil Texture Type"}
          </label>
          <select
            value={fieldInput.soilType}
            onChange={(e) => onChangeField({ soilType: e.target.value as any })}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all cursor-pointer"
          >
            <option value="silt_loam">{locale === "bn" ? "পলি দোআঁশ (Silt Loam)" : "Silt Loam (Fertile Alluvial)"}</option>
            <option value="clay_loam">{locale === "bn" ? "এটেল দোআঁশ (Clay Loam)" : "Clay Loam (Barind / High Moisture)"}</option>
            <option value="sandy_loam">{locale === "bn" ? "বেলে দোআঁশ (Sandy Loam)" : "Sandy Loam (Fast Draining)"}</option>
            <option value="saline_clay">{locale === "bn" ? "উপকূলীয় লবণাক্ত এটেল (Saline Clay)" : "Saline Clay (Coastal Delta)"}</option>
            <option value="alluvial_silt">{locale === "bn" ? "নদীচর পলি মাটি (Alluvial Silt)" : "Alluvial Silt (Active Riverbank)"}</option>
            <option value="peat_basin">{locale === "bn" ? "পিট / জলাভূমি মাটি (Peat Basin)" : "Peat Basin (Haor Basin)"}</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
            {locale === "bn" ? "সেচ ও পানির প্রাপ্যতা" : "Water & Irrigation Access"}
          </label>
          <select
            value={fieldInput.waterAvailability}
            onChange={(e) => onChangeField({ waterAvailability: e.target.value as any })}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all cursor-pointer"
          >
            <option value="deep_tubewell_secure">{locale === "bn" ? "গভীর নলকূপ (নিরাপদ পানি)" : "Deep Tubewell (Secure Sweet Water)"}</option>
            <option value="limited_shallow_tubewell">{locale === "bn" ? "অগভীর নলকূপ (সীমিত পানি)" : "Limited Shallow Tubewell (Aquifer Stressed)"}</option>
            <option value="canal_surface_water">{locale === "bn" ? "ক্যানেল / নদী ভূ-উপরিভাগের পানি" : "Canal / River Surface Water"}</option>
            <option value="rainfed_only">{locale === "bn" ? "সম্পূর্ণ বৃষ্টিনির্ভর (কোনো সেচ নেই)" : "Rainfed Only (Zero Irrigation)"}</option>
            <option value="waterlogged_seasonal">{locale === "bn" ? "মৌসুমি জলমগ্নতা / জলাবদ্ধ" : "Seasonally Waterlogged / Inundated"}</option>
          </select>
        </div>
      </div>

      <SalinitySlider
        value={fieldInput.currentSalinityEC}
        onChange={(val) => onChangeField({ currentSalinityEC: val })}
        locale={locale}
      />

      <CropHistorySelect
        currentCrop={fieldInput.currentCrop}
        previousCrop={fieldInput.previousCrop}
        onChangeField={onChangeField}
        locale={locale}
      />

      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center justify-between">
          <span>{locale === "bn" ? "কৃষকের অগ্রাধিকার ও লক্ষ্য (একাধিক নির্বাচন করুন)" : "Farmer Goals & Multi-Criteria Priorities"}</span>
          <span className="text-[11px] text-emerald-700 font-semibold lowercase">
            {fieldInput.priorities.length} {locale === "bn" ? "টি সক্রিয়" : "active"}
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRIORITIES_LIST.map((item) => {
            const isSelected = fieldInput.priorities.includes(item.id);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => togglePriority(item.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-700 text-white border-emerald-800 shadow-xs scale-[1.01]"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <div
                  className={`p-1 rounded-md ${
                    isSelected ? "bg-white/20 text-white" : "bg-white text-slate-600"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="truncate flex-1">
                  {locale === "bn" ? item.labelBn : item.labelEn}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={isAnalyzing}
        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 text-white font-bold text-sm shadow-md shadow-emerald-700/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
      >
        <Zap className={`w-4 h-4 text-amber-300 ${isAnalyzing ? "animate-spin" : ""}`} />
        <span>
          {isAnalyzing
            ? (locale === "bn" ? "স্যাটেলাইট ও মাটির ডেটা প্রসেস হচ্ছে..." : "Evaluating NASA POWER & Agro Matrix...")
            : (locale === "bn" ? "সিদ্ধান্ত-সহায়তা শস্য ঘূর্ণন বিশ্লেষণ করুন" : "Generate Crop Rotation Decision Support")}
        </span>
      </button>
    </div>
  );
};
