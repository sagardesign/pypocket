"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Terminal, Crown, User } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useApp();

  if (!user) return null;

  const navItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Roadmap", href: "/roadmap", icon: Compass },
    { label: "Compiler", href: "/compiler", icon: Terminal },
    { label: "Rankings", href: "/leaderboard", icon: Crown },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <nav className="sticky bottom-0 z-40 w-full bg-white border-t border-mono-200 flex justify-around items-center py-2 px-1 pb-safe-bottom md:hidden transition-colors duration-200">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg transition-all duration-200 ${
              isActive
                ? "text-black scale-102 font-bold"
                : "text-mono-600 active:scale-98 hover:text-black"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"}`} />
            <span className="text-[9px] tracking-wider uppercase font-bold font-sans">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
