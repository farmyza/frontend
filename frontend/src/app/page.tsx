"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { UserProject } from "@/lib/db";
import { ProjectsDashboard } from "@/components/projects/ProjectsDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { activeUser, isLoading: authLoading, locale, refreshUserProjects, signIn } = useUser();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/projects?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      } else {
        setError(locale === "bn" ? "প্রজেক্ট লোড ব্যর্থ।" : "Failed to load projects.");
      }
    } catch {
      setError(locale === "bn" ? "নেটওয়ার্ক ত্রুটি।" : "Network error.");
    } finally {
      setIsLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    if (activeUser?.id) loadProjects(activeUser.id);
    else if (!authLoading) setIsLoading(false);
  }, [activeUser?.id, authLoading, loadProjects]);

  const handleDeleteProject = async (projectId: string) => {
    try {
      const res = await fetch(`/api/v1/projects?id=${projectId}&userId=${activeUser!.id}`, { method: "DELETE" });
      if (res.ok) {
        await loadProjects(activeUser!.id);
        await refreshUserProjects();
      }
    } catch {
      // ignore
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500">
          {locale === "bn" ? "লোড হচ্ছে..." : "Loading..."}
        </span>
      </div>
    );
  }

  if (!activeUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold text-slate-900">
          {locale === "bn" ? "সাইন ইন প্রয়োজন" : "Sign in required"}
        </h2>
        <button
          onClick={() => signIn("/")}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700"
        >
          {locale === "bn" ? "Google দিয়ে সাইন ইন" : "Sign in with Google"}
        </button>
      </div>
    );
  }

  if (error) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-red-600 font-semibold">{error}</div>;
  }

  return (
    <ProjectsDashboard
      projects={projects}
      activeUserName={activeUser.name}
      locale={locale}
      onOpenProject={(p) => router.push(`/projects/${p.id}`)}
      onDeleteProject={handleDeleteProject}
      onStartNewProject={() => router.push("/new")}
    />
  );
}