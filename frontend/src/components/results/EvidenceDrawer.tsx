"use client";

import React, { useState } from "react";
import {
  FileText,
  BarChart3,
  Terminal,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from "lucide-react";
import { DiagnosticResponse } from "@/lib/schemas";

interface EvidenceDrawerProps {
  data: DiagnosticResponse;
  locale: "en" | "bn";
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  data,
  locale,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<"weather_ts" | "rules_log" | "citations">("weather_ts");

  const { evidence, metadata } = data;
  const { nasaPowerTimeSeries, ruleEngineTriggers, scientificCitations } = evidence;

  const maxRain = Math.max(...nasaPowerTimeSeries.map((p) => p.precipitationMm), 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <FileText className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                {locale === "bn" ? "কৃষিতাত্ত্বিক প্রমাণ ও উপগ্রহ তথ্যভাণ্ডার (Evidence Layer)" : "Agronomic Evidence & Satellite Data Layer"}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                NASA POWER + Rule Engine Trace
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {locale === "bn"
                ? "১২ মাসের বৃষ্টিপাত ও তাপমাত্রা বিশ্লেষণ, কার্যকরী নিয়মের লগ এবং গবেষণা সূত্র"
                : "Explore 12-month climatology time-series, executed logic rules, and research citations"}
            </p>
          </div>
        </div>

        <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/50 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveEvidenceTab("weather_ts")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeEvidenceTab === "weather_ts"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{locale === "bn" ? "১২ মাসের বৃষ্টিপাত ও তাপমাত্রা" : "12-Month Met Time Series"}</span>
            </button>

            <button
              onClick={() => setActiveEvidenceTab("rules_log")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeEvidenceTab === "rules_log"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{locale === "bn" ? "ইঞ্জিন এক্সিকিউশন লগ" : "Rule Engine Trace"}</span>
            </button>

            <button
              onClick={() => setActiveEvidenceTab("citations")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeEvidenceTab === "citations"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{locale === "bn" ? "বৈজ্ঞানিক গবেষণা সূত্র" : "Research Citations"}</span>
            </button>
          </div>

          {activeEvidenceTab === "weather_ts" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  {locale === "bn" ? "মাসিক গড় বৃষ্টিপাত (নীল বার) ও সর্বোচ্চ তাপমাত্রা (লাল পয়েন্ট)" : "Monthly Precipitation (Blue Bars) & Peak Temperature (Orange)"}
                </span>
                <span className="text-[11px] font-mono text-slate-500">Source: {metadata.dataSourceLabels.nasaPower}</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="h-48 flex items-end justify-between gap-1 sm:gap-2 pt-6">
                  {nasaPowerTimeSeries.map((pt, i) => {
                    const barHeightPct = (pt.precipitationMm / maxRain) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        <div className="absolute -top-12 bg-slate-900 text-white text-[10px] font-mono py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
                          <div>{pt.precipitationMm} mm Rain</div>
                          <div>{pt.tempMaxC}°C Max / {pt.tempMinC}°C Min</div>
                        </div>

                        <div
                          className="w-2 h-2 rounded-full bg-amber-500 mb-1 ring-1 ring-white"
                          title={`${pt.tempMaxC}°C`}
                        />

                        <div
                          className="w-full max-w-[28px] bg-gradient-to-t from-sky-600 to-sky-400 rounded-t-sm transition-all duration-300 group-hover:from-sky-700 group-hover:to-sky-500"
                          style={{ height: `${Math.max(barHeightPct, 4)}%` }}
                        />

                        <span className="text-[10px] font-mono text-slate-500 mt-2">
                          {pt.date}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-sky-500 rounded-xs" />
                      <span>{locale === "bn" ? "বৃষ্টিপাত (মিমি)" : "Precipitation (mm)"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>{locale === "bn" ? "তাপমাত্রা (°C)" : "Temperature (°C)"}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-700 font-bold">
                    {metadata.liveNasaStatus === "connected" ? "Live Satellite Feed" : "Climatology Normal"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeEvidenceTab === "rules_log" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>{locale === "bn" ? "ট্রিগার হওয়া কৃষিতাত্ত্বিক নিয়মসমূহ:" : "Evaluated Rule Trace:"}</span>
                <span className="font-mono text-[11px] text-slate-500">{metadata.dataSourceLabels.ruleEngine}</span>
              </div>

              <div className="space-y-2">
                {ruleEngineTriggers.map((rule, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between text-emerald-700 font-bold">
                      <span>{rule.triggeredRule}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                        MATCHED
                      </span>
                    </div>
                    <div className="text-slate-600">
                      <span className="text-slate-400">PARAM:</span> {rule.parameter} ={" "}
                      <span className="text-slate-900 font-semibold">{rule.observedValue}</span>
                    </div>
                    <div className="text-slate-500 font-sans text-[11px] pt-1 border-t border-slate-100">
                      <span className="font-bold text-slate-700">Impact: </span>
                      {rule.impactOnSelection}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeEvidenceTab === "citations" && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-800">
                {locale === "bn" ? "গবেষণা জার্নাল ও প্রাতিষ্ঠানিক রেফারেন্স:" : "Peer-Reviewed Agronomic Literature:"}
              </span>

              <div className="space-y-2.5">
                {scientificCitations.map((cite, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1 hover:border-emerald-300 transition-colors"
                  >
                    <div className="font-bold text-slate-900 leading-snug">{cite.title}</div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>{cite.institution}</span>
                      <span className="font-mono font-semibold">{cite.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="text-[11px]">
                {locale === "bn"
                  ? "স্বচ্ছতা নিশ্চয়তা: আবহাওয়া ডেটা নাসা স্যাটেলাইট থেকে এবং শস্য নির্বাচন বিএআরআই ও বিআরআরআই মানদণ্ডে পরীক্ষিত।"
                  : "Transparency Guarantee: Weather sourced from NASA POWER API. Recommendations generated by deterministic agronomy engine."}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
