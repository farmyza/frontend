"use client";

import React, { useState } from "react";
import { FarmFieldInput } from "@/lib/schemas";
import { PresetFieldData } from "@/lib/presets";
import { FieldMap } from "@/components/map/FieldMap";
import { LocationPermissionBanner } from "@/components/wizard/LocationPermissionBanner";
import {
  Sparkles,
  Layers,
  ArrowLeft,
  Loader2,
  Droplets,
  Calendar,
} from "lucide-react";

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
  onSelectPreset,
  onSubmit,
  onCancel,
  isAnalyzing,
  locale,
}) => {
  const [projectName, setProjectName] = useState(
    fieldInput.name || `${fieldInput.district} Farm Plot`
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(projectName.trim() || `${fieldInput.district} Farm Plot`);
  };

  const handleLocationDetected = (lat: number, lng: number, districtName?: string) => {
    onChangeField({
      centerCoordinates: { lat, lng },
      district: districtName || fieldInput.district,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 animate-fadeIn">
      {/* Wizard Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{locale === "bn" ? "প্রজেক্ট তালিকায় ফিরে যান" : "Back to Projects"}</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            {locale === "bn" ? "নতুন খামার বিশ্লেষণ প্রজেক্ট" : "New Field Project Wizard"}
          </span>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
        {/* Step 1: Live Globe Geolocation Permission & Preset Zoom */}
        <LocationPermissionBanner
          currentLat={fieldInput.centerCoordinates.lat}
          currentLng={fieldInput.centerCoordinates.lng}
          district={fieldInput.district}
          locale={locale}
          onLocationDetected={handleLocationDetected}
          onSelectPreset={onSelectPreset}
        />

        {/* Step 2: Interactive Satellite Map with Freehand Circle-to-Select */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                1
              </span>
              <span>
                {locale === "bn"
                  ? "মানচিত্রে মাউস দিয়ে গোল করে জমি চিহ্নিত করুন"
                  : "Circle your field plot on the live satellite map"}
              </span>
            </h3>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              {locale === "bn" ? "Google Circle-to-Search প্রযুক্তি সক্রিয়" : "Google Circle-to-Select Active"}
            </span>
          </div>

          <FieldMap
            fieldInput={fieldInput}
            onChangeField={onChangeField}
            locale={locale}
          />
        </div>

        {/* Step 3: Minimal Field Configuration Parameters */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col gap-5">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
              2
            </span>
            <span>{locale === "bn" ? "খামারের মূল তথ্যাদি" : "Basic Field Parameters"}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Project Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                {locale === "bn" ? "প্রজেক্টের নাম" : "Project Name"}
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Farm Plot"
                className="px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            {/* Soil Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                {locale === "bn" ? "মাটির প্রকৃতি" : "Soil Texture"}
              </label>
              <select
                value={fieldInput.soilType}
                onChange={(e) => onChangeField({ soilType: e.target.value as any })}
                className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="clay_loam">{locale === "bn" ? "এঁটেল দোআঁশ (Clay Loam)" : "Clay Loam"}</option>
                <option value="silt_loam">{locale === "bn" ? "পলি দোআঁশ (Silt Loam)" : "Silt Loam"}</option>
                <option value="sandy_loam">{locale === "bn" ? "বেলে দোআঁশ (Sandy Loam)" : "Sandy Loam"}</option>
                <option value="saline_clay">{locale === "bn" ? "উপকূলীয় লবণাক্ত কাদা (Saline Clay)" : "Saline Clay"}</option>
                <option value="alluvial_silt">{locale === "bn" ? "পলিমাটি (Alluvial Silt)" : "Alluvial Silt"}</option>
                <option value="peat_basin">{locale === "bn" ? "হাওর পিট মাটি (Peat Basin)" : "Peat Basin"}</option>
              </select>
            </div>

            {/* Salinity EC */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  {locale === "bn" ? "মাটির লবণাক্ততা" : "Soil Salinity (EC)"}
                </label>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {fieldInput.currentSalinityEC} dS/m
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="16.0"
                step="0.5"
                value={fieldInput.currentSalinityEC}
                onChange={(e) => onChangeField({ currentSalinityEC: Number(e.target.value) })}
                className="accent-emerald-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Water Availability */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-sky-600" />
                <span>{locale === "bn" ? "পানির প্রাপ্যতা" : "Water Regime"}</span>
              </label>
              <select
                value={fieldInput.waterAvailability}
                onChange={(e) => onChangeField({ waterAvailability: e.target.value as any })}
                className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="deep_tubewell_secure">{locale === "bn" ? "পর্যাপ্ত সেচ (গভীর নলকূপ)" : "Full Irrigation (Deep Tubewell)"}</option>
                <option value="limited_shallow_tubewell">{locale === "bn" ? "সীমিত সেচ (অগভীর নলকূপ)" : "Limited Shallow Tubewell"}</option>
                <option value="canal_surface_water">{locale === "bn" ? "খাল / নদীর উপরিভাগের পানি" : "Canal / Surface Water"}</option>
                <option value="rainfed_only">{locale === "bn" ? "সম্পূর্ণ বৃষ্টির পানি নির্ভর" : "Rainfed Only (Drought Risk)"}</option>
                <option value="waterlogged_seasonal">{locale === "bn" ? "মৌসুমি জলাবদ্ধতা" : "Seasonal Waterlogging"}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 4: Primary Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 rounded-2xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all active:scale-95"
          >
            {locale === "bn" ? "বাতিল" : "Cancel"}
          </button>
          <button
            type="submit"
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-sm shadow-xl shadow-emerald-700/25 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{locale === "bn" ? "বিশ্লেষণ ও সংরক্ষণ হচ্ছে..." : "Diagnosing & Saving Project..."}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{locale === "bn" ? "শস্য আবর্তন প্ল্যান তৈরি করুন" : "Generate Agronomic Plan"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
