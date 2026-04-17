import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock3, Loader2, Sparkles, Target, Upload } from "lucide-react";
import { plansApi } from "../lib/api";

const STEP_TITLES = [
  "Paste your syllabus",
  "Set your study constraints",
  "Generate your A2Z sheet",
];

const DEFAULT_FORM = {
  syllabusText: "",
  daysLeft: 4,
  hoursPerDay: 3,
  familiarity: "intermediate",
  effortLevel: "medium",
  goal: "score_high",
};

export default function CreatePlanPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const progress = useMemo(() => ((step + 1) / STEP_TITLES.length) * 100, [step]);

  const next = () => {
    if (step === 0 && form.syllabusText.trim().length < 10) {
      setError("Paste enough syllabus text so the plan can be meaningful.");
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, STEP_TITLES.length - 1));
  };

  const back = () => {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await plansApi.generate(form);
      navigate(`/plans/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "We couldn’t generate your plan right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-label">Create Plan</p>
          <h1 className="mt-2 text-3xl font-black text-white">Build your A2Z prep sheet</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            One guided flow. No duplicate planners. No guesswork. Just tell us what’s in your syllabus and how much time you have.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="border-b border-surface-border px-6 py-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-300">Step {step + 1} of {STEP_TITLES.length}</p>
              <h2 className="mt-1 text-xl font-bold text-white">{STEP_TITLES[step]}</h2>
            </div>
            <div className="rounded-full border border-brand-500/25 bg-brand-500/10 px-4 py-2 text-xs text-brand-200">
              {Math.round(progress)}% complete
            </div>
          </div>
          <div className="h-2 rounded-full bg-surface">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-700 via-brand-500 to-accent-400" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="px-6 py-6">
          {step === 0 && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-dashed border-surface-border bg-surface px-5 py-4">
                <div className="mb-3 flex items-center gap-3 text-sm text-gray-400">
                  <Upload size={16} className="text-brand-400" />
                  PDF upload is not in this version yet. Paste the syllabus text for now.
                </div>
                <textarea
                  value={form.syllabusText}
                  onChange={(e) => setForm((current) => ({ ...current, syllabusText: e.target.value }))}
                  rows={14}
                  className="w-full resize-none rounded-2xl border border-surface-border bg-surface-card px-4 py-4 font-mono text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder={`Example:

Unit 1: Laplace transform, inverse Laplace transform, applications
Unit 2: Fourier series, half range expansions
Unit 3: PDE basics, heat equation, wave equation`}
                />
              </div>

              <div className="rounded-3xl border border-surface-border bg-surface px-5 py-4 text-sm text-gray-400">
                Tip: paste exactly what your university gave you. The more specific the topic list, the better the priority order.
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-5 md:grid-cols-2">
              <label className="card-hover">
                <span className="section-label">Time Left</span>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">{form.daysLeft} days</p>
                    <p className="text-sm text-gray-500">How long until the exam?</p>
                  </div>
                  <Clock3 size={18} className="text-brand-400" />
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={form.daysLeft}
                  onChange={(e) => setForm((current) => ({ ...current, daysLeft: Number(e.target.value) }))}
                  className="mt-4 w-full accent-brand-500"
                />
              </label>

              <label className="card-hover">
                <span className="section-label">Daily Hours</span>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">{form.hoursPerDay} hours/day</p>
                    <p className="text-sm text-gray-500">How much focused time can you give?</p>
                  </div>
                  <Target size={18} className="text-amber-400" />
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={form.hoursPerDay}
                  onChange={(e) => setForm((current) => ({ ...current, hoursPerDay: Number(e.target.value) }))}
                  className="mt-4 w-full accent-brand-500"
                />
              </label>

              <div className="card-hover">
                <span className="section-label">Subject Familiarity</span>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    ["beginner", "Beginner"],
                    ["intermediate", "Intermediate"],
                    ["strong", "Strong"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, familiarity: value }))}
                      className={`rounded-full border px-4 py-2 text-sm transition-all ${
                        form.familiarity === value
                          ? "border-brand-500/40 bg-brand-500/10 text-brand-200"
                          : "border-surface-border bg-surface text-gray-400 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card-hover">
                <span className="section-label">Effort Level</span>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    ["low", "Low"],
                    ["medium", "Medium"],
                    ["high", "High"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, effortLevel: value }))}
                      className={`rounded-full border px-4 py-2 text-sm transition-all ${
                        form.effortLevel === value
                          ? "border-brand-500/40 bg-brand-500/10 text-brand-200"
                          : "border-surface-border bg-surface text-gray-400 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card-hover md:col-span-2">
                <span className="section-label">Goal</span>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {[
                    ["pass_exam", "Pass exam", "Prioritize must-do topics and safe marks first."],
                    ["score_high", "Score high marks", "Front-load scoring topics and stronger revision coverage."],
                  ].map(([value, label, description]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, goal: value }))}
                      className={`rounded-3xl border p-4 text-left transition-all ${
                        form.goal === value
                          ? "border-brand-500/40 bg-brand-500/10"
                          : "border-surface-border bg-surface hover:border-brand-500/25"
                      }`}
                    >
                      <p className="font-semibold text-white">{label}</p>
                      <p className="mt-1 text-sm text-gray-400">{description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
              <div className="rounded-[28px] border border-surface-border bg-surface px-5 py-5">
                <p className="section-label">Plan Snapshot</p>
                <div className="mt-4 space-y-3 text-sm text-gray-300">
                  <div className="flex justify-between gap-4"><span>Days left</span><span>{form.daysLeft}</span></div>
                  <div className="flex justify-between gap-4"><span>Daily hours</span><span>{form.hoursPerDay}</span></div>
                  <div className="flex justify-between gap-4"><span>Familiarity</span><span className="capitalize">{form.familiarity}</span></div>
                  <div className="flex justify-between gap-4"><span>Effort</span><span className="capitalize">{form.effortLevel}</span></div>
                  <div className="flex justify-between gap-4"><span>Goal</span><span>{form.goal === "score_high" ? "Score high marks" : "Pass exam"}</span></div>
                </div>
                <div className="mt-5 rounded-3xl border border-brand-500/20 bg-brand-500/10 px-4 py-4 text-sm text-brand-100">
                  The generated sheet will include topic priority, daily study order, revision cadence, quick notes guidance, and video search recommendations.
                </div>
              </div>

              <div className="rounded-[28px] border border-surface-border bg-surface-card px-5 py-5">
                <p className="section-label">Ready To Generate</p>
                <h3 className="mt-3 text-2xl font-bold text-white">Turn panic into a plan.</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  We’ll save the plan immediately after generation so it shows up in your dashboard and plans list.
                </p>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-700 via-brand-500 to-accent-500 px-5 py-4 font-semibold text-white transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  {loading ? "Generating your plan..." : "Generate A2Z prep sheet"}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-surface-border px-6 py-5">
          <button
            type="button"
            onClick={back}
            disabled={step === 0 || loading}
            className="inline-flex items-center gap-2 rounded-full border border-surface-border px-4 py-2 text-sm text-gray-400 transition-all hover:text-white disabled:opacity-40"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          {step < STEP_TITLES.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-surface transition-all hover:opacity-90"
            >
              Continue
              <ArrowRight size={14} />
            </button>
          ) : (
            <span className="text-sm text-gray-500">Generation saves the plan automatically.</span>
          )}
        </div>
      </div>
    </div>
  );
}
