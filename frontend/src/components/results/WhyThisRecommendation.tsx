"use client";

import React from "react";
import { Cpu, CheckCircle, ArrowRight, ShieldCheck, Droplets, Sparkles, Bug } from "lucide-react";
import { DiagnosticResponse } from "@/lib/schemas";

interface WhyThisRecommendationProps {
  data: DiagnosticResponse;
  locale: "en" | "bn";
}

export const WhyThisRecommendation: React.FC<WhyThisRecommendationProps> = ({
  data,
  locale,
}) => {
  const drivers = data.recommendations.whyThisRecommendation;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
            <Cpu className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {locale === "bn" ? "এই সুপারিশ কেন করা হলো? (ML ড্রাইভার বিশ্লেষণ)" : "Why This Recommendation? (Decision Drivers)"}
            </h3>
            <p className="text-xs text-slate-500">
              {locale === "bn"
                ? "কোন কোন উপাদান ও কৃষিতাত্ত্বিক নিয়মের ভিত্তিতে এই শস্য বিন্যাস প্রস্তুত করা হয়েছে"
                : "Transparent breakdown of the exact agro-ecological factors driving this rotation matrix"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map((driver, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:bg-slate-100/80 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">
                  {locale === "bn" ? driver.driverBn : driver.driver}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    driver.impact === "high"
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {driver.impact} Impact
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {locale === "bn" ? driver.explanationBn : driver.explanationEn}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200/70 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{locale === "bn" ? "ম্যাট্রিক্স নিয়ম কার্যকরী" : "Rule Trigger Active"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
