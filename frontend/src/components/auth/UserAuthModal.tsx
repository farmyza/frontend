"use client";

import React, { useState } from "react";
import { useUser } from "@/lib/user-context";
import { UserAccount } from "@/lib/db";
import { User, Check, X, Shield, Plus, ArrowRight } from "lucide-react";

export const UserAuthModal: React.FC = () => {
  const {
    isUserModalOpen,
    setIsUserModalOpen,
    allUsers,
    activeUser,
    setActiveUser,
    locale,
  } = useUser();

  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  if (!isUserModalOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customName.trim()) return;

    const newUser: UserAccount = {
      id: `user_${customEmail.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      name: customName.trim(),
      email: customEmail.trim(),
      role: "Farmer / Field Officer",
      avatar: "🌱",
      district: "Custom Region",
      createdAt: new Date().toISOString(),
    };

    setActiveUser(newUser);
    setIsUserModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <User className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight">
                {locale === "bn" ? "ব্যবহারকারী অ্যাকাউন্ট নির্বাচন" : "Switch User Account"}
              </h3>
              <p className="text-xs text-emerald-200/90">
                {locale === "bn"
                  ? "প্রতিটি অ্যাকাউন্টের প্রজেক্ট ডেটাবেজে সম্পূর্ণ সুরক্ষিত ও আলাদা থাকে।"
                  : "All field projects are saved and isolated per user profile."}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsUserModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account Profiles List */}
        <div className="p-6 flex flex-col gap-3 max-h-96 overflow-y-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {locale === "bn" ? "উপলব্ধ ডেমো প্রোফাইলসমূহ" : "Available Profiles"}
          </span>

          {allUsers.map((u) => {
            const isSelected = u.id === activeUser.id;
            return (
              <button
                key={u.id}
                onClick={() => {
                  setActiveUser(u);
                  setIsUserModalOpen(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer group ${
                  isSelected
                    ? "bg-emerald-50/80 border-emerald-500 shadow-sm"
                    : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shadow-inner">
                    {u.avatar || "👤"}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {u.name}
                    </h4>
                    <p className="text-xs text-slate-500">{u.role}</p>
                    <span className="text-[11px] font-mono text-slate-400">{u.email}</span>
                  </div>
                </div>
                {isSelected ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                )}
              </button>
            );
          })}

          {/* Custom Sign-in Accordion Toggle */}
          <div className="pt-2 border-t border-slate-100">
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 hover:border-emerald-500 text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{locale === "bn" ? "+ নতুন কাস্টম ইউজার দিয়ে প্রবেশ" : "+ Sign in as Custom User"}</span>
              </button>
            ) : (
              <form onSubmit={handleCustomLogin} className="flex flex-col gap-2.5 pt-2">
                <input
                  type="text"
                  placeholder={locale === "bn" ? "আপনার নাম" : "Your Full Name"}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <input
                  type="email"
                  placeholder={locale === "bn" ? "ইমেইল এড্রেস" : "Email Address"}
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    {locale === "bn" ? "প্রবেশ করুন" : "Continue"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    {locale === "bn" ? "বাতিল" : "Cancel"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer Security Note */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
          <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            {locale === "bn"
              ? "লোকাল SQLite ডেটাবেজে আপনার প্রতিটি খামারের ডেটা স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে।"
              : "All farm diagnostic results are isolated & stored in your local SQLite DB."}
          </span>
        </div>
      </div>
    </div>
  );
};
