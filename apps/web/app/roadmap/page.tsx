"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Lock, Star, Trophy, Play } from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { useApp } from "@/context/AppContext";

interface LessonData {
  id: string;
  title: string;
  slug: string;
  chapter_id: string;
  type: string;
  order: number;
  xp_reward: number;
}

interface ChapterData {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: LessonData[];
}

export default function Roadmap() {
  const { user } = useApp();
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<LessonData | null>(null);

  useEffect(() => {
    async function loadRoadmap() {
      try {
        setLoading(true);
        const courses = await fetchAPI("/courses");
        const basicsCourse = courses.find((c: any) => c.slug === "python-basics");
        if (basicsCourse) {
          setChapters(basicsCourse.chapters || []);
        } else {
          throw new Error("Basics not found");
        }
        setCompletedLessonIds(new Set(["variables"]));
      } catch (err) {
        loadMockRoadmap();
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadRoadmap();
    }
  }, [user]);

  const loadMockRoadmap = () => {
    const mockChapters: ChapterData[] = [
      {
        id: "c1",
        title: "Variables & Data Types",
        description: "Learn how Python stores and reads values.",
        order: 1,
        lessons: [
          { id: "l1", title: "Variables", slug: "variables", chapter_id: "c1", type: "interactive", order: 1, xp_reward: 20 },
          { id: "l2", title: "Data Types", slug: "data-types", chapter_id: "c1", type: "interactive", order: 2, xp_reward: 20 },
        ]
      },
      {
        id: "c2",
        title: "Control Flow",
        description: "Decide which code blocks run and repeat.",
        order: 2,
        lessons: [
          { id: "l3", title: "Conditions", slug: "conditions", chapter_id: "c2", type: "interactive", order: 1, xp_reward: 20 },
          { id: "l4", title: "Loops", slug: "loops", chapter_id: "c2", type: "interactive", order: 2, xp_reward: 20 },
        ]
      }
    ];
    setChapters(mockChapters);
    setCompletedLessonIds(new Set(["variables"]));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        <span className="font-mono text-xs text-mono-500">Generating checklist path...</span>
      </div>
    );
  }

  const flatLessons: LessonData[] = chapters.reduce((acc: LessonData[], c) => [...acc, ...c.lessons], []);

  const isLessonUnlocked = (lesson: LessonData, index: number): boolean => {
    if (index === 0) return true;
    const prevLesson = flatLessons[index - 1];
    return completedLessonIds.has(prevLesson.slug) || prevLesson.id === "l1";
  };

  return (
    <div className="space-y-8 max-w-md mx-auto pb-12">
      <div className="text-center space-y-1">
        <h2 className="font-hero text-2xl font-black text-black">Python Roadmap</h2>
        <p className="text-xs text-mono-500 font-semibold">Unlock topics chronologically</p>
      </div>

      <div className="space-y-10">
        {chapters.map((chapter) => (
          <section key={chapter.id} className="space-y-4">
            {/* Chapter header box */}
            <div className="bg-white border border-mono-200 p-4 rounded-xl shadow-card">
              <span className="text-[9px] uppercase tracking-wider font-mono text-mono-500 block">Chapter {chapter.order}</span>
              <h4 className="font-hero text-sm font-black text-black mt-0.5">{chapter.title}</h4>
              <p className="text-[10px] text-mono-500 font-semibold mt-1">{chapter.description}</p>
            </div>

            {/* Vertical sequential path list */}
            <div className="space-y-3">
              {chapter.lessons.map((lesson) => {
                const globalIndex = flatLessons.findIndex((fl) => fl.slug === lesson.slug);
                const unlocked = isLessonUnlocked(lesson, globalIndex);
                const completed = completedLessonIds.has(lesson.slug);
                const isSelected = selectedLesson?.slug === lesson.slug;

                return (
                  <div key={lesson.slug} className="flex flex-col gap-2">
                    {/* Compact block design node instead of cartoon circles */}
                    <button
                      onClick={() => unlocked && setSelectedLesson(isSelected ? null : lesson)}
                      disabled={!unlocked}
                      className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all ${
                        completed
                          ? "bg-white border-mono-300 hover:bg-mono-50"
                          : unlocked
                          ? "bg-white border-black shadow-card hover:bg-mono-50"
                          : "bg-mono-50 border-mono-200 text-mono-400 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded border flex items-center justify-center ${
                          completed 
                            ? "bg-green-50 border-green-200 text-green-600" 
                            : unlocked 
                            ? "bg-mono-50 border-mono-300 text-black font-mono font-bold" 
                            : "bg-mono-100 border-mono-200 text-mono-400"
                        }`}>
                          {completed ? (
                            <Check className="w-4 h-4 stroke-[2.5px]" />
                          ) : unlocked ? (
                            <span className="text-xs">{globalIndex + 1}</span>
                          ) : (
                            <Lock className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-foreground">{lesson.title}</h5>
                          <span className="font-mono text-[9px] text-mono-500 font-bold block mt-0.5">+{lesson.xp_reward} XP</span>
                        </div>
                      </div>
                      
                      {unlocked && (
                        <span className="text-[10px] font-black text-secondary hover:underline">
                          {completed ? "Review" : "Start"}
                        </span>
                      )}
                    </button>

                    {/* Popover content below the block */}
                    {isSelected && (
                      <div className="p-4 bg-mono-50 border border-mono-200 rounded-xl flex flex-col gap-3 text-xs animate-fade-in">
                        <p className="text-mono-600 font-medium leading-relaxed">
                          Dive into coding operations and test exercises on {lesson.title}.
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-accent font-mono font-bold flex items-center gap-1">
                            <Trophy className="w-3.5 h-3.5" /> +{lesson.xp_reward} XP Reward
                          </span>
                          <Link
                            href={`/lesson/${lesson.slug}`}
                            className="px-4 py-2 bg-black text-white font-black rounded-lg flex items-center gap-1"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Launch Lesson
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
