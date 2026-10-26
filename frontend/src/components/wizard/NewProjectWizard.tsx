"use client";

import React, { useState, useEffect } from "react";
import { FarmFieldInput } from "@/lib/schemas";
import { PresetFieldData } from "@/lib/presets";
import { MapOnlyField } from "@/components/map/MapOnlyField";
import { PredictionPipeline } from "@/components/wizard/PredictionPipeline";
import { ArrowLeft } from "lucide-react";

interface NewProjectWizardProps {
  fieldInput: FarmFieldInput;
  onChangeField: (updated: Partial<FarmFieldInput>) => void;
  onSelectPreset: (preset: PresetFieldData) => void;
  onSubmit: (projectName: string) => Promise<void>;
  onCancel: () => void;
  isAnalyzing: boolean;
  locale: "en" | "bn";
}

export const NewProjectWizard: React.FC<NewProjectWizardProps> = ({
  fieldInput,
  onChangeField,
  onSubmit,
  onCancel,
  isAnalyzing,
  locale,
}) => {
  const [perm, setPerm] = useState<"checking" | "prompt" | "granted" | "denied">("checking");
  const [projectName, setProjectName] = useState(fieldInput.name || `${fieldInput.district} Farm Plot`);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
          if (cancelled) return;
          if (status.state === "granted") setPerm("granted");
          else if (status.state === "denied") setPerm("denied");
          else setPerm("prompt");
          status.onchange = () => {
            if (status.state === "granted") setPerm("granted");
            else if (status.state === "denied") setPerm("denied");
            else setPerm("prompt");
          };
          return;
        }
      } catch {
        // fall through
      }
      if (cancelled) return;
      setPerm("prompt");
    }
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setPerm("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => setPerm("granted"),
      () => setPerm("denied"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(projectName.trim() || `${fieldInput.district} Farm Plot`);
  };

  if (perm === "checking") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-slate-600">
        {locale === "bn" ? "লোড হচ্ছে..." : "Loading..."}
      </div>
    );
  }

  if (perm === "denied") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold text-slate-900">
          {locale === "bn" ? "লোকেশন অ্যাক্সেস ছাড়া আমরা কাজ করতে পারি না" : "We can't operate without location access"}
        </h2>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm"
        >
          {locale === "bn" ? "ফিরে যান" : "Go back"}
        </button>
      </div>
    );
  }

  if (perm === "prompt") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold text-slate-900">
          {locale === "bn" ? "লোকেশন অনুমতি প্রয়োজন" : "Location permission required"}
        </h2>
        <p className="text-sm text-slate-600">
          {locale === "bn" ? "মানচিত্রে আপনার জমি চিহ্নিত করতে লোকেশন অনুমতি দিন।" : "Grant location access to locate your field on the map."}
        </p>
        <button
          onClick={requestLocation}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700"
        >
          {locale === "bn" ? "অনুমতি দিন" : "Grant permission"}
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm"
        >
          {locale === "bn" ? "বাতিল" : "Cancel"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{locale === "bn" ? "ফিরে যান" : "Back"}</span>
        </button>
      </div>

      <MapOnlyField fieldInput={fieldInput} onChangeField={onChangeField} locale={locale} isGenerating={isGenerating} />

      <PredictionPipeline fieldInput={fieldInput} onChangeField={onChangeField} locale={locale} onStatusChange={(s) => setIsGenerating(s === "loading")} />

      <form onSubmit={handleSubmit} className="flex items-center justify-end gap-3">
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder={locale === "bn" ? "প্রজেক্টের নাম" : "Project name"}
          className="px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          required
        />
        <button
          type="submit"
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold text-sm shadow-xl disabled:opacity-50"
        >
          {isAnalyzing
            ? locale === "bn"
              ? "সংরক্ষণ হচ্ছে..."
              : "Saving..."
            : locale === "bn"
            ? "শস্য আবর্তন প্ল্যান তৈরি করুন"
            : "Generate Agronomic Plan"}
        </button>
      </form>
    </div>
  );
};
