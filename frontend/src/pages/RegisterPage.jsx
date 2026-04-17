import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  GraduationCap, Eye, EyeOff, AlertCircle, Loader2,
  CheckCircle2, User, Mail, Lock, BookOpen,
} from "lucide-react";
import GoogleSignInButton from "../components/GoogleSignInButton";

const BRANCHES  = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

function PasswordStrength({ password }) {
  const checks = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
  const labels = ["", "Weak", "Fair", "Good", "Strong 🔥"];
  return password ? (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? colors[score] : "bg-surface-border"}`} />
        ))}
      </div>
      <p className={`text-[10px] ${score <= 1 ? "text-red-400" : score <= 2 ? "text-yellow-400" : "text-green-400"}`}>
        {labels[score]}
      </p>
    </div>
  ) : null;
}

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    branch: "CSE", semester: "1",
  });
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password)
      return setError("Please fill all required fields.");
    if (form.password !== form.confirmPassword)
      return setError("Passwords don't match!");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      await register({
        name:       form.name.trim(),
        email:      form.email.toLowerCase().trim(),
        password:   form.password,
        branch:     form.branch,
        semester:   parseInt(form.semester),
      });
      navigate("/dashboard");
    } catch (err) {
      if (!err.response) {
        setError("Cannot connect to server. Make sure the backend is running on port 5000.");
      } else {
        setError(err.response?.data?.error || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credential) => {
    setLoading(true);
    setError("");
    try {
      await loginWithGoogle(credential);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Google sign up failed. Try email instead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 py-8">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse-slow"
          style={{ background: "radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)" }} />
      </div>

      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #0369a1, #0ea5e9)", boxShadow: "0 0 32px rgba(14,165,233,0.4)" }}>
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-1 text-sm">Join StudyHub — your AI study partner ✨</p>
        </div>

        <div className="card shadow-2xl">
          <GoogleSignInButton
            onCredential={handleGoogle}
            className="mb-4"
          />
          <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-gray-600">
            <div className="h-px flex-1 bg-surface-border" />
            or create with email
            <div className="h-px flex-1 bg-surface-border" />
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                <User size={13} className="text-gray-500" /> Full Name <span className="text-red-400">*</span>
              </label>
              <input
                className="input-field"
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Mail size={13} className="text-gray-500" /> Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="you@gmail.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>

            {/* Branch + Semester row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                <BookOpen size={13} className="text-gray-500" /> Branch
              </label>
                <select
                  className="input-field"
                  value={form.branch}
                  onChange={(e) => set("branch", e.target.value)}
                >
                  {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Semester</label>
                <select
                  className="input-field"
                  value={form.semester}
                  onChange={(e) => set("semester", e.target.value)}
                >
                  {SEMESTERS.map((s) => <option key={s} value={s}>Sem {s}</option>)}
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Lock size={13} className="text-gray-500" /> Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className="input-field pr-10"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                />
                <button type="button" onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  className={`input-field pr-10 ${form.confirmPassword && form.confirmPassword !== form.password ? "border-red-500/50" : form.confirmPassword && form.confirmPassword === form.password ? "border-green-500/50" : ""}`}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={(e) => set("confirmPassword", e.target.value)}
                />
                <button type="button" onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {form.confirmPassword && form.confirmPassword === form.password && (
                  <CheckCircle2 size={14} className="absolute right-9 top-1/2 -translate-y-1/2 text-green-400" />
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-sm">
                <AlertCircle size={15} className="shrink-0" />{error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2 mt-1">
              {loading ? <><Loader2 size={16} className="animate-spin" />Creating account...</> : "Create Account 🚀"}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-surface-border text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">Only CSE Department students are authorized.</p>
      </div>
    </div>
  );
}
