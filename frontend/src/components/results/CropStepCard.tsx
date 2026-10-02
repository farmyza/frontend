"use client";

import React from "react";
import {
  Calendar,
  Lightbulb,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { CropStep } from "@/lib/schemas";

interface CropStepCardProps {
  step: CropStep;
  isExpanded: boolean;
  onToggleExpand: () => void;
  locale: "en" | "bn";
}

export const CropStepCard: React.FC<CropStepCardProps> = ({
  step,
  isExpanded,
  onToggleExpand,
  locale,
}) => {
  const getRoleBadge = (role: CropStep["role"]) => {
    switch (role) {
      case "nitrogen_fixer":
        return {
          bg: "bg-emerald-100 text-emerald-800 border-emerald-300",
          label: locale === "bn" ? "নাইট্রোজেন সংবন্ধন" : "Nitrogen Fixer",
        };
      case "salinity_sink":
        return {
          bg: "bg-cyan-100 text-cyan-800 border-cyan-300",
          label: locale === "bn" ? "লবণাক্ততা শোষণ" : "Salinity Sink",
        };
      case "cash_yield":
        return {
          bg: "bg-amber-100 text-amber-800 border-amber-300",
          label: locale === "bn" ? "প্রধান বাণিজ্যিক ফসল" : "High Cash Yield",
        };
      case "pest_break":
        return {
          bg: "bg-rose-100 text-rose-800 border-rose-300",
          label: locale === "bn" ? "পোকার চক্র ধ্বংসকারী" : "Pest Break",
        };
      case "biomass_builder":
        return {
          bg: "bg-teal-100 text-teal-800 border-teal-300",
          label: locale === "bn" ? "সবুজ সার ও উর্বরতা" : "Biomass Builder",
        };
      default:
        return {
          bg: "bg-slate-100 text-slate-800 border-slate-300",
          label: locale === "bn" ? "শস্য পর্যায়" : "Rotational Crop",
        };
    }
  };

  const roleBadge = getRoleBadge(step.role);

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between shadow-xs ${
        isExpanded
          ? "border-emerald-500 ring-2 ring-emerald-500/20"
          : "border-slate-200 hover:border-emerald-300"
      }`}
    >
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-mono text-xs font-bold flex items-center justify-center shadow-xs">
              {step.step}
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              {step.season} Season
            </span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleBadge.bg}`}>
            {roleBadge.label}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 leading-snug">
          {locale === "bn" ? step.cropNameBn : step.cropNameEn}
        </h3>
        <p className="text-xs text-emerald-700 font-semibold mt-0.5">
          {step.varietyRecommended}
        </p>

        <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium">{locale === "bn" ? "বপন সময়:" : "Sowing:"}</span>
            </span>
            <span className="font-bold text-slate-900">{step.sowingWindow}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-medium">{locale === "bn" ? "কর্তন সময়:" : "Harvest:"}</span>
            </span>
            <span className="font-bold text-slate-900">{step.harvestWindow}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200">
            <span>{locale === "bn" ? "স্থায়িত্বকাল:" : "Duration:"}</span>
            <span className="font-mono font-bold text-slate-700">{step.durationDays} days</span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{locale === "bn" ? "প্রত্যাশিত ফলন:" : "Expected Yield:"}</span>
            <span className="font-bold text-slate-800 font-mono">{step.expectedYieldPerAcre}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{locale === "bn" ? "আনুমানিক নিট লাভ:" : "Net Margin:"}</span>
            <span className="font-bold text-amber-700 font-mono">৳{step.estimatedNetProfitBdtPerAcre.toLocaleString()}/acre</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{locale === "bn" ? "সেচের পানির চাহিদা:" : "Water Demand:"}</span>
            <span className="font-semibold text-sky-800 capitalize font-mono">{step.waterDemandLevel} ({step.waterDemandMm} mm)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{locale === "bn" ? "মডেল কনফিডেন্স:" : "Confidence:"}</span>
            <span className="font-bold text-emerald-700 font-mono">{Math.round(step.confidence * 100)}%</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
          <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>{locale === "bn" ? "বাছাইয়ের মূল কারণ:" : "Why this crop?"}</span>
          </div>
          <p>{locale === "bn" ? step.primaryRationaleBn : step.primaryRationaleEn}</p>
        </div>

        <div>
          <button
            onClick={onToggleExpand}
            className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>{locale === "bn" ? "চাষ ব্যবস্থাপনা ও ঝুঁকি" : "Management Tips & Key Risks"}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isExpanded && (
            <div className="mt-2.5 space-y-2 text-xs text-slate-600">
              <div className="space-y-1">
                <span className="font-bold text-emerald-800 text-[11px] uppercase tracking-wide">
                  {locale === "bn" ? "গুরুত্বপূর্ণ পরামর্শ:" : "Key Guidelines:"}
                </span>
                <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                  {(locale === "bn" ? step.managementTipsBn : step.managementTipsEn).map((tip, tIdx) => (
                    <li key={tIdx}>{tip}</li>
                  ))}
                </ul>
              </div>

              {step.keyRisks && step.keyRisks.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <span className="font-bold text-rose-800 text-[11px] uppercase tracking-wide flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-rose-600" />
                    {locale === "bn" ? "ঝুঁকি উপাদান:" : "Watch Out For:"}
                  </span>
                  <ul className="list-disc pl-4 space-y-0.5 text-rose-700 text-[11px]">
                    {step.keyRisks.map((risk, rIdx) => (
                      <li key={rIdx}>{risk}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
