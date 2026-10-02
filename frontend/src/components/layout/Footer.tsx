"use client";

import React from "react";
import { useUser } from "@/lib/user-context";
import { ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  const { locale } = useUser();

  return (
    <footer className="mt-auto bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            {locale === "bn"
              ? "টিম সলভেন্ট — নাসা স্পেস অ্যাপস ও টেকসই কৃষি সিদ্ধান্ত সহায়তা ব্যবস্থা"
              : "Team Solven — Agro-Ecological Decision Support Platform"}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Powered by NASA POWER API • BARI/BRRI Crop Rotations • Next.js 14 MPA
        </div>
      </div>
    </footer>
  );
};
