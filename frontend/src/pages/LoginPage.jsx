import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId.trim() || !password.trim()) { setError("Please enter both fields."); return; }
    setLoading(true); setError("");
    try {
      await login(studentId.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl mb-4 shadow-lg shadow-brand-600/30">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">StudyHub</h1>
          <p className="text-gray-400 mt-1 text-sm">CSE Department · Semester 5</p>
        </div>

        <div className="card shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-6">Sign in with your Student ID</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Student ID</label>
              <input
                className="input-field font-mono uppercase"
                placeholder="e.g. CS2021001"
                value={studentId}
                onChange={e => setStudentId(e.target.value.toUpperCase())}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-sm">
                <AlertCircle size={15} className="shrink-0" />{error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2 mt-1">
              {loading ? <><Loader2 size={16} className="animate-spin" />Signing in...</> : "Sign In"}
            </button>
          </form>

          <div className="mt-5 p-3 bg-surface rounded-lg border border-surface-border">
            <p className="text-xs text-gray-400 font-medium mb-2">Demo credentials</p>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {[["CS2021001","pass123"],["CS2021002","pass123"],["CS2021004","pass123"]].map(([id, pw]) => (
                <button key={id} onClick={() => { setStudentId(id); setPassword(pw); }}
                  className="text-left p-2 rounded bg-surface-hover hover:border-brand-600/50 border border-transparent transition-all">
                  <span className="text-brand-400">{id}</span>
                  <span className="text-gray-600"> / {pw}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-gray-600 text-xs mt-6">Only CSE Department students are authorized.</p>
      </div>
    </div>
  );
}
