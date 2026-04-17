import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { authApi, progressApi, badgeApi } from "../lib/api";
import Heatmap from "../components/Heatmap";
import {
  User, Edit3, Check, X, Github, Mail, BookOpen,
  Flame, Clock, Star, Trophy, Loader2, Lock, Save,
  Zap, CheckCircle2, Target, Link2, Twitter, Linkedin,
  Camera, Globe, Award, TrendingUp, Code2, Shield,
} from "lucide-react";

const AVATAR_OPTIONS = [
  "😎","🧑‍💻","👨‍🎓","👩‍🎓","🦊","🐼","🦁","🐯",
  "🚀","⚡","🎯","💎","🔥","👑","🌟","🤖",
  "🎓","📚","💡","🏆","🎮","🎨","⚙️","🧠",
];

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={{ background: bg || "rgba(14,165,233,0.06)", border: `1px solid ${color}25` }}
      className="rounded-2xl p-5 flex flex-col gap-2 items-center text-center">
      <div style={{ background: `${color}18`, border: `1px solid ${color}30`, width: 40, height: 40 }}
        className="rounded-xl flex items-center justify-center">
        <Icon size={18} style={{ color }} />
      </div>
      <p className="text-2xl font-extrabold text-white leading-none">{value}</p>
      <p className="text-xs text-zinc-500 font-medium">{label}</p>
    </div>
  );
}

