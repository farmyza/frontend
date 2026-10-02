"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { DiagnosticResponse } from "@/lib/schemas";
import { CropStepCard } from "@/components/results/CropStepCard";

interface CropRotationPlanProps {
  data: DiagnosticResponse;
  locale: "en" | "bn";
}

export const CropRotationPlan: React.FC<CropRotationPlanProps> = ({
  data,
  locale,
}) => {
  const [activeSequenceTab, setActiveSequenceTab] = useState<"optimal" | "alternative">("optimal");
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  const { recommendations } = data;
  const { optimalSequence, alternativeSequence, cycleSummary } = recommendations;

  const currentSequence =
    activeSequenceTab === "optimal" ? optimalSequence : alternativeSequence;

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {locale === "bn" ? "১২-মাসের বৈজ্ঞানিক শস্য ঘূর্ণন পরিকল্পনা" : "12-Month Decision-Support Crop Rotation"}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {locale === "bn"
              ? "মাটির পুষ্টি, পানির সীমাবদ্ধতা ও ঋতুভিত্তিক আবহাওয়ার নিখুঁত সমন্বয়"
              : "Synchronized with seasonal agro-climatic windows, moisture curves, and nutrient dynamics"}
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveSequenceTab("optimal")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSequenceTab === "optimal"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {locale === "bn" ? "সর্বোত্তম সুপারিশ (Optimal)" : "Optimal Rotation (Recommended)"}
          </button>
          {alternativeSequence.length > 0 && (
            <button
              onClick={() => setActiveSequenceTab("alternative")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSequenceTab === "alternative"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {locale === "bn" ? "বিকল্প বিন্যাস (Alternative)" : "Alternative Rotation"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
            {locale === "bn" ? "নাইট্রোজেন সংবন্ধন" : "Net N Fixation"}
          </span>
          <div className="mt-2">
            <span className="text-xl font-extrabold font-mono text-emerald-900">
              +{cycleSummary.netNitrogenFixationKgHa}
            </span>
            <span className="text-xs text-emerald-700 ml-1">kg/ha</span>
          </div>
          <span className="text-[10px] text-emerald-600 mt-1">
            {locale === "bn" ? "২৫-৩০% ইউরিয়া সাশ্রয়" : "~30% Urea saved"}
          </span>
        </div>

        <div className="bg-sky-50/70 border border-sky-200 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wide">
            {locale === "bn" ? "সেচের পানি সাশ্রয়" : "Water Savings"}
          </span>
          <div className="mt-2">
            <span className="text-xl font-extrabold font-mono text-sky-900">
              {cycleSummary.waterSavingsComparedToMonoculturePct}%
            </span>
            <span className="text-xs text-sky-700 ml-1">less water</span>
          </div>
          <span className="text-[10px] text-sky-600 mt-1">
            {locale === "bn" ? "বোরো ধানের তুলনায়" : "vs Double-Rice"}
          </span>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
            {locale === "bn" ? "প্রত্যাশিত নিট লাভ" : "Annual Net Profit"}
          </span>
          <div className="mt-2">
            <span className="text-xl font-extrabold font-mono text-amber-900">
              ৳{(cycleSummary.projectedAnnualProfitBdtPerAcre / 1000).toFixed(0)}k
            </span>
            <span className="text-xs text-amber-700 ml-1">/acre</span>
          </div>
          <span className="text-[10px] text-amber-600 mt-1">
            {locale === "bn" ? "বাৎসরিক ৩ ফসলে" : "3-Crop Sequence"}
          </span>
        </div>

        <div className="bg-teal-50/70 border border-teal-200 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wide">
            {locale === "bn" ? "জৈব পদার্থ বৃদ্ধি" : "Soil OM Boost"}
          </span>
          <div className="mt-2">
            <span className="text-xl font-extrabold font-mono text-teal-900">
              +{cycleSummary.soilOrganicMatterImprovementPct}%
            </span>
          </div>
          <span className="text-[10px] text-teal-600 mt-1">
            {locale === "bn" ? "মাইক্রোবায়োম পুনরুজ্জীবন" : "Root biomass boost"}
          </span>
        </div>

        <div className="bg-rose-50/70 border border-rose-200 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wide">
            {locale === "bn" ? "পোকার চক্র ভঙ্গ" : "Pest Break Score"}
          </span>
          <div className="mt-2">
            <span className="text-xl font-extrabold font-mono text-rose-900">
              {cycleSummary.pestBreakEffectivenessPct}%
            </span>
          </div>
          <span className="text-[10px] text-rose-600 mt-1">
            {locale === "bn" ? "মাজরা ও ব্লাইট দমন" : "Stem-Borer break"}
          </span>
        </div>

        <div className="bg-purple-50/70 border border-purple-200 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wide">
            {locale === "bn" ? "সুপারিশের নিশ্চয়তা" : "Model Confidence"}
          </span>
          <div className="mt-2">
            <span className="text-xl font-extrabold font-mono text-purple-900">
              {cycleSummary.overallConfidenceScore}%
            </span>
          </div>
          <span className="text-[10px] text-purple-600 mt-1">
            {locale === "bn" ? "কৃষিতাত্ত্বিক ম্যাট্রিক্স" : "Deterministic Engine"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative">
        {currentSequence.map((step) => (
          <CropStepCard
            key={step.cropKey}
            step={step}
            isExpanded={expandedStep === step.step}
            onToggleExpand={() => setExpandedStep(expandedStep === step.step ? null : step.step)}
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
};
