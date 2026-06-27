"use client";

import React, { useState, useEffect } from "react";
import { Play, RotateCcw, Download, Save, Terminal, Cpu } from "lucide-react";
import { usePyodide } from "@/hooks/usePyodide";
import { fetchAPI } from "@/lib/api";

const DEFAULT_CODE = `# Write your Python code here
name = input("Enter your name: ")
print(f"Hello, {name}! Welcome to PyPocket.")

for i in range(3):
    print(f"Counting: {i + 1}")
`;

export default function CompilerPlayground() {
  const { ready: pyodideReady, loading: pyodideLoading, runCodeClient } = usePyodide();
  const [code, setCode] = useState(DEFAULT_CODE);
  const [inputData, setInputData] = useState("Student");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [runTime, setRunTime] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [execMode, setExecMode] = useState<"client" | "server">("client");
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("pypocket_playground_code");
    if (saved) {
      setCode(saved);
    }
  }, []);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("");
    setError("");
    setRunTime(null);
    const start = performance.now();

    try {
      if (execMode === "client") {
        if (!pyodideReady) {
          setError("Python Engine is loading in the browser. Please wait...");
          setIsRunning(false);
          return;
        }
        const res = await runCodeClient(code, inputData);
        setOutput(res.output);
        setError(res.error);
      } else {
        const res = await fetchAPI("/compiler/run", {
          method: "POST",
          body: JSON.stringify({ code, input_data: inputData }),
        });
        setOutput(res.output);
        setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      const end = performance.now();
      setRunTime(Math.round(end - start));
      setIsRunning(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem("pypocket_playground_code", code);
    setSaveStatus("Saved locally!");
    setTimeout(() => setSaveStatus(""), 2000);
  };

  const handleReset = () => {
    if (confirm("Reset editor to default code?")) {
      setCode(DEFAULT_CODE);
      localStorage.removeItem("pypocket_playground_code");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pypocket_program.py";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFormat = () => {
    const lines = code.split("\n");
    const formatted = lines.map(line => line.trimEnd()).join("\n");
    setCode(formatted);
  };

  return (
    <div className="flex flex-col gap-4 h-full pb-6 max-w-2xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="font-hero text-xl font-black text-black">Python Compiler</h2>
          <p className="text-[10px] text-mono-500 font-semibold mt-0.5">Simple Learning. Lifelong Impact.</p>
        </div>

        {/* Engine switcher toggle */}
        <div className="flex items-center gap-1 bg-mono-100 p-1 rounded-lg text-[10px] font-mono font-bold border border-mono-200">
          <button
            onClick={() => setExecMode("client")}
            className={`px-3 py-1 rounded transition-all ${
              execMode === "client" ? "bg-black text-white" : "text-mono-600"
            }`}
          >
            Local (Pyodide)
          </button>
          <button
            onClick={() => setExecMode("server")}
            className={`px-3 py-1 rounded transition-all ${
              execMode === "server" ? "bg-black text-white" : "text-mono-600"
            }`}
          >
            Cloud API
          </button>
        </div>
      </div>

      {/* Action buttons toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2 rounded-xl border border-mono-200 shadow-card">
        <div className="flex items-center gap-1">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-4 py-2.5 bg-black text-white text-xs font-black rounded-lg hover:bg-mono-900 active:scale-98 transition-all flex items-center gap-1.5"
          >
            {isRunning ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            Run Code
          </button>
          
          <button
            onClick={handleSave}
            className="p-2.5 text-mono-600 hover:text-black rounded-lg hover:bg-mono-100 transition-all"
            title="Save code"
          >
            <Save className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 text-mono-600 hover:text-black rounded-lg hover:bg-mono-100 transition-all"
            title="Reset code"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownload}
            className="p-2.5 text-mono-600 hover:text-black rounded-lg hover:bg-mono-100 transition-all"
            title="Download python file"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {saveStatus && <span className="text-[9px] text-green-600 font-bold">{saveStatus}</span>}
          <button
            onClick={handleFormat}
            className="px-2.5 py-1.5 bg-mono-50 hover:bg-mono-100 text-mono-700 text-[9px] font-black font-mono rounded border border-mono-200"
          >
            Format
          </button>
        </div>
      </div>

      {/* Editor & Console stack */}
      <div className="space-y-4">
        {/* Code Typing Area */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-[300px]">
          <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 text-[10px] font-mono font-bold text-zinc-400 flex justify-between items-center">
            <span>workspace/main.py</span>
            {execMode === "client" && pyodideLoading && (
              <span className="text-[8px] text-accent animate-pulse">Loading Pyodide engine...</span>
            )}
          </div>
          <div className="flex-grow flex p-4 font-mono text-xs text-zinc-200">
            {/* Standard static line counters */}
            <div className="text-zinc-700 select-none pr-3 border-r border-zinc-900 text-right w-8 flex flex-col">
              {code.split("\n").map((_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-grow bg-transparent outline-none border-none resize-none pl-3 font-mono leading-relaxed h-full overflow-y-auto w-full text-zinc-100 placeholder-zinc-800"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Input parameters */}
        <div className="bg-white border border-mono-200 p-4 rounded-xl shadow-card space-y-2">
          <label className="block text-[9px] font-mono font-black text-mono-500 uppercase tracking-wider">
            stdin Console Input
          </label>
          <input
            type="text"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder="Arguments sent to input()..."
            className="w-full px-3 py-2 rounded-lg bg-mono-50 border border-mono-200 focus:border-black outline-none font-mono text-xs"
          />
        </div>

        {/* Output Console terminal */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden flex flex-col h-[200px]">
          <div className="bg-zinc-900 border-b border-zinc-850 px-4 py-2 text-[10px] font-mono font-bold text-zinc-400 flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              stdin / stdout outputs
            </span>
            {runTime !== null && (
              <span className="text-[9px] text-zinc-500 font-bold">Ended in {runTime}ms</span>
            )}
          </div>
          <div className="flex-grow p-4 font-mono text-[11px] overflow-y-auto text-zinc-300">
            {output && <pre className="whitespace-pre-wrap">{output}</pre>}
            {error && <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>}
            {!output && !error && (
              <span className="text-zinc-700 italic">No runs executed.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
