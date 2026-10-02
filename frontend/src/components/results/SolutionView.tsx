"use client";

import React from "react";
import { DiagnosticResponse } from "@/lib/schemas";
import { DiagnosticOverview } from "@/components/results/DiagnosticOverview";
import { CropRotationPlan } from "@/components/results/CropRotationPlan";
import { WhyThisRecommendation } from "@/components/results/WhyThisRecommendation";
import { EvidenceDrawer } from "@/components/results/EvidenceDrawer";
import {
  MessageSquare,
  ArrowLeft,
  Share2,
  Sparkles,
  MapPin,
  Calendar,
} from "lucide-react";

interface SolutionViewProps {
  projectName: string;
  result: DiagnosticResponse;
  locale: "en" | "bn";
  onBackToProjects: () => void;
  onOpenAiChat: () => void;
}

export const SolutionView: React.FC<SolutionViewProps> = ({
  projectName,
  result,
  locale,
  onBackToProjects,
  onOpenAiChat,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 animate-fadeIn">
      {/* Project Navigation & Actions Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToProjects}
            className="p-2 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all active:scale-95"
            title="Back to Projects Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {result.fieldOverview.district}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono font-bold text-slate-600">
                {result.fieldOverview.areaHectares} ha ({result.fieldOverview.areaBigha} bigha)
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">{projectName}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Prominent One-Click AI Chat CTA */}
          <button
            onClick={onOpenAiChat}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-700/25 transition-all active:scale-95 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{locale === "bn" ? "কৃষি এআই বিশেষজ্ঞের সাথে আলাপ" : "Ask AI Agronomist"}</span>
          </button>
        </div>
      </div>

      {/* 4-Pillar Diagnostics Scorecard */}
      <DiagnosticOverview data={result} locale={locale} />

      {/* Recommended 12-Month Crop Rotation Matrix */}
      <CropRotationPlan data={result} locale={locale} />

      {/* Why This Recommendation Scientific Drivers */}
      <WhyThisRecommendation data={result} locale={locale} />

      {/* Scientific Evidence & Climatology Drawer */}
      <EvidenceDrawer data={result} locale={locale} />
    </div>
  );
};
