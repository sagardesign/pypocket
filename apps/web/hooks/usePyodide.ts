"use client";

import { useState, useEffect } from "react";

declare global {
  interface Window {
    loadPyodide: any;
    pyodideInstance: any;
  }
}

export function usePyodide() {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.pyodideInstance) {
      setReady(true);
      return;
    }

    const loadScript = () => {
      if (document.getElementById("pyodide-cdn")) {
        return;
      }
      const script = document.createElement("script");
      script.id = "pyodide-cdn";
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
      script.async = true;
      script.onload = async () => {
        setLoading(true);
        try {
          window.pyodideInstance = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
          });
          setReady(true);
        } catch (err) {
          console.error("Pyodide failed to load", err);
        } finally {
          setLoading(false);
        }
      };
      document.body.appendChild(script);
    };

    loadScript();
  }, []);

  const runCodeClient = async (code: string, inputData: string = ""): Promise<{ output: string; error: string }> => {
    if (!ready || !window.pyodideInstance) {
      return { output: "", error: "Python execution engine is loading..." };
    }

    const pyodide = window.pyodideInstance;

    try {
      // Clear output buffers and hook stdin/stdout
      let outputBuffer = "";
      
      // Override print output in python
      pyodide.runPython(`
        import sys
        import io
        sys.stdout = io.StringIO()
        sys.stderr = io.StringIO()
      `);

      // Mock stdin
      if (inputData) {
        pyodide.runPython(`
          import sys
          import io
          sys.stdin = io.StringIO(${JSON.stringify(inputData)})
        `);
      }

      await pyodide.runPythonAsync(code);

      const stdout = pyodide.runPython("sys.stdout.getvalue()");
      const stderr = pyodide.runPython("sys.stderr.getvalue()");

      return {
        output: stdout,
        error: stderr,
      };
    } catch (err: any) {
      return {
        output: "",
        error: err.message || String(err),
      };
    }
  };

  return { ready, loading, runCodeClient };
}
