"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { UserProject } from "@/lib/db";
import { SolutionView } from "@/components/results/SolutionView";
import { AgronomistChat } from "@/components/assistant/AgronomistChat";
import { MessageSquare, Sparkles, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const { locale } = useUser();

  const [project, setProject] = useState<UserProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    fetch(`/api/v1/projects?projectId=${projectId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Project not found");
        return res.json();
      })
      .then((data) => {
        if (data.project) {
          setProject(data.project);
        } else {
          setError("Project not found");
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load project");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500">
          {locale === "bn" ? "প্রজেক্টের তথ্য লোড হচ্ছে..." : "Loading project diagnostics..."}
        </span>
      </div>
    );
  }

  if (error || !project || !project.diagnosticResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-4">
        <div className="p-4 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
          <X className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">
          {locale === "bn" ? "প্রজেক্ট পাওয়া যায়নি" : "Project Not Found"}
        </h2>
        <p className="text-xs text-slate-500 max-w-md">
          {locale === "bn"
            ? "এই প্রজেক্টটি মুছে ফেলা হতে পারে বা আপনার অ্যাকাউন্টের সাথে যুক্ত নয়।"
            : "This project may have been deleted or is not associated with this profile."}
        </p>
        <Link
          href="/projects"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{locale === "bn" ? "প্রজেক্ট তালিকায় ফিরে যান" : "Back to Projects Dashboard"}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative pb-16">
      <SolutionView
        projectName={project.name}
        result={project.diagnosticResult}
        locale={locale}
        onBackToProjects={() => router.push("/projects")}
        onOpenAiChat={() => setIsAiChatOpen(true)}
      />

      {/* Floating AI Agronomist Action Trigger */}
      {!isAiChatOpen && (
        <button
          onClick={() => setIsAiChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-xs sm:text-sm shadow-2xl shadow-emerald-800/40 border border-emerald-400/30 transition-all active:scale-95 cursor-pointer hover:shadow-emerald-700/50"
        >
          <MessageSquare className="w-5 h-5" />
          <span>{locale === "bn" ? "এআই কৃষি উপদেষ্টার সাথে কথা বলুন" : "Ask AI Agronomist"}</span>
        </button>
      )}

      {/* Slide-over / Modal AI Agronomist Conversation Drawer */}
      {isAiChatOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col">
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span className="font-extrabold text-sm">{project.name} — AI Advisory</span>
              </div>
              <button
                onClick={() => setIsAiChatOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AgronomistChat
                diagnosticData={project.diagnosticResult}
                locale={locale}
                onClose={() => setIsAiChatOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