/* ── Badge Card ── */
function BadgeCard({ badge }) {
  return (
    <div title={badge.description}
      className={`relative rounded-2xl border p-3.5 text-center transition-all group cursor-default ${
        badge.earned
          ? "border-brand-500/30 bg-brand-500/5 shadow-sm"
          : "border-surface-border bg-surface opacity-40 grayscale"
      }`}>
      {badge.earned && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
          <Check size={11} className="text-white" />
        </div>
      )}
      <div className="text-2xl mb-2">{badge.icon}</div>
      <p className={`text-[11px] font-semibold leading-tight ${badge.earned ? "text-white" : "text-zinc-600"}`}>
        {badge.name}
      </p>
      {badge.earned && badge.earned_at && (
        <p className="text-[9px] text-zinc-600 mt-0.5">
          {new Date(badge.earned_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </p>
      )}
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-zinc-900 border border-zinc-700
        rounded-xl px-3 py-2 text-[11px] text-zinc-300 hidden group-hover:block z-20 text-center shadow-xl">
        {badge.description}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
      </div>
    </div>
  );
}

/* ── Skill Bar ── */
function SkillBar({ label, pct, color }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-zinc-300 font-medium">{label}</span>
        <span className="text-xs text-zinc-500 font-mono font-bold">{pct}%</span>
      </div>
      <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: color || "linear-gradient(90deg, #0ea5e9, #38bdf8)" }} />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { student, updateStudent } = useAuth();
  const [progress,    setProgress]    = useState(null);
  const [badges,      setBadges]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [editing,     setEditing]     = useState(false);
  const [pickAvatar,  setPickAvatar]  = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState("");
  const [activeTab,   setActiveTab]   = useState("overview");
  const avatarRef = useRef(null);

  const [form, setForm] = useState({
    name:     student?.name     || "",
    bio:      student?.bio      || "",
    github:   student?.github   || "",
    linkedin: student?.linkedin || "",
    website:  student?.website  || "",
    cgpa:     student?.cgpa     || "",
    semester: student?.semester || 5,
  });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmNew: "" });
  const [pwMsg,  setPwMsg]  = useState("");
  const [pwErr,  setPwErr]  = useState("");
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    Promise.all([progressApi.me(), badgeApi.list()])
      .then(([pRes, bRes]) => { setProgress(pRes.data); setBadges(bRes.data); })
      .finally(() => setLoading(false));
  }, []);

  // Close avatar picker on outside click
  useEffect(() => {
    const handler = (e) => { if (avatarRef.current && !avatarRef.current.contains(e.target)) setPickAvatar(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true); setSaveMsg("");
    try {
      const res = await authApi.updateProfile(form);
      updateStudent({ ...student, ...res.data });
      setSaveMsg("✓ Saved");
      setEditing(false);
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) {
      setSaveMsg(err.response?.data?.error || "Save failed");
    } finally { setSaving(false); }
  };

  const handleAvatarPick = async (emoji) => {
    try {
      await authApi.updateAvatar(emoji);
      updateStudent({ ...student, avatar: emoji });
      setPickAvatar(false);
    } catch {}
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwErr(""); setPwMsg("");
    if (pwForm.newPassword !== pwForm.confirmNew) return setPwErr("Passwords don't match");
    if (pwForm.newPassword.length < 6) return setPwErr("Password must be at least 6 characters");
    try {
      await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg("Password updated! 🔐");
      setPwForm({ currentPassword: "", newPassword: "", confirmNew: "" });
    } catch (err) { setPwErr(err.response?.data?.error || "Failed"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-72">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-brand-400" size={28} />
        <span className="text-zinc-500 text-sm">Loading profile...</span>
      </div>
    </div>
  );

  const totalMinutes = progress?.totalMinutes || 0;
  const earnedBadges = badges.filter(b => b.earned).length;
  const subjectIds   = Object.keys(progress?.subjectProgress || {});
  const completedRes = (progress?.completedResources || []).length;

  const TABS = ["overview", "progress", "badges", "settings"];

  return (
    <div className="flex flex-col gap-0 animate-fade-in max-w-5xl mx-auto">

      {/* ── PROFILE BANNER ── */}
      <div className="relative rounded-2xl overflow-hidden mb-0">
        {/* Banner background */}
        <div style={{
          height: 140,
          background: "linear-gradient(135deg, #0c1a2e 0%, #0a1628 40%, #0d2044 100%)",
          borderBottom: "1px solid #1e1e24",
        }}>
          {/* Decorative pattern */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.06,
            backgroundImage: "radial-gradient(circle at 2px 2px, #38bdf8 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }} />
          {/* Glow */}
          <div style={{
            position: "absolute", top: -60, right: "10%",
            width: 280, height: 280, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)",
          }} />
        </div>

        {/* Avatar + basic info row */}
        <div className="px-6 pb-5" style={{ background: "#111115", borderBottom: "1px solid #1e1e24" }}>
          <div className="flex items-end gap-5 flex-wrap" style={{ marginTop: -40 }}>
            {/* Avatar */}
            <div ref={avatarRef} className="relative shrink-0">
              <div
                onClick={() => setPickAvatar(v => !v)}
                className="relative cursor-pointer group"
                style={{
                  width: 88, height: 88, borderRadius: 20,
                  background: "linear-gradient(135deg, #0369a1, #0ea5e9)",
                  border: "4px solid #111115",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 38, boxShadow: "0 0 0 2px rgba(14,165,233,0.25)",
                  transition: "all 0.2s",
                }}
              >
                {student?.avatar || "🎓"}
                <div className="absolute inset-0 bg-black/60 rounded-[16px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={20} className="text-white" />
                </div>
              </div>

              {/* Avatar picker dropdown */}
              {pickAvatar && (
                <div className="absolute left-0 top-full mt-2 z-40 bg-zinc-900 border border-zinc-700 rounded-2xl p-3 shadow-2xl w-60">
                  <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wide mb-3 px-1">Choose your avatar</p>
                  <div className="grid grid-cols-6 gap-1">
                    {AVATAR_OPTIONS.map(e => (
                      <button key={e} onClick={() => handleAvatarPick(e)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all hover:scale-110 hover:bg-brand-500/20 ${
                          student?.avatar === e ? "bg-brand-500/20 border border-brand-500/40" : ""
                        }`}>{e}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{student?.name}</h1>
                {student?.role === "admin" && (
                  <span className="badge-sky flex items-center gap-1">
                    <Shield size={10} /> Admin
                  </span>
                )}
              </div>
              <p className="text-zinc-500 text-sm font-mono mt-0.5">{student?.id}</p>
              {student?.bio ? (
                <p className="text-zinc-400 text-sm mt-2 max-w-lg">{student.bio}</p>
              ) : (
                <p className="text-zinc-600 text-sm mt-2 italic">No bio yet — click Edit Profile to add one</p>
              )}
              {/* Social links */}
              <div className="flex flex-wrap gap-4 mt-3">
                {student?.email && (
                  <a href={`mailto:${student.email}`} className="flex items-center gap-1.5 text-zinc-500 hover:text-brand-400 text-xs transition-colors">
                    <Mail size={12} /> {student.email}
                  </a>
                )}
                {student?.github && (
                  <a href={`https://github.com/${student.github}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs transition-colors">
                    <Github size={12} /> {student.github}
                  </a>
                )}
                {student?.linkedin && (
                  <a href={student.linkedin} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-zinc-500 hover:text-brand-400 text-xs transition-colors">
                    <Linkedin size={12} /> LinkedIn
                  </a>
                )}
                {student?.website && (
                  <a href={student.website} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-zinc-500 hover:text-brand-400 text-xs transition-colors">
                    <Globe size={12} /> Website
                  </a>
                )}
                <span className="flex items-center gap-1.5 text-zinc-600 text-xs">
                  <BookOpen size={12} /> Sem {student?.semester} · CGPA {student?.cgpa}
                </span>
              </div>
            </div>

            {/* Edit button */}
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shrink-0"
              style={{ background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.3)" }}>
              <Edit3 size={14} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* ── STAT STRIP ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <StatCard icon={Code2}    label="Resources Completed" value={completedRes}                          color="#0ea5e9" />
        <StatCard icon={Clock}    label="Hours Studied"        value={`${(totalMinutes/60).toFixed(1)}h`}  color="#8b5cf6" />
        <StatCard icon={Flame}    label="Day Streak"           value={`${progress?.streak || 0}🔥`}        color="#f97316" />
        <StatCard icon={Award}    label="Badges Earned"        value={`${earnedBadges} / ${badges.length}`} color="#f59e0b" />
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-1 mt-5 p-1 rounded-xl" style={{ background: "#111115", border: "1px solid #1e1e24" }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
              activeTab === tab
                ? "text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
            style={activeTab === tab ? {
              background: "linear-gradient(135deg, rgba(14,165,233,0.2), rgba(14,165,233,0.08))",
              border: "1px solid rgba(14,165,233,0.3)",
              color: "#38bdf8",
            } : {}}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="mt-4 flex flex-col gap-4">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <>
            {/* Activity Heatmap */}
            <div className="card">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Flame size={15} className="text-orange-400" /> Study Activity — {Object.keys(progress?.studyLog || {}).length} active days
              </h3>
              <Heatmap studyLog={progress?.studyLog || {}} />
            </div>

            {/* Subject Progress */}
            {subjectIds.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                  <TrendingUp size={15} className="text-brand-400" /> Subject Progress
                </h3>
                <div className="flex flex-col gap-4">
                  {subjectIds.map(id => (
                    <SkillBar key={id} label={id.toUpperCase()} pct={progress.subjectProgress[id] || 0} />
                  ))}
                </div>
              </div>
            )}

            {/* Points & Rank */}
            <div className="card">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Star size={15} className="text-amber-400" /> Points & Ranking
              </h3>
              <div className="flex items-center gap-6 flex-wrap">
                <div>
                  <p className="text-4xl font-black text-white">{progress?.totalPoints || 0}</p>
                  <p className="text-xs text-zinc-500 mt-1">Total Points</p>
                </div>
                <div style={{ width: 1, height: 48, background: "#1e1e24" }} />
                <div>
                  <p className="text-2xl font-bold text-amber-400">+10</p>
                  <p className="text-xs text-zinc-500 mt-1">per resource completed</p>
                </div>
                <div style={{ width: 1, height: 48, background: "#1e1e24" }} />
                <div>
                  <p className="text-2xl font-bold text-orange-400">{progress?.streak || 0} 🔥</p>
                  <p className="text-xs text-zinc-500 mt-1">current streak</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* PROGRESS */}
        {activeTab === "progress" && (
          <>
            {subjectIds.length === 0 ? (
              <div className="card flex flex-col items-center gap-4 py-16 text-center">
                <BookOpen size={40} className="text-zinc-700" />
                <p className="text-zinc-500 text-sm">No subject progress yet. Start completing resources!</p>
              </div>
            ) : (
              <div className="card">
                <h3 className="text-sm font-bold text-white mb-5">Detailed Subject Progress</h3>
                <div className="flex flex-col gap-5">
                  {subjectIds.map(id => {
                    const pct = progress.subjectProgress[id] || 0;
                    return (
                      <div key={id}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-white text-sm">{id.toUpperCase()}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">{pct}% complete</span>
                            {pct === 100 && <span className="badge-emerald">✓ Done</span>}
                            {pct >= 50 && pct < 100 && <span className="badge-sky">In Progress</span>}
                            {pct < 50 && pct > 0 && <span className="badge-amber">Started</span>}
                          </div>
                        </div>
                        <div className="h-3 bg-surface-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${pct}%`,
                              background: pct === 100
                                ? "linear-gradient(90deg, #10b981, #34d399)"
                                : "linear-gradient(90deg, #0ea5e9, #38bdf8)",
                            }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* BADGES */}
        {activeTab === "badges" && (
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap size={15} className="text-amber-400" /> Achievements
              </h3>
              <span className="badge-emerald">{earnedBadges} / {badges.length} earned</span>
            </div>
            {badges.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-8">No badges available yet.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {badges.map(badge => <BadgeCard key={badge.id} badge={badge} />)}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <>
            {/* Edit Profile */}
            <div className="card">
              <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                <User size={15} className="text-brand-400" /> Edit Profile
              </h3>
              {editing ? (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="section-label block mb-1.5">Full Name</label>
                      <input className="input-field" value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
                    </div>
                    <div>
                      <label className="section-label block mb-1.5">GitHub Username</label>
                      <input className="input-field" value={form.github}
                        onChange={e => setForm({ ...form, github: e.target.value })} placeholder="username (no @)" />
                    </div>
                    <div>
                      <label className="section-label block mb-1.5">LinkedIn URL</label>
                      <input className="input-field" value={form.linkedin}
                        onChange={e => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />
                    </div>
                    <div>
                      <label className="section-label block mb-1.5">Website / Portfolio</label>
                      <input className="input-field" value={form.website}
                        onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://yoursite.com" />
                    </div>
                    <div>
                      <label className="section-label block mb-1.5">CGPA</label>
                      <input type="number" className="input-field" value={form.cgpa}
                        onChange={e => setForm({ ...form, cgpa: e.target.value })} min="0" max="10" step="0.1" />
                    </div>
                    <div>
                      <label className="section-label block mb-1.5">Semester</label>
                      <select className="input-field" value={form.semester}
                        onChange={e => setForm({ ...form, semester: parseInt(e.target.value) })}>
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="section-label block mb-1.5">Bio <span className="text-zinc-600 font-normal normal-case">({(form.bio || "").length}/200)</span></label>
                    <textarea className="input-field resize-none" rows={3} maxLength={200}
                      value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                      placeholder="Tell others about yourself — e.g. CSE final year · DSA grinder · hackathon enthusiast 🚀" />
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={handleSaveProfile} disabled={saving}
                      className="btn-primary flex items-center gap-2 text-sm">
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
                    {saveMsg && (
                      <span className={`text-sm font-medium ${saveMsg.includes("✓") ? "text-emerald-400" : "text-red-400"}`}>
                        {saveMsg}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Full Name",   value: student?.name },
                    { label: "Student ID",  value: student?.id },
                    { label: "Email",       value: student?.email },
                    { label: "Bio",         value: student?.bio || "—" },
                    { label: "GitHub",      value: student?.github || "—" },
                    { label: "LinkedIn",    value: student?.linkedin || "—" },
                    { label: "Website",     value: student?.website || "—" },
                    { label: "Semester",    value: `Semester ${student?.semester}` },
                    { label: "CGPA",        value: student?.cgpa },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-4 py-2.5 border-b border-surface-border last:border-0">
                      <span className="text-xs text-zinc-600 uppercase tracking-wide font-bold w-24 shrink-0">{label}</span>
                      <span className="text-sm text-zinc-300 flex-1 truncate">{value}</span>
                    </div>
                  ))}
                  <button onClick={() => setEditing(true)}
                    className="btn-primary flex items-center gap-2 text-sm w-fit mt-2">
                    <Edit3 size={14} /> Edit Profile
                  </button>
                </div>
              )}
            </div>

            {/* Change Password */}
            <div className="card">
              <button onClick={() => setShowPw(v => !v)}
                className="flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors w-full">
                <Lock size={14} className="text-brand-400" />
                {showPw ? "Hide Password Section" : "Change Password"}
                <span className="ml-auto text-zinc-600 text-xs">{showPw ? "▲" : "▼"}</span>
              </button>

              {showPw && (
                <form onSubmit={handleChangePassword} className="flex flex-col gap-3 mt-5 pt-5 border-t border-surface-border">
                  <div>
                    <label className="section-label block mb-1.5">Current Password</label>
                    <input type="password" className="input-field text-sm" placeholder="Enter current password"
                      value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
                  </div>
                  <div>
                    <label className="section-label block mb-1.5">New Password</label>
                    <input type="password" className="input-field text-sm" placeholder="At least 6 characters"
                      value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
                  </div>
                  <div>
                    <label className="section-label block mb-1.5">Confirm New Password</label>
                    <input type="password" className="input-field text-sm" placeholder="Re-enter new password"
                      value={pwForm.confirmNew} onChange={e => setPwForm({ ...pwForm, confirmNew: e.target.value })} />
                  </div>
                  {pwErr && <p className="text-red-400 text-sm flex items-center gap-1"><X size={13} /> {pwErr}</p>}
                  {pwMsg && <p className="text-emerald-400 text-sm flex items-center gap-1"><CheckCircle2 size={13} /> {pwMsg}</p>}
                  <button type="submit" className="btn-primary text-sm w-fit flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Update Password
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
