"use client";

import React from "react";
import { FarmFieldInput } from "@/lib/schemas";

interface HeroBannerProps {
  fieldInput: FarmFieldInput;
  locale: "en" | "bn";
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ fieldInput, locale }) => {
  return (
    <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white py-6 border-b border-emerald-950/40 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {locale === "bn" ? "কৃষিতাত্ত্বিক সিদ্ধান্ত সহায়তা" : "Decision Support System"}
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-300 text-xs font-mono">
              {fieldInput.district}, Bangladesh
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
            {locale === "bn"
              ? `${fieldInput.name} — টেকসই শস্য আবর্তন পরিকল্পনা`
              : `${fieldInput.name} — Resilient Crop Rotation Matrix`}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-right">
            <div className="text-[11px] text-emerald-300 font-medium">
              {locale === "bn" ? "মাটির লবণাক্ততা" : "Root-Zone Salinity"}
            </div>
            <div className="text-lg font-extrabold font-mono text-white">
              {fieldInput.currentSalinityEC.toFixed(1)} <span className="text-xs font-normal text-slate-300">dS/m</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-right">
            <div className="text-[11px] text-sky-300 font-medium">
              {locale === "bn" ? "জমির আয়তন" : "Field Area"}
            </div>
            <div className="text-lg font-extrabold font-mono text-white">
              {fieldInput.areaHectares} <span className="text-xs font-normal text-slate-300">ha</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
