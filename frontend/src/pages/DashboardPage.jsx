import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { plansApi } from "../lib/api";
import AnnouncementBanner from "../components/AnnouncementBanner";
import ExamCountdown from "../components/ExamCountdown";
import { ArrowRight, Clock3, Loader2, Plus, Sparkles, Target } from "lucide-react";

export default function DashboardPage() {
  const { student } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    plansApi.list()
      .then((res) => setPlans(res.data))
      .catch((err) => setError(err.response?.data?.error || "Could not load your plans."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-brand-400" />
      </div>
    );
  }

  const quickResume = plans[0];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <AnnouncementBanner />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-label">Dashboard</p>
          <h1 className="mt-2 text-3xl font-black text-white">Hi, {student?.name?.split(" ")[0]}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            This is your exam-prep home base. Start a new A2Z sheet, jump back into the next topic, or open one of your saved plans.
          </p>
        </div>
        <Link to="/create-plan" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-surface transition-all hover:opacity-90">
          <Plus size={16} />
          Create new plan
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {plans.length === 0 ? (
        <section className="rounded-[36px] border border-surface-border bg-gradient-to-br from-surface-card via-surface-card to-brand-500/10 px-8 py-10">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
              <Sparkles size={14} />
              Zero confusion start
            </div>
            <h2 className="text-3xl font-black text-white">You don’t need a roadmap. You need the right study order.</h2>
            <p className="mt-4 text-sm leading-7 text-gray-400">
              Paste your syllabus, tell us how much time is left, and get a structured sheet with topic priority, daily study order, video guidance, and revision focus.
            </p>
            <Link to="/create-plan" className="btn-primary mt-6 inline-flex items-center gap-2">
              Generate my first plan
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <article className="card">
              <p className="section-label">Quick Resume</p>
              <h2 className="mt-2 text-2xl font-bold text-white">{quickResume.title}</h2>
              <p className="mt-3 text-sm leading-6 text-gray-400">{quickResume.plan?.overview?.summary || ""}</p>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-3xl border border-surface-border bg-surface px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Next Topic</p>
                  <p className="mt-2 font-semibold text-white">{quickResume.summary.nextTopic?.title || "All caught up"}</p>
                  <p className="mt-1 text-sm text-gray-500">{quickResume.summary.nextTopic?.sectionTitle || "Use this time for revision."}</p>
                </div>
                <div className="rounded-3xl border border-surface-border bg-surface px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Revision Focus</p>
                  <p className="mt-2 font-semibold text-white">{quickResume.summary.revisionBlock?.title || "No pending revision"}</p>
                  <p className="mt-1 text-sm text-gray-500">{quickResume.summary.revisionBlock?.sectionTitle || "Everything finished right now."}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-3xl border border-surface-border bg-surface px-4 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Completion</p>
                  <p className="mt-2 text-2xl font-black text-white">{quickResume.summary.completionPercent}%</p>
                </div>
                <Link to={`/plans/${quickResume.id}`} className="btn-primary inline-flex items-center gap-2">
                  Resume plan
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>

            <div className="space-y-4">
              <article className="card">
                <p className="section-label">Progress Snapshot</p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-3xl border border-surface-border bg-surface px-4 py-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm text-gray-400">Current completion</span>
                      <span className="text-sm font-semibold text-white">{quickResume.summary.completionPercent}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-surface-border">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-700 via-brand-500 to-accent-400" style={{ width: `${quickResume.summary.completionPercent}%` }} />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl border border-surface-border bg-surface px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Done</p>
                      <p className="mt-2 text-2xl font-bold text-white">{quickResume.summary.counts?.done || 0}</p>
                    </div>
                    <div className="rounded-3xl border border-surface-border bg-surface px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Revise Again</p>
                      <p className="mt-2 text-2xl font-bold text-white">{quickResume.summary.counts?.revise_again || 0}</p>
                    </div>
                  </div>
                </div>
              </article>

              <ExamCountdown />
            </div>
          </section>

          <section className="card">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="section-label">Your Previous Plans</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Open any saved prep sheet</h2>
              </div>
              <Link to="/plans" className="text-sm font-medium text-brand-300 hover:text-brand-200">
                View all
              </Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {plans.slice(0, 3).map((plan) => (
                <Link key={plan.id} to={`/plans/${plan.id}`} className="rounded-[28px] border border-surface-border bg-surface px-4 py-4 transition-all hover:border-brand-500/30 hover:bg-brand-500/5">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">{plan.generationSource === "ai" ? "AI" : "Fallback"}</p>
                  <h3 className="mt-2 text-lg font-bold text-white">{plan.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{plan.plan?.overview?.summary || ""}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span className="inline-flex items-center gap-2">
                      <Clock3 size={14} />
                      {plan.summary.completionPercent}%
                    </span>
                    <span className="inline-flex items-center gap-2 text-brand-300">
                      Open
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <Link to="/create-plan" className="card-hover">
          <p className="section-label">Create New Plan</p>
          <h3 className="mt-3 text-xl font-bold text-white">Start from a fresh syllabus</h3>
          <p className="mt-2 text-sm leading-6 text-gray-400">Use the guided flow for a new exam, a new subject, or a sharper timeline.</p>
        </Link>
        <Link to="/exam-mode" className="card-hover">
          <p className="section-label">Premium Preview</p>
          <h3 className="mt-3 text-xl font-bold text-white">See what Exam Mode unlocks</h3>
          <p className="mt-2 text-sm leading-6 text-gray-400">Explore the future score-maximizing layer without mixing it into the free plan flow.</p>
        </Link>
      </section>
    </div>
  );
}
