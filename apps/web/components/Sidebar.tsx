"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Terminal, Crown, User, Flame, Coins, Trophy } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, profile, stats } = useApp();

  if (!user) return null;

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Roadmap Path", href: "/roadmap", icon: Compass },
    { label: "Python Editor", href: "/compiler", icon: Terminal },
    { label: "Leaderboard", href: "/leaderboard", icon: Crown },
    { label: "My Profile", href: "/profile", icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-mono-200 h-screen sticky top-0 px-4 py-6 transition-colors duration-200">
      <div className="flex items-center gap-2 mb-8">
        <div className="text-foreground p-1.5 rounded border border-mono-300 bg-mono-50">
          <Terminal className="w-5 h-5" />
        </div>
        <span className="font-hero font-black text-lg tracking-tight text-foreground">
          PyPocket
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all duration-200 ${
                isActive
                  ? "bg-black text-white"
                  : "text-mono-600 hover:bg-mono-100 hover:text-black active:scale-98"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile HUD box in Sidebar */}
      <div className="mt-auto border-t border-mono-200 pt-6 space-y-3">
        <div className="flex items-center justify-between bg-mono-50 p-3 rounded-lg border border-mono-200/80 font-mono text-[10px] font-bold">
          <div className="flex items-center gap-1 text-accent">
            <Flame className="w-4 h-4 fill-current" />
            <span>{stats?.streak ?? 0}d</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-600">
            <Coins className="w-4 h-4 fill-current" />
            <span>{profile?.coins ?? 0}c</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded bg-mono-200 text-foreground flex items-center justify-center font-bold text-sm border border-mono-300">
            {profile?.username?.[0]?.toUpperCase() || "S"}
          </div>
          <div>
            <h4 className="font-bold text-xs text-foreground truncate max-w-[120px]">{profile?.username || "Student"}</h4>
            <p className="text-[10px] text-mono-600 font-mono flex items-center gap-1">
              <Trophy className="w-3 h-3 text-secondary" /> Lvl {profile?.level || 1}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
