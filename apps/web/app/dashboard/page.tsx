"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Flame, Play, Code, Target, Award, BarChart3, Clock, ChevronRight } from "lucide-react";

export default function Dashboard() {
  const { user, profile, stats, loading } = useApp();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        <span className="font-mono text-xs text-mono-500">Loading metrics...</span>
      </div>
    );
  }

  if (!user) return null;

  const currentXPInLevel = profile ? profile.xp % 200 : 0;
  const progressPercent = Math.min(Math.round((currentXPInLevel / 200) * 100), 100);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Hero Welcome banner */}
      <section className="bg-black text-white p-6 rounded-xl space-y-4">
        <div>
          <span className="text-[9px] uppercase tracking-widest text-mono-400 font-bold block font-mono">Student Hub</span>
          <h2 className="font-hero text-2xl font-black mt-1">Hello, {profile?.username || "Learner"}.</h2>
          <p className="text-mono-400 text-xs mt-1">Simple Learning. Lifelong Impact.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/roadmap"
            className="flex-1 py-3 px-4 bg-white text-black font-black text-xs rounded-lg flex items-center justify-center gap-1.5 hover:bg-mono-100 active:scale-98 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Resume Roadmap
          </Link>
          <Link
            href="/compiler"
            className="py-3 px-4 bg-mono-900 text-white border border-mono-800 font-black text-xs rounded-lg flex items-center justify-center gap-1.5 hover:bg-mono-800 active:scale-98 transition-all"
          >
            <Code className="w-3.5 h-3.5" />
            Open Editor
          </Link>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Bento Block 1: Streak */}
        <div className="bg-white border border-mono-200 p-5 rounded-xl flex flex-col justify-between shadow-card hover-lift">
          <span className="text-[9px] uppercase tracking-wider text-mono-500 font-black flex items-center gap-1">
            <Flame className="w-3 h-3 text-accent" /> Streak
          </span>
          <div className="my-3">
            <span className="font-mono text-4xl font-black text-black">{stats?.streak ?? 0}</span>
            <span className="text-xs text-mono-500 font-bold ml-1">days</span>
          </div>
          <p className="text-[10px] text-mono-500 font-semibold">Keep coding daily to retain progress.</p>
        </div>

        {/* Bento Block 2: Level Progress */}
        <div className="bg-white border border-mono-200 p-5 rounded-xl flex flex-col justify-between sm:col-span-2 shadow-card hover-lift">
          <span className="text-[9px] uppercase tracking-wider text-mono-500 font-black flex items-center gap-1">
            <Target className="w-3 h-3 text-secondary" /> Level {profile?.level ?? 1}
          </span>
          <div className="my-2 space-y-1">
            <div className="flex justify-between font-mono text-[10px] font-black">
              <span>Progress to next</span>
              <span>{currentXPInLevel}/200 XP</span>
            </div>
            <div className="w-full bg-mono-100 h-2 rounded overflow-hidden">
              <div 
                className="bg-black h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          <p className="text-[10px] text-mono-500 font-semibold">Earn {200 - currentXPInLevel} more XP to level up.</p>
        </div>

        {/* Bento Block 3: Daily XP Goal */}
        <div className="bg-white border border-mono-200 p-5 rounded-xl flex flex-col justify-between shadow-card hover-lift">
          <span className="text-[9px] uppercase tracking-wider text-mono-500 font-black">Daily Goal</span>
          <div className="my-2">
            <span className="font-mono text-3xl font-black text-black">
              {Math.min(100, Math.round(((profile?.xp ?? 0) / 20) * 100))}%
            </span>
          </div>
          <p className="text-[10px] text-mono-500 font-semibold">Goal: Earn 20 XP today</p>
        </div>

        {/* Bento Block 4: Quick stats */}
        <div className="bg-white border border-mono-200 p-5 rounded-xl sm:col-span-2 flex justify-around items-center shadow-card hover-lift">
          <div className="text-center">
            <Clock className="w-4 h-4 text-mono-600 mx-auto mb-1" />
            <span className="font-mono text-lg font-black block">{stats?.time_spent_minutes ?? 0}m</span>
            <span className="text-[9px] text-mono-500 font-bold uppercase tracking-wider">Practice Time</span>
          </div>
          <div className="w-px bg-mono-200 h-10"></div>
          <div className="text-center">
            <Award className="w-4 h-4 text-mono-600 mx-auto mb-1" />
            <span className="font-mono text-lg font-black block">{stats?.completed_lessons ?? 0}</span>
            <span className="text-[9px] text-mono-500 font-bold uppercase tracking-wider">Lessons Finished</span>
          </div>
        </div>
      </div>

      {/* Recommended Projects List */}
      <section className="bg-white border border-mono-200 p-6 rounded-xl shadow-card space-y-4">
        <h3 className="font-hero text-sm font-black text-black">Active Assignments</h3>
        <div className="divide-y divide-mono-100">
          {stats?.upcoming_projects && stats.upcoming_projects.length > 0 ? (
            stats.upcoming_projects.map((proj) => (
              <div key={proj.id} className="py-3 flex justify-between items-center gap-4">
                <div>
                  <h4 className="font-bold text-xs text-black">{proj.title}</h4>
                  <p className="text-[10px] text-mono-500 font-medium mt-0.5">{proj.description}</p>
                </div>
                <Link
                  href="/compiler"
                  className="p-1 text-mono-600 hover:text-black hover:bg-mono-100 rounded"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))
          ) : (
            <p className="text-xs text-mono-500 py-2">No recommended active assignments.</p>
          )}
        </div>
      </section>
    </div>
  );
}
