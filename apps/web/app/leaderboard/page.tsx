"use client";

import React, { useState, useEffect } from "react";
import { Crown, Trophy, Award, Flame, AlertCircle } from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { useApp } from "@/context/AppContext";

interface LeaderboardEntry {
  username: string;
  avatar_url?: string;
  xp: number;
  level: number;
  rank: number;
}

export default function Leaderboard() {
  const { user } = useApp();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);
        const data = await fetchAPI("/leaderboard");
        setEntries(data);
      } catch (err) {
        loadMockLeaderboard();
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadLeaderboard();
    }
  }, [user]);

  const loadMockLeaderboard = () => {
    const mockEntries: LeaderboardEntry[] = [
      { rank: 1, username: "AlexPyDev", level: 12, xp: 2430 },
      { rank: 2, username: "SagarK", level: 8, xp: 1620 },
      { rank: 3, username: "PythonPrincess", level: 5, xp: 980 },
      { rank: 4, username: "CodingKid", level: 4, xp: 810 },
      { rank: 5, username: "Guest Student", level: 1, xp: 40 },
    ];
    setEntries(mockEntries);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        <span className="font-mono text-xs text-mono-500">Retrieving standings...</span>
      </div>
    );
  }

  const podium = entries.slice(0, 3);
  const remaining = entries.slice(3);

  return (
    <div className="space-y-6 max-w-lg mx-auto w-full">
      <div className="text-center space-y-1">
        <h2 className="font-hero text-2xl font-black text-black">Weekly Standings</h2>
        <p className="text-xs text-mono-500 font-semibold">Earn XP in lessons to advance ranks</p>
      </div>

      {/* Podium grid blocks */}
      {podium.length > 0 && (
        <section className="flex items-end justify-center gap-3 pt-6 pb-2 px-1 text-xs">
          {/* Rank 2 */}
          {podium[1] && (
            <div className="flex-1 bg-white border border-mono-200 p-4 rounded-xl flex flex-col items-center text-center gap-1 shadow-card h-32 justify-end relative hover-lift">
              <span className="absolute top-[-14px] font-mono font-black text-mono-400 text-lg">02</span>
              <h4 className="font-black text-black truncate max-w-[80px]">{podium[1].username}</h4>
              <span className="font-mono text-[9px] text-mono-500">Lvl {podium[1].level}</span>
              <span className="font-mono text-[10px] font-black text-secondary">{podium[1].xp} XP</span>
            </div>
          )}

          {/* Rank 1 */}
          {podium[0] && (
            <div className="flex-1 bg-black text-white p-4 rounded-xl flex flex-col items-center text-center gap-1 shadow-card h-36 justify-end relative hover-lift">
              <span className="absolute top-[-14px] font-mono font-black text-white text-lg">01</span>
              <h4 className="font-black text-white truncate max-w-[90px]">{podium[0].username}</h4>
              <span className="font-mono text-[9px] text-mono-400">Lvl {podium[0].level}</span>
              <span className="font-mono text-[10px] font-black text-secondary-foreground">{podium[0].xp} XP</span>
            </div>
          )}

          {/* Rank 3 */}
          {podium[2] && (
            <div className="flex-1 bg-white border border-mono-200 p-4 rounded-xl flex flex-col items-center text-center gap-1 shadow-card h-28 justify-end relative hover-lift">
              <span className="absolute top-[-14px] font-mono font-black text-mono-400 text-lg">03</span>
              <h4 className="font-black text-black truncate max-w-[80px]">{podium[2].username}</h4>
              <span className="font-mono text-[9px] text-mono-500">Lvl {podium[2].level}</span>
              <span className="font-mono text-[10px] font-black text-secondary">{podium[2].xp} XP</span>
            </div>
          )}
        </section>
      )}

      {/* Leaderboard user list */}
      <section className="bg-white border border-mono-200 rounded-xl p-4 shadow-card divide-y divide-mono-100">
        {remaining.length > 0 ? (
          remaining.map((entry) => (
            <div key={entry.rank} className="flex items-center justify-between py-3 px-2 text-xs font-bold">
              <div className="flex items-center gap-3">
                <span className="font-mono text-mono-500 w-5">#{entry.rank}</span>
                <div className="w-8 h-8 rounded bg-mono-100 text-foreground flex items-center justify-center font-bold border border-mono-200">
                  {entry.username[0].toUpperCase()}
                </div>
                <div>
                  <h5 className="font-bold text-black">{entry.username}</h5>
                  <p className="text-[9px] text-mono-500 font-semibold font-mono">Level {entry.level}</p>
                </div>
              </div>
              <span className="font-mono text-mono-900 font-black">{entry.xp} XP</span>
            </div>
          ))
        ) : (
          podium.length === 0 && (
            <div className="text-center py-6 text-xs text-mono-500">No standings logged yet.</div>
          )
        )}
      </section>
    </div>
  );
}
