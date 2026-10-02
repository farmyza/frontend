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
  const { activeUser, locale, setLocale, setIsUserModalOpen, projectCount } = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isProjects = pathname === "/" || pathname === "/projects";
  const isNew = pathname === "/projects/new";
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

        {/* Center Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 text-xs font-bold">
          <Link
            href="/projects"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              isProjects
                ? "bg-white text-slate-900 shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FolderOpen className="w-4 h-4 text-emerald-600" />
            <span>{locale === "bn" ? "আমার প্রজেক্টসমূহ" : "My Projects"}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
              {projectCount}
            </span>
          </Link>

          <Link
            href="/projects/new"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              isNew
                ? "bg-white text-slate-900 shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>{locale === "bn" ? "+ নতুন প্রজেক্ট" : "+ New Project"}</span>
          </Link>

          {isSolution && (
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white shadow-xs font-extrabold">
              <Sparkles className="w-4 h-4" />
              <span>{locale === "bn" ? "সক্রিয় সমাধান" : "Active Solution"}</span>
            </span>
          )}
        </nav>

        {/* Right User Profile & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Account Switcher Button */}
          <button
            onClick={() => setIsUserModalOpen(true)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 transition-all active:scale-95 text-xs font-bold cursor-pointer"
            title="Switch User Profile"
          >
            <span className="text-base">{activeUser.avatar || "👤"}</span>
            <span className="hidden sm:inline truncate max-w-[110px]">{activeUser.name.split(" ")[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLocale(locale === "en" ? "bn" : "en")}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl transition-all active:scale-95 cursor-pointer"
            title="Toggle English / বাংলা"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-700" />
            <span>{locale === "en" ? "বাংলা" : "EN"}</span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden p-4 bg-white border-b border-slate-200 flex flex-col gap-2.5 animate-fadeIn">
          <Link
            href="/projects"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full p-3 rounded-2xl text-left font-bold text-xs flex items-center justify-between ${
              isProjects ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-slate-50 text-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-emerald-600" />
              <span>{locale === "bn" ? "আমার প্রজেক্টসমূহ" : "My Projects"}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
              {projectCount}
            </span>
          </Link>

          <Link
            href="/projects/new"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full p-3 rounded-2xl text-left font-bold text-xs flex items-center gap-2 ${
              isNew ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-slate-50 text-slate-800"
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>{locale === "bn" ? "+ নতুন প্রজেক্ট তৈরি করুন" : "+ Create New Project"}</span>
          </Link>

          <button
            onClick={() => {
              setIsUserModalOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full p-3 rounded-2xl bg-slate-100 text-left font-bold text-xs text-slate-800 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{activeUser.avatar}</span>
              <span>{activeUser.name}</span>
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">Switch User</span>
          </button>
        </div>
      )}
    </header>
  );
};
