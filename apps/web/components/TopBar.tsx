"use client";

import React from "react";
import { Flame, Trophy, Coins, ShieldAlert, Sparkles, LogOut, Sun, Moon, Terminal } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function TopBar() {
  const { user, profile, stats, isOffline, logout, theme, toggleTheme } = useApp();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#F8F9FA]/80 border-b border-mono-200/60 px-4 py-3 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center gap-2">
        <div className="text-foreground p-1 rounded border border-mono-300 bg-white flex items-center justify-center">
          <Terminal className="w-4 h-4" />
        </div>
        <span className="font-hero font-black text-base tracking-tight text-foreground">
          PyPocket
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Streak HUD */}
        <div className="flex items-center gap-1.5 text-foreground px-2 py-0.5 rounded text-xs font-mono border border-mono-300 bg-white" title="Streak Days">
          <Flame className="w-3.5 h-3.5 text-accent" />
          <span>{stats?.streak ?? 0}d</span>
        </div>

        {/* Coins HUD */}
        <div className="flex items-center gap-1.5 text-foreground px-2 py-0.5 rounded text-xs font-mono border border-mono-300 bg-white" title="Coins">
          <Coins className="w-3.5 h-3.5 text-yellow-600" />
          <span>{profile?.coins ?? 0}c</span>
        </div>

        {/* Level Badge */}
        <div className="flex items-center gap-1 text-foreground px-2 py-0.5 rounded text-xs font-mono border border-mono-300 bg-white" title="Level">
          <Trophy className="w-3.5 h-3.5 text-secondary" />
          <span>Lvl {profile?.level ?? 1}</span>
        </div>

        {/* Offline Badge */}
        {isOffline && (
          <div className="flex items-center justify-center text-accent animate-pulse" title="Offline Mode Active">
            <ShieldAlert className="w-4 h-4" />
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="p-1 rounded hover:bg-mono-200 text-mono-600 transition-colors flex items-center justify-center"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
