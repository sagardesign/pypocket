"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Terminal, LogIn, UserPlus, Play, Key, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";

type AuthMode = "signin" | "signup" | "forgot" | "reset";

export default function LandingPage() {
  const router = useRouter();
  const { user, login, guestLogin, loading } = useApp();
  
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [debugPin, setDebugPin] = useState("");

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setFormLoading(true);

    try {
      if (mode === "signup") {
        const regRes = await fetch(`http://localhost:8000/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!regRes.ok) {
          const data = await regRes.json();
          throw new Error(data.detail || "Registration failed");
        }
        setMode("signin");
        setFormSuccess("Account created successfully. Please sign in.");
      } 
      
      else if (mode === "signin") {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        const logRes = await fetch(`http://localhost:8000/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData,
        });

        if (!logRes.ok) {
          const data = await logRes.json();
          throw new Error(data.detail || "Authentication failed");
        }

        const data = await logRes.json();
        await login(data.access_token);
        router.push("/dashboard");
      } 
      
      else if (mode === "forgot") {
        const res = await fetch(`http://localhost:8000/api/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Reset request failed");
        }
        const data = await res.json();
        setFormSuccess("Password reset code generated.");
        setDebugPin(data.debug_token || "");
        setMode("reset");
      } 
      
      else if (mode === "reset") {
        const res = await fetch(`http://localhost:8000/api/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: resetToken, new_password: newPassword }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Invalid or expired reset token");
        }
        setMode("signin");
        setFormSuccess("Password reset successful. Please sign in.");
      }
    } catch (err: any) {
      setFormError(err.message || "Connection refused. Please use Quick Guest Access.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setFormError("");
    setFormLoading(true);
    try {
      const mockGoogleToken = "mock_google_learner";
      const res = await fetch(`http://localhost:8000/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: mockGoogleToken }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Google authentication failed");
      }
      const data = await res.json();
      await login(data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setFormError(err.message || "Could not login with Google mock. Falling back to Guest mode.");
      handleGuest();
    } finally {
      setFormLoading(false);
    }
  };

  const handleGuest = async () => {
    setFormLoading(true);
    await guestLogin();
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        <span className="font-mono text-xs text-mono-500">Initializing PyPocket...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] w-full px-2 max-w-sm mx-auto">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center gap-3 mb-8">
        <div className="w-12 h-12 border border-mono-300 bg-white flex items-center justify-center rounded-lg shadow-card">
          <Terminal className="w-5 h-5 text-black" />
        </div>
        <div>
          <h1 className="font-hero text-3xl font-black tracking-tight text-black">
            PyPocket
          </h1>
          <span className="text-[10px] uppercase tracking-widest text-mono-600 font-bold block mt-1">
            Learn. Grow. Excel.
          </span>
        </div>
        <p className="text-mono-600 text-xs leading-relaxed max-w-[280px]">
          Simple Learning. Lifelong Impact. Python programming core syllabus built for smartphone screens.
        </p>
      </div>

      {/* Main Entry Card */}
      <div className="w-full bg-white border border-mono-200 p-6 rounded-xl shadow-card transition-all">
        <h2 className="text-sm font-black flex items-center gap-2 mb-4 uppercase tracking-wider text-black">
          {mode === "signin" && <LogIn className="w-4 h-4" />}
          {mode === "signup" && <UserPlus className="w-4 h-4" />}
          {mode === "forgot" && <Key className="w-4 h-4" />}
          {mode === "reset" && <Key className="w-4 h-4" />}
          {mode === "signin" && "Sign In"}
          {mode === "signup" && "Create Account"}
          {mode === "forgot" && "Reset Password"}
          {mode === "reset" && "Enter Reset Code"}
        </h2>

        {formError && (
          <div className="bg-red-50 text-red-700 border border-red-200 text-[10px] p-3 rounded-lg mb-4 font-bold">
            {formError}
          </div>
        )}

        {formSuccess && (
          <div className="bg-green-50 text-green-700 border border-green-200 text-[10px] p-3 rounded-lg mb-4 font-bold">
            {formSuccess}
          </div>
        )}

        {/* Debug Token Pin Display overlay for quick testing */}
        {mode === "reset" && debugPin && (
          <div className="bg-mono-50 border border-mono-300 text-[10px] p-3 rounded-lg mb-4 font-mono font-bold text-center">
            <span className="text-mono-500 uppercase block mb-1">Testing Code Pin:</span>
            <span className="text-sm font-black text-black">{debugPin}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
          {mode !== "reset" && (
            <div>
              <label className="block text-[10px] text-mono-600 uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full px-3 py-2.5 rounded-lg bg-mono-50 border border-mono-200 focus:border-black outline-none font-sans text-xs transition-all"
                required
              />
            </div>
          )}

          {mode !== "forgot" && mode !== "reset" && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-mono-600 uppercase tracking-wider">
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormError("");
                      setFormSuccess("");
                      setMode("forgot");
                    }}
                    className="text-[9px] text-mono-500 hover:text-black font-semibold"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg bg-mono-50 border border-mono-200 focus:border-black outline-none font-sans text-xs transition-all"
                required
              />
            </div>
          )}

          {mode === "reset" && (
            <>
              <div>
                <label className="block text-[10px] text-mono-600 uppercase tracking-wider mb-1">
                  6-Digit Reset Pin
                </label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full px-3 py-2.5 rounded-lg bg-mono-50 border border-mono-200 focus:border-black outline-none font-mono text-xs transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-mono-600 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-lg bg-mono-50 border border-mono-200 focus:border-black outline-none font-sans text-xs transition-all"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={formLoading}
            className="w-full py-3 bg-black text-white font-black rounded-lg hover:bg-mono-900 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            {formLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : mode === "signin" ? (
              "Sign In"
            ) : mode === "signup" ? (
              "Create Account"
            ) : mode === "forgot" ? (
              "Send Reset Code"
            ) : (
              "Update Password"
            )}
          </button>
        </form>

        <div className="flex items-center my-5">
          <hr className="flex-1 border-mono-200" />
          <span className="px-3 text-[9px] text-mono-500 font-bold uppercase tracking-widest">or</span>
          <hr className="flex-1 border-mono-200" />
        </div>

        {/* Google OAuth Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={formLoading}
          className="w-full py-3 bg-white text-black border border-mono-300 font-black rounded-lg hover:bg-mono-50 active:scale-98 transition-all flex items-center justify-center gap-2 text-xs mb-2"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Sign In with Google
        </button>

        <button
          onClick={handleGuest}
          disabled={formLoading}
          className="w-full py-3 bg-mono-50 text-black border border-mono-200 font-black rounded-lg hover:bg-mono-100 active:scale-98 transition-all flex items-center justify-center gap-2 text-xs"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Quick Guest Access
        </button>

        <p className="text-center text-[10px] text-mono-600 mt-5 font-semibold">
          {mode === "signin" && (
            <>
              New to PyPocket?{" "}
              <button
                onClick={() => {
                  setFormError("");
                  setFormSuccess("");
                  setMode("signup");
                }}
                className="text-black font-black hover:underline"
              >
                Sign Up
              </button>
            </>
          )}
          {mode === "signup" && (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setFormError("");
                  setFormSuccess("");
                  setMode("signin");
                }}
                className="text-black font-black hover:underline"
              >
                Sign In
              </button>
            </>
          )}
          {(mode === "forgot" || mode === "reset") && (
            <button
              onClick={() => {
                setFormError("");
                setFormSuccess("");
                setMode("signin");
              }}
              className="text-black font-black hover:underline"
            >
              Back to Sign In
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
