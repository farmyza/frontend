"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { UserProject } from "@/lib/db";
import { ProjectsDashboard } from "@/components/projects/ProjectsDashboard";
import { Sparkles } from "lucide-react";

export default function ProjectsPage() {
  const router = useRouter();
  const { activeUser, locale, refreshUserProjects } = useUser();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadProjects = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/projects?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch {
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeUser.id) {
      loadProjects(activeUser.id);
    }
  }, [activeUser.id, loadProjects]);

  const handleDeleteProject = async (projectId: string) => {
    try {
      const res = await fetch(`/api/v1/projects?id=${projectId}&userId=${activeUser.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadProjects(activeUser.id);
        await refreshUserProjects();
        showToast(locale === "bn" ? "প্রজেক্ট মুছে ফেলা হয়েছে।" : "Project removed from database.");
      }
    } catch {
      showToast("Failed to delete project.");
    }
  };

  const handleOpenProject = (project: UserProject) => {
    router.push(`/projects/${project.id}`);
  };

  const handleStartNewProject = () => {
    router.push("/projects/new");
  };

  return (
    <div className="relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-500/40 text-xs font-bold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-500">
            {locale === "bn" ? "প্রজেক্ট লোড হচ্ছে..." : "Loading projects from SQLite DB..."}
          </span>
        </div>
      ) : (
        <ProjectsDashboard
          projects={projects}
          activeUserName={activeUser.name}
          locale={locale}
          onOpenProject={handleOpenProject}
          onDeleteProject={handleDeleteProject}
          onStartNewProject={handleStartNewProject}
        />
      )}
    </div>
  );
}
