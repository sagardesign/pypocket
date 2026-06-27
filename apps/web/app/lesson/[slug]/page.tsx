"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { BookOpen, Code, CheckSquare, HelpCircle, ChevronRight, ArrowLeft, Trophy, Lightbulb, Play } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { fetchAPI } from "@/lib/api";
import { usePyodide } from "@/hooks/usePyodide";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}

interface LessonData {
  id: string;
  title: string;
  slug: string;
  video_url?: string;
  notes_markdown: string;
  starter_code?: string;
  mini_challenge?: string;
  assignment_markdown?: string;
  hints: string[];
  xp_reward: number;
  quizzes: QuizQuestion[];
}

export default function LessonDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const { user, addLocalXP, refreshStats } = useApp();
  const { ready: pyodideReady, runCodeClient } = usePyodide();

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"learn" | "editor" | "verify">("learn");

  // Editor parameters
  const [code, setCode] = useState("");
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [compilerLoading, setCompilerLoading] = useState(false);

  // Quiz states
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState(false);
  const [quizExplanation, setQuizExplanation] = useState("");

  // Hints
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    async function loadLesson() {
      try {
        setLoading(true);
        const data = await fetchAPI(`/lessons/${slug}`);
        setLesson(data);
        setCode(data.starter_code || "");
      } catch (err) {
        loadMockLesson();
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      loadLesson();
    }
  }, [slug]);

  const loadMockLesson = () => {
    let title = "Variables";
    let notes = "Variables store values in computer memory...";
    let starter = "message = 'Hello, PyPocket!'\nprint(message)";
    let quizzes: QuizQuestion[] = [{
      id: "q1",
      question: "Which expression declares a variable in Python?",
      options: ["x = 5", "int x = 5", "let x = 5", "var x = 5"],
      correct_option_index: 0,
      explanation: "Python assigns variables using the simple `=` sign without any data type declarations."
    }];
    let hints = ["Use `=` for assignment.", "Check syntax outputs."];

    if (slug === "data-types") {
      title = "Data Types";
      notes = "# Core Python Data Types\nIntegers, Floats, Strings, and Booleans are the core primitives.";
      starter = "x = 3.14\nprint(type(x))";
      quizzes = [{
        id: "q2",
        question: "What class type does print(type(3.14)) output?",
        options: ["int", "float", "str", "number"],
        correct_option_index: 1,
        explanation: "Decimal values represent the float data type."
      }];
    }

    setLesson({
      id: "mock-lesson-123",
      title,
      slug: String(slug),
      notes_markdown: notes,
      starter_code: starter,
      hints,
      xp_reward: 20,
      quizzes
    });
    setCode(starter);
  };

  const runCode = async () => {
    setCompilerLoading(true);
    setStdout("");
    setStderr("");
    try {
      const res = await runCodeClient(code);
      setStdout(res.output);
      setStderr(res.error);
    } catch (err: any) {
      setStderr(err.message || String(err));
    } finally {
      setCompilerLoading(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (!lesson || selectedOption === null) return;
    const currentQuiz = lesson.quizzes[0];
    if (!currentQuiz) return;

    setQuizChecked(true);
    const correct = selectedOption === currentQuiz.correct_option_index;
    setQuizSuccess(correct);
    setQuizExplanation(currentQuiz.explanation);

    if (correct) {
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 }
      });
      addLocalXP(lesson.xp_reward);
      try {
        await fetchAPI(`/lessons/${lesson.id}/progress`, { method: "POST" });
        refreshStats();
      } catch (err) {
        console.warn("Offline: Gained local progress.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        <span className="font-mono text-xs text-mono-500">Loading modules...</span>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="flex flex-col h-full gap-4 pb-6 max-w-xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/roadmap")}
          className="p-2 hover:bg-mono-100 rounded-lg text-mono-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-mono-500 block">Syllabus Path</span>
          <h2 className="font-hero text-lg font-black text-black">{lesson.title}</h2>
        </div>
      </div>

      {/* Rebuilt Monochrome Tab buttons */}
      <div className="flex bg-mono-100 p-1 rounded-lg border border-mono-200 text-xs font-mono font-bold">
        <button
          onClick={() => setActiveTab("learn")}
          className={`flex-1 py-2.5 rounded transition-all ${
            activeTab === "learn" ? "bg-white text-black shadow-card" : "text-mono-600"
          }`}
        >
          Study Guide
        </button>
        <button
          onClick={() => setActiveTab("editor")}
          className={`flex-1 py-2.5 rounded transition-all ${
            activeTab === "editor" ? "bg-white text-black shadow-card" : "text-mono-600"
          }`}
        >
          Practice Editor
        </button>
        <button
          onClick={() => setActiveTab("verify")}
          className={`flex-1 py-2.5 rounded transition-all ${
            activeTab === "verify" ? "bg-white text-black shadow-card" : "text-mono-600"
          }`}
        >
          Verify Quiz
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Tab 1: Learn Notes */}
        {activeTab === "learn" && (
          <div className="space-y-4">
            <div className="bg-white border border-mono-200 p-6 rounded-xl shadow-card space-y-4">
              <h3 className="font-hero text-sm font-black border-b border-mono-200 pb-2 text-black">Notion Study Document</h3>
              <div className="text-xs leading-relaxed whitespace-pre-wrap text-mono-800">
                {lesson.notes_markdown}
              </div>
            </div>
            <button
              onClick={() => setActiveTab("editor")}
              className="w-full py-3 bg-black text-white font-black text-xs rounded-lg hover:bg-mono-900 active:scale-98 transition-all"
            >
              Open Practice Code Editor &rarr;
            </button>
          </div>
        )}

        {/* Tab 2: Editor */}
        {activeTab === "editor" && (
          <div className="space-y-4 flex flex-col h-full">
            <div className="bg-white border border-mono-200 p-2 rounded-xl flex justify-between items-center text-[10px] shadow-card">
              <span className="font-mono text-mono-500 px-2 font-bold">starter_code.py</span>
              <button
                onClick={runCode}
                disabled={compilerLoading}
                className="px-3.5 py-2 bg-black text-white font-black rounded-lg flex items-center gap-1.5 active:scale-98 transition-all"
              >
                {compilerLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                Run
              </button>
            </div>

            {/* Dark mono editor */}
            <div className="bg-zinc-950 rounded-xl p-4 flex font-mono text-xs border border-zinc-800 h-[260px]">
              <div className="text-zinc-700 select-none pr-3 border-r border-zinc-900 text-right w-8 flex flex-col">
                {code.split("\n").map((_, i) => (
                  <span key={i}>{i + 1}</span>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-grow bg-transparent outline-none border-none resize-none pl-3 font-mono leading-relaxed h-full overflow-y-auto w-full text-zinc-100"
                spellCheck={false}
              />
            </div>

            {/* Output terminal */}
            <div className="bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden flex flex-col h-[140px]">
              <div className="bg-zinc-900 px-4 py-1.5 text-[9px] font-mono font-bold text-zinc-400">stdout Console</div>
              <div className="p-4 font-mono text-[10px] overflow-y-auto text-zinc-300">
                {stdout && <pre className="whitespace-pre-wrap">{stdout}</pre>}
                {stderr && <pre className="text-red-400 whitespace-pre-wrap">{stderr}</pre>}
                {!stdout && !stderr && <span className="text-zinc-700 italic">Console output empty.</span>}
              </div>
            </div>

            <button
              onClick={() => setActiveTab("verify")}
              className="w-full py-3 bg-black text-white font-black text-xs rounded-lg hover:bg-mono-900 active:scale-98 transition-all"
            >
              Verify Quiz Knowledge &rarr;
            </button>
          </div>
        )}

        {/* Tab 3: Quiz */}
        {activeTab === "verify" && (
          <div className="space-y-4">
            {lesson.quizzes.length > 0 ? (
              <div className="bg-white border border-mono-200 p-6 rounded-xl shadow-card space-y-4">
                <h3 className="font-hero text-xs font-black text-secondary flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Syllabus Checkpoint
                </h3>
                <h4 className="font-bold text-xs text-black leading-relaxed">{lesson.quizzes[0].question}</h4>

                <div className="space-y-2 mt-4">
                  {lesson.quizzes[0].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => !quizChecked && setSelectedOption(idx)}
                      disabled={quizChecked}
                      className={`w-full text-left p-3.5 rounded-lg border text-xs font-bold transition-all ${
                        selectedOption === idx
                          ? "border-black bg-mono-50 text-black"
                          : "border-mono-200 hover:bg-mono-50 text-mono-800"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-mono-200">
                  <button
                    onClick={() => {
                      setShowHint(true);
                      setHintIndex((prev) => (prev + 1) % lesson.hints.length);
                    }}
                    className="flex items-center gap-1.5 text-[10px] text-accent font-mono font-bold hover:underline"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    Read Hint
                  </button>
                  {showHint && (
                    <div className="mt-2 p-3 bg-mono-50 text-mono-700 border border-mono-200 rounded-lg text-[10px] font-semibold">
                      Hint: {lesson.hints[hintIndex]}
                    </div>
                  )}
                </div>

                {!quizChecked ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={selectedOption === null}
                    className="w-full py-3 bg-black text-white font-black text-xs rounded-lg mt-4 disabled:opacity-50 transition-all"
                  >
                    Verify Answer
                  </button>
                ) : (
                  <div className="space-y-4 mt-4">
                    <div className={`p-4 rounded-lg border text-[10px] font-bold ${
                      quizSuccess 
                        ? "bg-green-50 border-green-200 text-green-700" 
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}>
                      <p className="font-black text-xs mb-1">{quizSuccess ? "Correct!" : "Incorrect"}</p>
                      <p className="font-semibold">{quizExplanation}</p>
                    </div>
                    
                    {quizSuccess ? (
                      <button
                        onClick={() => router.push("/roadmap")}
                        className="w-full py-3 bg-black text-white font-black text-xs rounded-lg flex items-center justify-center gap-1.5"
                      >
                        Continue Roadmap Path
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setQuizChecked(false);
                          setSelectedOption(null);
                        }}
                        className="w-full py-3 bg-black text-white font-black text-xs rounded-lg"
                      >
                        Retry Checkpoint
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-mono-200 p-6 rounded-xl shadow-card text-center">
                <p className="text-xs text-mono-500">No checkpoints configured.</p>
                <button
                  onClick={() => router.push("/roadmap")}
                  className="px-4 py-2 bg-black text-white font-bold rounded-lg text-xs mt-3"
                >
                  Roadmap Path
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
