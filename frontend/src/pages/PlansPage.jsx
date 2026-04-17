import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3, Loader2, Plus, Trash2 } from "lucide-react";
import { plansApi } from "../lib/api";

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    plansApi.list()
      .then((res) => setPlans(res.data))
      .catch((err) => setError(err.response?.data?.error || "Could not load your prep plans."))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this prep plan?")) return;
    try {
      await plansApi.delete(id);
      setPlans((current) => current.filter((plan) => plan.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete that plan.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-label">Plans</p>
          <h1 className="mt-2 text-3xl font-black text-white">Your prep plans</h1>
          <p className="mt-2 text-sm text-gray-400">Everything you’ve generated, with quick resume data baked in.</p>
        </div>
        <Link to="/create-plan" className="btn-primary inline-flex items-center gap-2">
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
        <div className="card flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-2xl font-bold text-white">No prep plans yet</p>
          <p className="max-w-xl text-sm leading-6 text-gray-400">
            Create your first A2Z plan and it will show up here with progress, next topic, and revision reminders.
          </p>
          <Link to="/create-plan" className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} />
            Create your first plan
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {plans.map((plan) => (
            <article key={plan.id} className="card flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-300">{plan.generationSource === "ai" ? "AI plan" : "Fallback plan"}</p>
                  <h2 className="mt-2 text-xl font-bold text-white">{plan.title}</h2>
                  <p className="mt-2 text-sm text-gray-400">{plan.plan.overview.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(plan.id)}
                  className="rounded-full border border-surface-border p-2 text-gray-500 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="rounded-3xl border border-surface-border bg-surface px-4 py-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-gray-400">Completion</span>
                  <span className="font-semibold text-white">{plan.summary.completionPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-border">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-700 via-brand-500 to-accent-400" style={{ width: `${plan.summary.completionPercent}%` }} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-surface-border bg-surface px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Quick Resume</p>
                  <p className="mt-2 font-semibold text-white">{plan.summary.nextTopic?.title || "Everything finished"}</p>
                  <p className="mt-1 text-sm text-gray-500">{plan.summary.nextTopic?.sectionTitle || "No pending topics right now."}</p>
                </div>
                <div className="rounded-2xl border border-surface-border bg-surface px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Revision Focus</p>
                  <p className="mt-2 font-semibold text-white">{plan.summary.revisionBlock?.title || "No revision block pending"}</p>
                  <p className="mt-1 text-sm text-gray-500">{plan.summary.revisionBlock?.sectionTitle || "You’re caught up."}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="inline-flex items-center gap-2">
                  <Clock3 size={14} />
                  {new Date(plan.updatedAt || plan.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <Link to={`/plans/${plan.id}`} className="inline-flex items-center gap-2 font-medium text-brand-300 hover:text-brand-200">
                  Open plan
                  <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
