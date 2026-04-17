import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Mail, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function AuthChoicePage() {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async (credential) => {
    setLoading(true);
    setError("");
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
    <div className="min-h-screen bg-surface px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white">
          <ArrowLeft size={14} />
          Back to home
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[32px] border border-surface-border bg-surface-card p-8 md:p-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
              <Sparkles size={14} />
              Start Your Prep
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-tight text-white md:text-5xl">
              One login away from your exact exam plan.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-400">
              Continue with Google for the fastest setup, or use email if you want a regular account.
              Once you’re in, we’ll take you straight to plan creation.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-gray-400">
              <span className="rounded-full border border-surface-border bg-surface px-4 py-2">No dashboard clutter</span>
              <span className="rounded-full border border-surface-border bg-surface px-4 py-2">A2Z sheet in minutes</span>
              <span className="rounded-full border border-surface-border bg-surface px-4 py-2">Resume where you left off</span>
            </div>
          </section>

          <section className="rounded-[32px] border border-surface-border bg-surface-card p-8">
            <h2 className="text-2xl font-bold text-white">Get started</h2>
            <p className="mt-2 text-sm text-gray-400">Choose the fastest way to enter your exam-prep workspace.</p>

            <div className="mt-6 space-y-4">
              <GoogleSignInButton onCredential={handleGoogle} />

              <Link
                to="/login"
                className="flex items-center justify-between rounded-2xl border border-surface-border bg-surface-hover px-5 py-4 text-left transition-all hover:border-brand-500/40 hover:bg-brand-500/5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Continue with email</p>
                    <p className="text-sm text-gray-500">Sign in or create your account with email.</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-gray-500" />
              </Link>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {loading && (
              <div className="mt-4 rounded-2xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-200">
                Verifying your Google sign in...
              </div>
            )}

            <p className="mt-6 text-sm text-gray-500">
              New here? <Link to="/register" className="text-brand-300 hover:text-brand-200">Create an email account</Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
