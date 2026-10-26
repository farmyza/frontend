"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/user-context";
import {
  Sprout,
  Globe,
  Menu,
  X,
  FolderOpen,
  PlusCircle,
  Sparkles,
  ChevronDown,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { activeUser, isDemoMode, locale, setLocale, projectCount, signIn, signOut, isLoading } = useUser();
  const pathname = usePathname();
  // mobile menu removed

  const isProjects = pathname === "/" || pathname === "/projects";
  const isNew = pathname === "/new";
  const isSolution = pathname.startsWith("/projects/") && pathname !== "/projects/new";

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <Link href="/projects" className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Farm<span className="text-emerald-600">yza</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                MPA
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500 font-medium leading-none">
              {locale === "bn" ? "কৃষি শস্য আবর্তন সিদ্ধান্ত-সহায়তা" : "Crop Rotation Decision Support"}
            </p>
          </div>
        </Link>

        {/* Center: only active solution badge if applicable */}
        <div className="hidden md:flex items-center gap-1.5">
          {isSolution && (
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white shadow-xs font-extrabold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>{locale === "bn" ? "সক্রিয় সমাধান" : "Active Solution"}</span>
            </span>
          )}
        </div>

        {/* Right User Profile & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isDemoMode && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
              {locale === "bn" ? "ডেমো মোড" : "Demo mode"}
            </span>
          )}

          {activeUser ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold">
                {activeUser.avatar ? (
                  <img src={activeUser.avatar} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <span className="text-base">👤</span>
                )}
                <span className="hidden sm:inline truncate max-w-[110px]">{activeUser.name.split(" ")[0]}</span>
              </div>
              {!isDemoMode && (
                <button
                  onClick={() => signOut()}
                  className="px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700"
                >
                  {locale === "bn" ? "সাইন আউট" : "Sign out"}
                </button>
              )}
            </div>
          ) : (
            !isDemoMode && (
              <button
                onClick={() => signIn()}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                {locale === "bn" ? "Google দিয়ে সাইন ইন" : "Sign in with Google"}
              </button>
            )
          )}

          {/* Language Toggle */}
          <button
            onClick={() => setLocale(locale === "en" ? "bn" : "en")}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl transition-all active:scale-95 cursor-pointer"
            title="Toggle English / বাংলা"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-700" />
            <span>{locale === "en" ? "বাংলা" : "EN"}</span>
          </button>

        </div>
      </div>

</header>
  );
};
