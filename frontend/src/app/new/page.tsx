"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { FarmFieldInput, DiagnosticResponse } from "@/lib/schemas";
import { PRESET_FIELDS, PresetFieldData, presetToFieldInput } from "@/lib/presets";
import { NewProjectWizard } from "@/components/wizard/NewProjectWizard";
import { Sparkles } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const { activeUser, isDemoMode, isLoading: authLoading, locale, refreshUserProjects, signIn } = useUser();
  const [currentFieldInput, setCurrentFieldInput] = useState<FarmFieldInput>(
    presetToFieldInput(PRESET_FIELDS[0])
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSelectPreset = (preset: PresetFieldData) => {
    setCurrentFieldInput(presetToFieldInput(preset));
  };

  const handleUpdateFieldInput = (updated: Partial<FarmFieldInput>) => {
    setCurrentFieldInput((prev) => ({ ...prev, ...updated }));
  };

  const handleWizardSubmit = async (projectName: string) => {
    if (!activeUser && !isDemoMode) {
      await signIn("/new");
      return;
    }
    setIsAnalyzing(true);
    try {
      const diagRes = await fetch("/api/v1/diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentFieldInput),
      });

      if (!diagRes.ok) throw new Error("Diagnosis failed");
      const diagJson = await diagRes.json();
      const result: DiagnosticResponse = diagJson;

      // Save Project to SQLite
      const saveRes = await fetch("/api/v1/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: activeUser!.id,
          name: projectName,
          district: currentFieldInput.district,
          centerLat: currentFieldInput.centerCoordinates.lat,
          centerLng: currentFieldInput.centerCoordinates.lng,
          areaHa: currentFieldInput.areaHectares,
          fieldInput: currentFieldInput,
          diagnosticResult: result,
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save project");
      const saveJson = await saveRes.json();
      const savedProject = saveJson.project;

      await refreshUserProjects();
      router.push(`/projects/${savedProject.id}`);
    } catch {
      showToast(
        locale === "bn"
          ? "ত্রুটি: প্রজেক্ট সংরক্ষণ ও বিশ্লেষণ সম্পন্ন করা যায়নি।"
          : "Error: Could not diagnose and save project."
      );
      setIsAnalyzing(false);
    }
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

      <NewProjectWizard
        fieldInput={currentFieldInput}
        onChangeField={handleUpdateFieldInput}
        onSelectPreset={handleSelectPreset}
        onSubmit={handleWizardSubmit}
        onCancel={() => router.push("/")}
        isAnalyzing={isAnalyzing}
        locale={locale}
      />
    </div>
  );
}
