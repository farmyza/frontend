"use client";

import React, { useState } from "react";
import { Navigation, MapPin, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { PRESET_FIELDS, PresetFieldData } from "@/lib/presets";

interface LocationPermissionBannerProps {
  currentLat: number;
  currentLng: number;
  district: string;
  locale: "en" | "bn";
  onLocationDetected: (lat: number, lng: number, districtName?: string) => void;
  onSelectPreset: (preset: PresetFieldData) => void;
}

export const LocationPermissionBanner: React.FC<LocationPermissionBannerProps> = ({
  currentLat,
  currentLng,
  district,
  locale,
  onLocationDetected,
  onSelectPreset,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null);

  const handleRequestGeolocation = () => {
    if (!navigator.geolocation) {
      setStatusMsg(
        locale === "bn"
          ? "আপনার ব্রাউজারে জিপিএস অবস্থান সমর্থন করে না।"
          : "Geolocation is not supported by your browser."
      );
      setStatusType("error");
      return;
    }

    setIsLocating(true);
    setStatusMsg(
      locale === "bn" ? "স্যাটেলাইট অবস্থান চিহ্নিত করা হচ্ছে..." : "Requesting GPS coordinate access..."
    );
    setStatusType(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(5));
        const lng = Number(position.coords.longitude.toFixed(5));
        setIsLocating(false);
        setStatusMsg(
          locale === "bn"
            ? `অবস্থান সনাক্ত হয়েছে: ${lat}° N, ${lng}° E`
            : `GPS Location locked: ${lat}° N, ${lng}° E`
        );
        setStatusType("success");
        onLocationDetected(lat, lng, "Local GPS Field");
      },
      (error) => {
        setIsLocating(false);
        setStatusType("error");
        if (error.code === error.PERMISSION_DENIED) {
          setStatusMsg(
            locale === "bn"
              ? "অবস্থান অনুমতি প্রত্যাখ্যাত। নিচের যেকোনো কৃষি অঞ্চল নির্বাচন করুন।"
              : "Location access denied. Please pick an agro-climatic region below."
          );
        } else {
          setStatusMsg(
            locale === "bn"
              ? "অবস্থান সনাক্ত করা সম্ভব হয়নি। রিজিওনাল প্রিসেট বেছে নিন।"
              : "Unable to retrieve GPS signal. Choose a regional zone below."
          );
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-slate-900/95 backdrop-blur-md border border-emerald-500/30 rounded-3xl p-4 sm:p-5 text-white shadow-xl flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base tracking-tight text-slate-100 flex items-center gap-2">
              <span>{locale === "bn" ? "লাইভ গ্লোব লোকেশন ডিটেকশন" : "Live Farm Location Detection"}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                WGS-84
              </span>
            </h4>
            <p className="text-xs text-slate-300">
              {locale === "bn"
                ? `বর্তমান ভিউ: ${district} (${currentLat.toFixed(4)}° N, ${currentLng.toFixed(4)}° E)`
                : `Current center: ${district} (${currentLat.toFixed(4)}° N, ${currentLng.toFixed(4)}° E)`}
            </p>
          </div>
        </div>

        {/* GPS Request Action Button */}
        <button
          type="button"
          onClick={handleRequestGeolocation}
          disabled={isLocating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4 fill-current" />
          )}
          <span>
            {isLocating
              ? locale === "bn"
                ? "খোঁজা হচ্ছে..."
                : "Locating..."
              : locale === "bn"
              ? "আমার খামার চিহ্নিত করুন (GPS)"
              : "Zoom to My Location (GPS)"}
          </span>
        </button>
      </div>

      {/* Status Feedback Pill */}
      {statusMsg && (
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border ${
            statusType === "success"
              ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
              : statusType === "error"
              ? "bg-rose-950/80 text-rose-300 border-rose-500/40"
              : "bg-slate-800 text-slate-200 border-slate-700"
          }`}
        >
          {statusType === "success" ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Quick Regional Agricultural Presets */}
      <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-800/80 text-xs">
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
          <MapPin className="w-3 h-3 text-emerald-400" />
          {locale === "bn" ? "কৃষি অঞ্চল প্রিসেট:" : "Regional Presets:"}
        </span>
        {PRESET_FIELDS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              onSelectPreset(p);
              setStatusMsg(null);
            }}
            className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-slate-800/90 hover:bg-emerald-800 hover:text-white text-slate-300 border border-slate-700 transition-all active:scale-95"
          >
            {locale === "bn" ? p.nameBn : p.name} ({p.district})
          </button>
        ))}
      </div>
    </div>
  );
};
