"use client";

import React from "react";
import { UserProject } from "@/lib/db";
import {
  FolderPlus,
  Plus,
  Trash2,
  ArrowRight,
  Sprout,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";

interface ProjectsDashboardProps {
  projects: UserProject[];
  activeUserName: string;
  locale: "en" | "bn";
  onOpenProject: (project: UserProject) => void;
  onDeleteProject: (projectId: string) => void;
  onStartNewProject: () => void;
}

export const ProjectsDashboard: React.FC<ProjectsDashboardProps> = ({
  projects,
  activeUserName,
  locale,
  onOpenProject,
  onDeleteProject,
  onStartNewProject,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 animate-fadeIn">
      {/* Dashboard Welcome Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl border border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {locale === "bn" ? "ব্যবহারকারী প্রজেক্ট ড্যাশবোর্ড" : "Project Portfolio"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {locale === "bn"
              ? `স্বাগতম, ${activeUserName}`
              : `Welcome back, ${activeUserName}`}
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            {locale === "bn"
              ? "আপনার সংরক্ষিত খামার বিশ্লেষণ, স্যাটেলাইট কোঅর্ডিনেট এবং শস্য আবর্তন প্রজেক্টসমূহ।"
              : "Manage your diagnosed field plots, soil diagnostic records, and 12-month rotation plans."}
          </p>
        </div>

        <button
          onClick={onStartNewProject}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer"
        >
          <FolderPlus className="w-5 h-5" />
          <span>{locale === "bn" ? "+ নতুন প্রজেক্ট তৈরি করুন" : "+ Create New Project"}</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-slate-900">
            {locale === "bn" ? `সংরক্ষিত প্রজেক্টসমূহ (${projects.length})` : `Saved Projects (${projects.length})`}
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {locale === "bn" ? "SQLite লোকাল ডেটাবেজে সিঙ্ক করা" : "Synced to SQLite DB"}
          </span>
        </div>

        {projects.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-300 flex flex-col items-center justify-center gap-4 shadow-xs">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <Plus className="w-10 h-10 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-800">
                {locale === "bn" ? "কোনো প্রজেক্ট পাওয়া যায়নি" : "No Farm Projects Created Yet"}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                {locale === "bn"
                  ? "মানচিত্রে আপনার খামারের চারপাশে গোল দাগ দিয়ে এলাকা নির্ধারণ করুন এবং শস্য পরামর্শ তৈরি করুন।"
                  : "Start by creating a new project. Use the circle-to-select tool over your satellite land plot."}
              </p>
            </div>
            <button
              onClick={onStartNewProject}
              className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <FolderPlus className="w-4 h-4" />
              <span>{locale === "bn" ? "প্রথম প্রজেক্ট তৈরি করুন" : "Create First Project"}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Project Card */}
            <div
              onClick={onStartNewProject}
              className="group p-6 rounded-3xl border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-white/50 hover:bg-emerald-50/30 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3 min-h-[220px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-700 flex items-center justify-center transition-colors shadow-xs">
                <FolderPlus className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {locale === "bn" ? "+ নতুন খামার প্রজেক্ট" : "+ New Farm Project"}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {locale === "bn" ? "স্যাটেলাইট সার্কেল ড্র দিয়ে শুরু করুন" : "Circle plot on satellite map"}
                </p>
              </div>
            </div>

            {/* Saved Project Cards */}
            {projects.map((proj) => {
              const rotation = proj.diagnosticResult?.recommendations.optimalSequence;
              return (
                <div
                  key={proj.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {proj.district}
                        </span>
                        <h4 className="font-extrabold text-base text-slate-900 mt-1.5 group-hover:text-emerald-700 transition-colors">
                          {proj.name}
                        </h4>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(proj.id);
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {proj.centerLat.toFixed(3)}°N, {proj.centerLng.toFixed(3)}°E
                      </span>
                      <span>•</span>
                      <span className="font-bold text-slate-700">
                        {proj.areaHa} ha ({(proj.areaHa * 7.47).toFixed(1)} bigha)
                      </span>
                    </div>

                    {rotation && (
                      <div className="mt-1 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Layers className="w-3 h-3 text-emerald-600" />
                          {locale === "bn" ? "শস্য আবর্তন বিন্যাস:" : "Rotation Plan:"}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {rotation.map((c, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                            >
                              {locale === "bn" ? c.cropNameBn : c.cropNameEn.split(" ")[0]}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(proj.updatedAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => onOpenProject(proj)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                    >
                      <span>{locale === "bn" ? "প্ল্যান দেখুন" : "View Plan"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
