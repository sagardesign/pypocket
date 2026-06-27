"use client";

import React, { useState } from "react";
import { Users, BookOpen, AlertTriangle, TrendingUp, BarChart3, Clock, HelpCircle, ShieldAlert } from "lucide-react";

export default function AdminDashboard() {
  const [usersCount, setUsersCount] = useState(1280);
  const [lessonsCount, setLessonsCount] = useState(14);
  const [bugsCount, setBugsCount] = useState(2);

  const analytics = {
    dau: 240,
    wau: 1120,
    completionRate: "76.4%",
    dropOffRate: "14.2% at Loops Chapter",
    avgTime: "11.5 minutes",
    topLessons: ["Variables", "Data Types", "Conditionals"],
    failedQuizzes: [
      { quiz: "Loop syntax iteration", fails: 42 },
      { quiz: "Conditional precedence check", fails: 28 }
    ]
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black">Performance Analytics Dashboard</h2>
        <p className="text-xs text-zinc-500">Monitor overall user retention, drop-offs, and compiler stats.</p>
      </div>

      {/* Main stats boxes */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-zinc-500 block">Total Active Students</span>
            <span className="text-3xl font-black">{usersCount}</span>
          </div>
          <Users className="w-8 h-8 text-purple-500" />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-zinc-500 block">Active Syllabus Lessons</span>
            <span className="text-3xl font-black">{lessonsCount}</span>
          </div>
          <BookOpen className="w-8 h-8 text-blue-500" />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-zinc-500 block">Reported Compiler Bugs</span>
            <span className="text-3xl font-black">{bugsCount}</span>
          </div>
          <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
        </div>
      </section>

      {/* Analytics Charts & Details */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Engagement Panel */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-sm flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Active Student Engagements
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/40">
              <span className="text-zinc-500 block font-bold mb-1">Daily Active (DAU)</span>
              <span className="text-lg font-black">{analytics.dau}</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/40">
              <span className="text-zinc-500 block font-bold mb-1">Weekly Active (WAU)</span>
              <span className="text-lg font-black">{analytics.wau}</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/40">
              <span className="text-zinc-500 block font-bold mb-1">Course Completion</span>
              <span className="text-lg font-black text-green-500">{analytics.completionRate}</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/40">
              <span className="text-zinc-500 block font-bold mb-1">Avg. Lesson Duration</span>
              <span className="text-lg font-black">{analytics.avgTime}</span>
            </div>
          </div>
        </div>

        {/* Funnel Dropoff Rate */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-sm flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-yellow-500" />
            Funnel Drop-offs & Top Lessons
          </h3>
          <div className="space-y-2">
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs">
              <span className="text-zinc-500 font-bold block mb-1">Highest Funnel Drop-off Rate:</span>
              <span className="font-black text-red-400">{analytics.dropOffRate}</span>
            </div>
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs">
              <span className="text-zinc-500 font-bold block mb-1 font-semibold">Top Performing Lessons:</span>
              <div className="flex gap-2 mt-1">
                {analytics.topLessons.map((l, i) => (
                  <span key={i} className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-md font-bold text-[10px]">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quizzes Failed & Bug Reports */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Failed Quizzes List */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-3">
          <h3 className="font-extrabold text-sm flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            Frequently Failed Quizzes
          </h3>
          <div className="divide-y divide-zinc-800">
            {analytics.failedQuizzes.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 text-xs font-bold">
                <span className="text-zinc-300">{item.quiz}</span>
                <span className="text-red-500">{item.fails} times failed</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bug Reports */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-3">
          <h3 className="font-extrabold text-sm flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Open Bug Reports
          </h3>
          <div className="space-y-2">
            <div className="p-3 bg-red-950/10 border border-red-900/30 rounded-xl text-xs">
              <span className="font-extrabold text-red-400">#04 - Pyodide load failed on iOS 15 Safari</span>
              <p className="text-zinc-500 mt-1 font-semibold">Reporter: user_98f | Status: In progress</p>
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs">
              <span className="font-extrabold text-zinc-300">#03 - Dark Mode setting resetting on login</span>
              <p className="text-zinc-500 mt-1 font-semibold">Reporter: guest_841 | Status: Open</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
