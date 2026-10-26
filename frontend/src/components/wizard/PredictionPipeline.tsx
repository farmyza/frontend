"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { FarmFieldInput, DiagnosticResponse } from "@/lib/schemas";
import { evaluateAgronomicRules } from "@/lib/rule-engine";
import { CropRotationPlan } from "@/components/results/CropRotationPlan";
import { Loader2 } from "lucide-react";

interface Props {
  fieldInput: FarmFieldInput;
  onChangeField: (u: Partial<FarmFieldInput>) => void;
  locale: "en" | "bn";
  onStatusChange?: (status: "idle" | "loading" | "error" | "success") => void;
}

interface PredictResult {
  forecast: {
    t2m_max_predicted: number;
    prectotcorr_predicted: number;
    rh2m_predicted: number;
    gwetroot_predicted: number;
    t2m_min_predicted: number;
  };
  recommended_crop: string;
  adaptation_reason: string;
}

export const PredictionPipeline: React.FC<Props> = ({ fieldInput, onChangeField, locale, onStatusChange }) => {
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [result, setResult] = useState<PredictResult | null>(null);
  const [diag, setDiag] = useState<DiagnosticResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const lastKey = useRef<string>("");

  const run = useCallback(async () => {
    const lat = fieldInput.centerCoordinates.lat;
    const lng = fieldInput.centerCoordinates.lng;
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    if (key === lastKey.current && status === "success") return;
    lastKey.current = key;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/v1/nasa-history?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}`);
      if (!res.ok) throw new Error("nasa_failed");
      const json = await res.json();
      const history = json?.history;
      if (!Array.isArray(history) || history.length < 12) throw new Error("nasa_insufficient");
      const predRes = await fetch("/api/v1/predict-crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: { lat, lon: lng }, historical_data: history }),
      });
      if (!predRes.ok) {
        const err = await predRes.json().catch(() => ({}));
        throw new Error(err.error || "ml_failed");
      }
      const pred = (await predRes.json()) as PredictResult;
      setResult(pred);
      const nasaWeather = {
        avgTemp: pred.forecast.t2m_max_predicted,
        annualRainfall: pred.forecast.prectotcorr_predicted * 365,
        forecastRainfall30d: pred.forecast.prectotcorr_predicted * 30,
        solarRad: 18,
        humidity: pred.forecast.rh2m_predicted,
      };
      const d = evaluateAgronomicRules(fieldInput, nasaWeather);
      setDiag(d);
      setStatus("success");
    } catch (e: any) {
      setErrorMsg(e?.message || "error");
      setStatus("error");
    }
  }, [fieldInput, status]);

  useEffect(() => {
    const hasCircle = fieldInput.polygon.coordinates[0]?.length > 5;
    if (hasCircle && status === "idle") {
      run();
    }
  }, [fieldInput.polygon, status, run]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  if (status === "idle") {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        {locale === "bn" ? "জমি গোল করুন বিশ্লেষণ শুরু করতে।" : "Circle your land to start analysis."}
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="p-6 flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="text-xs text-slate-500">
          {locale === "bn" ? "জেনারেট হচ্ছে..." : "Generating..."}
        </span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-6 text-center flex flex-col items-center gap-3">
        <span className="text-sm text-red-600 font-semibold">
          {errorMsg.startsWith("nasa")
            ? locale === "bn"
              ? "NASA তথ্য আনা যায়নি।"
              : "Could not fetch NASA data."
            : errorMsg.startsWith("ml_service") || errorMsg === "ml_failed"
            ? locale === "bn"
              ? "ML সার্ভিস চালু নেই।"
              : "ML service unavailable."
            : locale === "bn"
            ? "বিশ্লেষণ ব্যর্থ।"
            : "Analysis failed."}
        </span>
        <button
          onClick={() => {
            setStatus("idle");
            lastKey.current = "";
          }}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
        >
          {locale === "bn" ? "আবার চেষ্টা" : "Retry"}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-4">
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-slate-50">
            <div className="text-slate-500">T2M max</div>
            <div className="font-bold">{result.forecast.t2m_max_predicted.toFixed(1)}°C</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-50">
            <div className="text-slate-500">Rain</div>
            <div className="font-bold">{result.forecast.prectotcorr_predicted.toFixed(1)} mm/d</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-50">
            <div className="text-slate-500">RH</div>
            <div className="font-bold">{result.forecast.rh2m_predicted.toFixed(1)}%</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-50">
            <div className="text-slate-500">GWETROOT</div>
            <div className="font-bold">{result.forecast.gwetroot_predicted.toFixed(2)}</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-50">
            <div className="text-slate-500">T2M min</div>
            <div className="font-bold">{result.forecast.t2m_min_predicted.toFixed(1)}°C</div>
          </div>
        </div>
      )}
      {result && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="font-bold text-emerald-800">
            {locale === "bn" ? "সুপারিশকৃত ফসল" : "Recommended crop"}: {result.recommended_crop}
          </div>
          <div className="text-xs text-slate-700 mt-1">{result.adaptation_reason}</div>
        </div>
      )}
      {diag && (
        <CropRotationPlan data={diag} locale={locale} />
      )}
    </div>
  );
};
