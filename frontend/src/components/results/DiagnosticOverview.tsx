"use client";

import React from "react";
import {
  Layers,
  CloudSun,
  Droplets,
  Leaf,
  AlertCircle,
} from "lucide-react";
import { DiagnosticResponse } from "@/lib/schemas";

interface DiagnosticOverviewProps {
  data: DiagnosticResponse;
  locale: "en" | "bn";
}

export const DiagnosticOverview: React.FC<DiagnosticOverviewProps> = ({
  data,
  locale,
}) => {
  const { diagnostics, fieldOverview, metadata } = data;
  const { soil, weather, water, vegetation } = diagnostics;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-base font-bold text-slate-900">
            {locale === "bn" ? "৪-স্তরের ক্ষেত্র ডায়াগনস্টিকস" : "4-Pillar Field Diagnostics"}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            AEZ #{fieldOverview.aezNumber}: {fieldOverview.aezName}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                  <Layers className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  {locale === "bn" ? "মাটির লবণাক্ততা" : "Soil & Salinity"}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 capitalize">
                {soil.salinityCategory.replace("_", " ")}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">{locale === "bn" ? "লবণাক্ততা (EC):" : "EC Value:"}</span>
                <span className="text-sm font-mono font-bold text-slate-900">
                  {soil.ecValue.toFixed(1)} <span className="text-xs font-normal text-slate-500">dS/m</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">{locale === "bn" ? "জৈব পদার্থ (OM):" : "Organic Matter:"}</span>
                <span className="text-sm font-mono font-bold text-emerald-700">{soil.organicMatterPct}%</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">{locale === "bn" ? "মাটির পিএইচ (pH):" : "Soil pH:"}</span>
                <span className="text-sm font-mono font-bold text-slate-800">{soil.ph}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">{locale === "bn" ? "নাইট্রোজেন:" : "Nitrogen Status:"}</span>
                <span className="text-xs font-semibold uppercase text-slate-700">{soil.nitrogenStatus}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>SRDI Ag-Matrix</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">Simulated</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-sky-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                  <CloudSun className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  {locale === "bn" ? "আবহাওয়া ও উপগ্রহ" : "NASA Agro-Met"}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                metadata.liveNasaStatus === "connected"
                  ? "bg-sky-100 text-sky-800 border-sky-300"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}>
                {metadata.liveNasaStatus === "connected" ? "Live Satellite" : "Proxy Cache"}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">{locale === "bn" ? "গড় তাপমাত্রা:" : "Avg Temp:"}</span>
                <span className="text-sm font-mono font-bold text-slate-900">
                  {weather.currentTempC}°C
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">{locale === "bn" ? "৩০ দিনের বৃষ্টিপাত:" : "30d Rain Forecast:"}</span>
                <span className="text-sm font-mono font-bold text-sky-700">
                  {weather.forecastRainfall30dMm} <span className="text-xs font-normal text-slate-500">mm</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">{locale === "bn" ? "সৌর বিকিরণ:" : "Solar Radiation:"}</span>
                <span className="text-sm font-mono font-bold text-slate-800">
                  {weather.solarRadiationMjM2Day} <span className="text-xs font-normal text-slate-500">MJ/m²</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">{locale === "bn" ? "বায়ুর আর্দ্রতা:" : "Rel. Humidity:"}</span>
                <span className="text-sm font-mono font-bold text-slate-800">{weather.relativeHumidityPct}%</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>NASA POWER v2.0</span>
            <span className="text-sky-600 font-semibold font-mono">T2M/PRECTOT</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                  <Droplets className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  {locale === "bn" ? "পানি ও সেচ সূচক" : "Water Stress"}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                water.waterStressLevel === "low"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : water.waterStressLevel === "moderate"
                  ? "bg-amber-100 text-amber-800 border-amber-200"
                  : "bg-rose-100 text-rose-800 border-rose-200"
              } capitalize`}>
                {water.waterStressLevel} Stress
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">{locale === "bn" ? "ভূগর্ভস্থ পানি ঝুঁকি:" : "Aquifer Risk:"}</span>
                <span className="text-xs font-bold uppercase text-slate-800">{water.groundwaterSustainabilityRisk}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">{locale === "bn" ? "মৌসুমি ঘাটতি:" : "Deficit (Rabi):"}</span>
                <span className="text-sm font-mono font-bold text-blue-800">{water.seasonalWaterDeficitMm} mm</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-600 line-clamp-2 leading-snug">
                {locale === "bn" ? water.irrigationAdviceBn : water.irrigationAdviceEn}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Water Balance</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">Engine Model</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Leaf className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  {locale === "bn" ? "গাছের আচ্ছাদন (NDVI)" : "Canopy NDVI"}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Healthy
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">{locale === "bn" ? "এনডিভিআই সূচক:" : "Mean NDVI:"}</span>
                <span className="text-sm font-mono font-bold text-emerald-700">{vegetation.ndviMean}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">{locale === "bn" ? "বায়োমাস সূচক:" : "Biomass Index:"}</span>
                <span className="text-sm font-mono font-bold text-slate-800">{vegetation.biomassIndex}</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-600 line-clamp-2 leading-snug">
                {locale === "bn" ? vegetation.vegetationStateBn : vegetation.vegetationStateEn}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Spectral Index</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">Simulated</span>
          </div>
        </div>
      </div>

      {weather.seasonalRiskWarning && (
        <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">
              {locale === "bn" ? "আবহাওয়া ও পরিবেশগত সতর্কতা: " : "Agro-Ecological Risk Advisory: "}
            </span>
            <span>{weather.seasonalRiskWarning}</span>
          </div>
        </div>
      )}
    </div>
  );
};
