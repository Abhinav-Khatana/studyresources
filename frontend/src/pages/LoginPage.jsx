import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate  = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) { setError("Please enter both fields."); return; }
    setLoading(true); setError("");
    try {
      await login(identifier.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      if (!err.response) {
        setError("Cannot connect to server. Make sure the backend is running on port 5000.");
      } else {
        setError(err.response?.data?.error || "Login failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credential) => {
    setLoading(true); setError("");
    try {
      await loginWithGoogle(credential);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Google sign in failed. Try email instead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4" style={{ background: "#0a0a0f" }}>
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse-slow"
          style={{ background: "radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)" }} />
      </div>
      <div className="w-full max-w-md relative">
        {/* Back to home */}
        <Link to="/" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm mb-6 w-fit transition-colors">
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #0369a1, #0ea5e9)", boxShadow: "0 0 32px rgba(14,165,233,0.4)" }}>
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">StudyHub</h1>
          <p className="text-gray-500 mt-1 text-sm">Exam-first student preparation</p>
        </div>

        <div className="card shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-6">Use email, student ID, or Google to jump back into your prep plans.</p>

          <GoogleSignInButton onCredential={handleGoogle} className="mb-4" />
          <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-gray-600">
            <div className="h-px flex-1 bg-surface-border" />
            or use email
            <div className="h-px flex-1 bg-surface-border" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email or Student ID</label>
              <input
                className="input-field"
                placeholder="you@example.com or CS2021001"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
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
                <button key={id} onClick={() => { setIdentifier(id); setPassword(pw); }}
                  className="text-left p-2 rounded bg-surface-hover hover:border-brand-600/50 border border-transparent transition-all">
                  <span className="text-brand-400">{id}</span>
                  <span className="text-gray-600"> / {pw}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-surface-border text-center">
            <p className="text-sm text-gray-400">
              New here?{" "}
              <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                Create an account 🚀
              </Link>
            </p>
          </div>
        </div>
        <p className="text-center text-gray-600 text-xs mt-6">Only CSE Department students are authorized.</p>
      </div>
    </div>
  );
}
