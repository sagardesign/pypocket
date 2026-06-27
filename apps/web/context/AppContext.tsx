"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";

interface User {
  id: string;
  email: string;
  role: string;
  is_guest: boolean;
}

interface Profile {
  level: number;
  xp: number;
  coins: number;
  username: string;
}

interface DashboardStats {
  streak: number;
  xp: number;
  level: number;
  coins: number;
  completed_lessons: number;
  time_spent_minutes: number;
  recent_activity: any[];
  upcoming_projects: any[];
  achievements: any[];
}

interface AppContextProps {
  user: User | null;
  profile: Profile | null;
  stats: DashboardStats | null;
  token: string | null;
  theme: "light" | "dark";
  isOffline: boolean;
  loading: boolean;
  toggleTheme: () => void;
  login: (tokenVal: string) => Promise<void>;
  guestLogin: () => Promise<void>;
  logout: () => void;
  refreshStats: () => Promise<void>;
  addLocalXP: (amount: number) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize Theme and Auth
  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem("pypocket_theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      document.documentElement.classList.add("dark");
    }

    // Network connectivity checking
    setIsOffline(!navigator.onLine);
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    // Load Token and User data
    const savedToken = localStorage.getItem("pypocket_token");
    if (savedToken) {
      setToken(savedToken);
      loadUserData(savedToken);
    } else {
      setLoading(false);
    }

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("pypocket_theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  const loadUserData = async (authToken: string) => {
    try {
      setLoading(true);
      const userData = await fetchAPI("/auth/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(userData);

      const profileData = await fetchAPI("/profile/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setProfile(profileData);

      const statsData = await fetchAPI("/profile/stats", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setStats(statsData);
    } catch (err) {
      console.warn("Could not load user from backend. Initializing offline mock fallback...");
      initializeMockUser();
    } finally {
      setLoading(false);
    }
  };

  const initializeMockUser = () => {
    const mockUser = {
      id: "mock-user-123",
      email: "student@pypocket.local",
      role: "student",
      is_guest: true,
    };
    const mockProfile = {
      level: 1,
      xp: 40,
      coins: 10,
      username: "Guest Student",
    };
    const mockStats: DashboardStats = {
      streak: 3,
      xp: 40,
      level: 1,
      coins: 10,
      completed_lessons: 2,
      time_spent_minutes: 24,
      recent_activity: [{ type: "lesson", message: "Completed Variables lesson", timestamp: new Date().toISOString() }],
      upcoming_projects: [
        { id: "calculator", title: "Calculator", description: "Build a CLI math system.", requirements: [] },
        { id: "todo", title: "To-Do List", description: "Create a list manager.", requirements: [] },
      ],
      achievements: [{ title: "First Step", description: "Earned first 10 XP!", icon_url: "🏆" }],
    };
    setUser(mockUser);
    setProfile(mockProfile);
    setStats(mockStats);
  };

  const login = async (authToken: string) => {
    localStorage.setItem("pypocket_token", authToken);
    setToken(authToken);
    await loadUserData(authToken);
  };

  const guestLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/auth/guest", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        await login(data.access_token);
      } else {
        throw new Error("Guest endpoint failed");
      }
    } catch (err) {
      console.warn("FastAPI offline. Logging in as local-only mock guest...");
      initializeMockUser();
      setToken("mock-token-abc");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("pypocket_token");
    setToken(null);
    setUser(null);
    setProfile(null);
    setStats(null);
  };

  const refreshStats = async () => {
    if (!token || token === "mock-token-abc") return;
    try {
      const profileData = await fetchAPI("/profile/me");
      setProfile(profileData);
      const statsData = await fetchAPI("/profile/stats");
      setStats(statsData);
    } catch (err) {
      console.error("Failed to refresh stats from server", err);
    }
  };

  const addLocalXP = (amount: number) => {
    // Dynamic local state update for XP & Level up feedback
    if (profile) {
      const nextXP = profile.xp + amount;
      const nextLevel = Math.floor(nextXP / 200) + 1;
      const nextCoins = profile.coins + (nextLevel > profile.level ? 10 : 0);
      
      const updatedProfile = {
        ...profile,
        xp: nextXP,
        level: nextLevel,
        coins: nextCoins,
      };
      
      setProfile(updatedProfile);
      
      if (stats) {
        setStats({
          ...stats,
          xp: nextXP,
          level: nextLevel,
          coins: nextCoins,
          completed_lessons: stats.completed_lessons + 1
        });
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        profile,
        stats,
        token,
        theme,
        isOffline,
        loading,
        toggleTheme,
        login,
        guestLogin,
        logout,
        refreshStats,
        addLocalXP
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
