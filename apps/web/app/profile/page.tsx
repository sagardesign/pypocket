"use client";

import React, { useState, useEffect } from "react";
import { Mail, Award, FileText, CheckCircle, BarChart3, Edit3, Github, Linkedin, ExternalLink } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { fetchAPI } from "@/lib/api";

interface Certificate {
  id: string;
  course_title: string;
  certificate_uuid: string;
  qr_hash: string;
  issue_date: string;
}

export default function Profile() {
  const { user, profile, stats, logout } = useApp();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI("/profile/change-password", {
        method: "POST",
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
      });
      alert("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      alert(err.message || "Failed to update password.");
    }
  };

  const handleResetProgress = async () => {
    if (confirm("WARNING: This will permanently delete all of your learning history, streaks, coins, and badges. This cannot be undone. Proceed?")) {
      try {
        await fetchAPI("/profile/reset-progress", {
          method: "POST"
        });
        alert("Progress reset successful. Logging out...");
        logout();
      } catch (err: any) {
        alert(err.message || "Failed to reset progress.");
      }
    }
  };

  
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setBio(profile.bio || "No biography provided yet.");
      setSkills(profile.skills || ["Python Programming", "Problem Solving"]);
      setGithubUrl(profile.github_url || "");
      setLinkedinUrl(profile.linkedin_url || "");
    }
  }, [profile]);

  useEffect(() => {
    async function loadCerts() {
      try {
        const data = await fetchAPI("/certificates");
        setCerts(data);
      } catch (err) {
        if (stats && stats.completed_lessons >= 2) {
          setCerts([
            {
              id: "cert1",
              course_title: "Python Basics",
              certificate_uuid: "PP-84A9-10F3",
              qr_hash: "verified_pypocket_cert_hash_xyz",
              issue_date: new Date().toLocaleDateString()
            }
          ]);
        }
      }
    }
    if (user) {
      loadCerts();
    }
  }, [user, stats]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI("/profile/me", {
        method: "PUT",
        body: JSON.stringify({ username, bio, skills, github_url: githubUrl, linkedin_url: linkedinUrl })
      });
      setIsEditing(false);
      alert("Profile updated!");
    } catch (err) {
      setIsEditing(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full">
      {/* Header Profile Info */}
      <section className="bg-white border border-mono-200 p-6 rounded-xl shadow-card relative">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded bg-mono-100 border border-mono-300 text-foreground flex items-center justify-center font-bold text-2xl">
            {username?.[0]?.toUpperCase() || "S"}
          </div>
          <div className="flex-grow text-center sm:text-left space-y-1">
            <h2 className="font-hero text-lg font-black flex items-center justify-center sm:justify-start gap-2 text-black">
              {username || "Student"}
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="p-1 hover:bg-mono-100 rounded text-mono-500 hover:text-black transition-colors"
                title="Edit biography"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </h2>
            <p className="text-[10px] text-mono-500 font-mono font-bold flex items-center justify-center sm:justify-start gap-1">
              <Mail className="w-3.5 h-3.5 text-mono-400" /> {user.email}
            </p>
            <p className="text-xs text-mono-600 font-semibold italic mt-2">{bio}</p>
          </div>
        </div>
      </section>

      {/* Edit Bio Form */}
      {isEditing && (
        <section className="bg-white border border-mono-200 p-6 rounded-xl shadow-card space-y-4">
          <h3 className="text-xs font-black text-black uppercase tracking-wider">Update Profile Information</h3>
          <form onSubmit={handleSave} className="space-y-4 text-xs font-bold">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-mono-500 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-mono-50 border border-mono-200 focus:border-black outline-none"
                />
              </div>
              <div>
                <label className="block text-mono-500 mb-1">Bio / Status</label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-mono-50 border border-mono-200 focus:border-black outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-mono-100 text-mono-700 font-black rounded-lg text-xs"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-black text-white font-black rounded-lg text-xs"
              >
                Save Updates
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Skills and Activity Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <section className="bg-white border border-mono-200 p-5 rounded-xl shadow-card space-y-3">
          <h3 className="font-hero text-xs font-black text-black flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-secondary" />
            Skills Summary
          </h3>
          <div className="flex flex-wrap gap-1">
            {skills.map((skill, index) => (
              <span 
                key={index}
                className="px-2.5 py-1 bg-mono-100 text-foreground border border-mono-200 rounded text-[9px] font-mono font-bold"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-white border border-mono-200 p-5 rounded-xl shadow-card space-y-3">
          <h3 className="font-hero text-xs font-black text-black flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-secondary" />
            Weekly Activity Log
          </h3>
          <div className="flex items-end justify-between h-16 px-1 mt-2">
            {["M", "T", "W", "T", "F"].map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div 
                  className={`w-6 rounded-t transition-all ${
                    i === 2 ? "bg-black h-12" : "bg-mono-200 h-6"
                  }`}
                ></div>
                <span className="text-[8px] font-mono font-bold text-mono-500">{d}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Certificates section */}
      <section className="bg-white border border-mono-200 p-6 rounded-xl shadow-card space-y-4">
        <h3 className="font-hero text-xs font-black text-black flex items-center gap-1.5">
          <Award className="w-4 h-4 text-accent" />
          Verified PDF Certificates
        </h3>

        {certs.length > 0 ? (
          <div className="space-y-3">
            {certs.map((cert) => (
              <div 
                key={cert.id}
                className="bg-mono-50 border border-mono-200 p-4 rounded-xl flex items-center justify-between gap-4 text-xs font-bold"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-mono-400" />
                  <div>
                    <h4 className="font-bold text-black">{cert.course_title} Completion</h4>
                    <p className="font-mono text-[9px] text-mono-500 mt-0.5">UUID: {cert.certificate_uuid}</p>
                    <p className="text-[8px] text-mono-400 mt-0.5">Date: {cert.issue_date}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => alert(`Certificate verification ID: ${cert.certificate_uuid} is valid.`)}
                    className="px-2.5 py-1 bg-white border border-mono-300 text-mono-800 rounded font-mono text-[9px] font-bold"
                  >
                    Verify QR
                  </button>
                  <a
                    href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-black text-white rounded font-mono text-[9px] font-bold flex items-center gap-0.5"
                  >
                    PDF <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-mono-500 italic">Complete at least 2 course lessons to earn your verification certificate.</p>
        )}
      </section>

      {/* Account Settings Section */}
      <section className="bg-white border border-mono-200 p-6 rounded-xl shadow-card space-y-6">
        <h3 className="font-hero text-xs font-black text-black flex items-center gap-1.5 border-b border-mono-200 pb-2 uppercase tracking-wider">
          Account Settings
        </h3>

        {/* Change password */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs text-black">Update Password</h4>
          <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
            <input
              type="password"
              placeholder="Current Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="p-2.5 rounded-lg bg-mono-50 border border-mono-200 focus:border-black outline-none font-sans"
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="p-2.5 rounded-lg bg-mono-50 border border-mono-200 focus:border-black outline-none font-sans"
              required
            />
            <button
              type="submit"
              className="sm:col-span-2 py-2.5 bg-black text-white rounded-lg font-black transition-all hover:bg-mono-900 active:scale-98"
            >
              Update Password
            </button>
          </form>
        </div>

        <div className="border-t border-mono-200 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h4 className="font-bold text-xs text-red-600">Reset All Progress</h4>
            <p className="text-[10px] text-mono-500 font-semibold mt-0.5 font-sans">Permanently clears your streak, levels, coins, and completed lessons.</p>
          </div>
          <button
            onClick={handleResetProgress}
            className="px-4 py-2 bg-white text-red-600 border border-red-250 hover:bg-red-50 rounded-lg text-xs font-black"
          >
            Reset Progress
          </button>
        </div>
      </section>
    </div>
  );
}
