"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserAccount } from "@/lib/db";

interface UserContextType {
  activeUser: UserAccount | null;
  isLoading: boolean;
  isDemoMode: boolean;
  locale: "en" | "bn";
  setLocale: (locale: "en" | "bn") => void;
  projectCount: number;
  setProjectCount: (count: number) => void;
  refreshUserProjects: () => Promise<void>;
  signIn: (returnTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  activeUser: null,
  isLoading: true,
  isDemoMode: false,
  locale: "en",
  setLocale: () => {},
  projectCount: 0,
  setProjectCount: () => {},
  refreshUserProjects: async () => {},
  signIn: async () => {},
  signOut: async () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeUser, setActiveUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [locale, setLocaleState] = useState<"en" | "bn">("en");
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    const storedLocale = localStorage.getItem("farmyza_locale");
    if (storedLocale === "en" || storedLocale === "bn") setLocaleState(storedLocale);
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/auth/me");
      if (res.ok) {
        const data = await res.json();
        setActiveUser(data.user || null);
        setIsDemoMode(Boolean(data.demo));
      } else {
        setActiveUser(null);
        setIsDemoMode(false);
      }
    } catch {
      setActiveUser(null);
      setIsDemoMode(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const setLocale = (newLocale: "en" | "bn") => {
    setLocaleState(newLocale);
    localStorage.setItem("farmyza_locale", newLocale);
  };

  const refreshUserProjects = useCallback(async () => {
    if (!activeUser?.id) return;
    try {
      const res = await fetch(`/api/v1/projects?userId=${activeUser.id}`);
      const data = await res.json();
      if (data.projects) setProjectCount(data.projects.length);
    } catch {
      // ignore
    }
  }, [activeUser?.id]);

  useEffect(() => {
    if (activeUser?.id) refreshUserProjects();
  }, [activeUser?.id, refreshUserProjects]);

  const signIn = async (returnTo?: string) => {
    const rt = returnTo || window.location.pathname;
    const res = await fetch(`/api/v1/auth/oauth/google/start?returnTo=${encodeURIComponent(rt)}`);
    const data = await res.json();
    if (data.authUrl) window.location.href = data.authUrl;
  };

  const signOut = async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    setActiveUser(null);
    setIsDemoMode(false);
    setProjectCount(0);
  };

  return (
    <UserContext.Provider
      value={{
        activeUser,
        isLoading,
        isDemoMode,
        locale,
        setLocale,
        projectCount,
        setProjectCount,
        refreshUserProjects,
        signIn,
        signOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);