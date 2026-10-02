"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserAccount } from "@/lib/db";

interface UserContextType {
  activeUser: UserAccount;
  setActiveUser: (user: UserAccount) => void;
  allUsers: UserAccount[];
  locale: "en" | "bn";
  setLocale: (locale: "en" | "bn") => void;
  isUserModalOpen: boolean;
  setIsUserModalOpen: (open: boolean) => void;
  projectCount: number;
  setProjectCount: (count: number) => void;
  refreshUserProjects: () => Promise<void>;
}

const defaultUser: UserAccount = {
  id: "user_rafiq",
  name: "Md. Rafiqul Islam",
  email: "rafiq@farmyza.bd",
  role: "Coastal Rice & Sunflower Farmer",
  avatar: "🌾",
  district: "Satkhira",
  createdAt: new Date().toISOString(),
};

const UserContext = createContext<UserContextType>({
  activeUser: defaultUser,
  setActiveUser: () => {},
  allUsers: [defaultUser],
  locale: "en",
  setLocale: () => {},
  isUserModalOpen: false,
  setIsUserModalOpen: () => {},
  projectCount: 0,
  setProjectCount: () => {},
  refreshUserProjects: async () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeUser, setActiveUserState] = useState<UserAccount>(defaultUser);
  const [allUsers, setAllUsers] = useState<UserAccount[]>([defaultUser]);
  const [locale, setLocaleState] = useState<"en" | "bn">("en");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    // Load stored locale and user preferences
    const storedLocale = localStorage.getItem("farmyza_locale");
    if (storedLocale === "en" || storedLocale === "bn") {
      setLocaleState(storedLocale);
    }

    fetch("/api/v1/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.users && data.users.length > 0) {
          setAllUsers(data.users);
          const storedUserId = localStorage.getItem("farmyza_active_user");
          const found = data.users.find((u: UserAccount) => u.id === storedUserId);
          if (found) {
            setActiveUserState(found);
          } else {
            setActiveUserState(data.users[0]);
          }
        }
      })
      .catch((err) => console.error("Failed to load users:", err));
  }, []);

  const setActiveUser = (user: UserAccount) => {
    setActiveUserState(user);
    localStorage.setItem("farmyza_active_user", user.id);
  };

  const setLocale = (newLocale: "en" | "bn") => {
    setLocaleState(newLocale);
    localStorage.setItem("farmyza_locale", newLocale);
  };

  const refreshUserProjects = async () => {
    try {
      const res = await fetch(`/api/v1/projects?userId=${activeUser.id}`);
      const data = await res.json();
      if (data.projects) {
        setProjectCount(data.projects.length);
      }
    } catch {
      // Ignore network errors in background counter
    }
  };

  useEffect(() => {
    if (activeUser.id) {
      refreshUserProjects();
    }
  }, [activeUser.id]);

  return (
    <UserContext.Provider
      value={{
        activeUser,
        setActiveUser,
        allUsers,
        locale,
        setLocale,
        isUserModalOpen,
        setIsUserModalOpen,
        projectCount,
        setProjectCount,
        refreshUserProjects,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
