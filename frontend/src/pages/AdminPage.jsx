import React, { useState, useEffect } from "react";
import { adminApi, announcementApi, examApi, subjectsApi } from "../lib/api";
import { Shield, Plus, Trash2, Loader2, Save, X, ChevronDown } from "lucide-react";

// ── Small sub-components ──────────────────────────────────────────────────────
function Section({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="card">
      <button onClick={() => setOpen(o=>!o)} className="flex items-center justify-between w-full mb-0">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <ChevronDown size={16} className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}/>
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

// ── Main AdminPage ────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [units,         setUnits]         = useState([]);
  const [subjects,      setSubjects]      = useState([]);
  const [resources,     setResources]     = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [exams,         setExams]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [msg,           setMsg]           = useState("");

  // ── Add resource form ──
  const [resForm, setResForm] = useState({ unitId:"", type:"notes", title:"", url:"", uploadedBy:"", channel:"", duration:"", readTime:"", year:"", fileSize:"" });
  // ── Add announcement form ──
  const [annForm, setAnnForm] = useState({ title:"", content:"", expiresAt:"" });
  // ── Add exam form ──
  const [examForm, setExamForm] = useState({ subjectId:"", examDate:"", academicYear:"", notes:"" });

  useEffect(() => {
    Promise.all([adminApi.getUnits(), adminApi.getResources(), announcementApi.list(), examApi.list(), subjectsApi.list()])
      .then(([uRes, rRes, aRes, eRes, sRes]) => {
        setUnits(uRes.data);
        setResources(rRes.data);
        setAnnouncements(aRes.data);
        setExams(eRes.data);
        setSubjects(sRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(""), 3000); };

  // ── Resource handlers ──
  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!resForm.unitId || !resForm.title) return;
    setSaving(true);
    try {
      const res = await adminApi.addResource(resForm);
      setResources(prev => [...prev, res.data]);
      setResForm({ unitId:"", type:"notes", title:"", url:"", uploadedBy:"", channel:"", duration:"", readTime:"", year:"", fileSize:"" });
      flash("✓ Resource added!");
    } catch (err) { flash("Error: " + err.response?.data?.error); }
    finally { setSaving(false); }
  };

  const handleDeleteResource = async (id) => {
    if (!confirm("Delete this resource?")) return;
    try {
      await adminApi.deleteResource(id);
      setResources(prev => prev.filter(r => r.id !== id));
      flash("✓ Resource deleted");
    } catch {}
  };

  // ── Announcement handlers ──
  const handleAddAnn = async (e) => {
    e.preventDefault();
    if (!annForm.title) return;
    setSaving(true);
    try {
      const res = await announcementApi.create(annForm);
      setAnnouncements(prev => [res.data, ...prev]);
      setAnnForm({ title:"", content:"", expiresAt:"" });
      flash("✓ Announcement posted!");
    } catch (err) { flash("Error: " + err.response?.data?.error); }
    finally { setSaving(false); }
  };

  const handleDeleteAnn = async (id) => {
    try {
      await announcementApi.delete(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      flash("✓ Announcement deleted");
    } catch {}
  };

  // ── Exam handlers ──
  const handleAddExam = async (e) => {
    e.preventDefault();
    if (!examForm.subjectId || !examForm.examDate) return;
    setSaving(true);
    try {
      const res = await examApi.create(examForm);
      setExams(prev => [...prev, res.data]);
      setExamForm({ subjectId:"", examDate:"", academicYear:"", notes:"" });
      flash("✓ Exam date added!");
    } catch (err) { flash("Error: " + err.response?.data?.error); }
    finally { setSaving(false); }
  };

  const handleDeleteExam = async (id) => {
    try {
      await examApi.delete(id);
      setExams(prev => prev.filter(e => e.id !== id));
      flash("✓ Exam date deleted");
    } catch {}
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-brand-400" size={28}/></div>;

  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield size={22} className="text-brand-400"/> Admin Panel
        </h1>
        <p className="text-gray-400 text-sm mt-1">Manage resources, announcements and exam dates</p>
      </div>

      {msg && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-2 rounded-lg">{msg}</div>}

      {/* ── Add Resource ─────────────────────────────────────── */}
      <Section title="➕ Add Resource">
        <form onSubmit={handleAddResource} className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Unit *</label>
            <select className="input-field bg-surface text-sm" value={resForm.unitId} onChange={e => setResForm({...resForm, unitId: e.target.value})} required>
              <option value="">Select unit...</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.subject_name} · U{u.unit_number}: {u.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Type *</label>
            <select className="input-field bg-surface text-sm" value={resForm.type} onChange={e => setResForm({...resForm, type: e.target.value})}>
              <option value="notes">Notes</option>
              <option value="videos">Video</option>
              <option value="articles">Article</option>
              <option value="pyqs">PYQ</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">Title *</label>
            <input className="input-field bg-surface text-sm" placeholder="Resource title" value={resForm.title} onChange={e => setResForm({...resForm, title: e.target.value})} required/>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">URL</label>
            <input className="input-field bg-surface text-sm" placeholder="https://... or leave blank" value={resForm.url} onChange={e => setResForm({...resForm, url: e.target.value})}/>
          </div>
          {/* Conditional fields */}
          {(resForm.type === "notes" || resForm.type === "pyqs") && (
            <>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Uploaded By</label>
                <input className="input-field bg-surface text-sm" placeholder="Prof. Name" value={resForm.uploadedBy} onChange={e => setResForm({...resForm, uploadedBy: e.target.value})}/>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">{resForm.type === "pyqs" ? "Year" : "File Size"}</label>
                <input className="input-field bg-surface text-sm" placeholder={resForm.type === "pyqs" ? "2023" : "2.4 MB"} value={resForm.type === "pyqs" ? resForm.year : resForm.fileSize}
                  onChange={e => setResForm({...resForm, [resForm.type === "pyqs" ? "year" : "fileSize"]: e.target.value})}/>
              </div>
            </>
          )}
          {resForm.type === "videos" && (
            <>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Channel</label>
                <input className="input-field bg-surface text-sm" placeholder="Abdul Bari" value={resForm.channel} onChange={e => setResForm({...resForm, channel: e.target.value})}/>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Duration</label>
                <input className="input-field bg-surface text-sm" placeholder="14:55" value={resForm.duration} onChange={e => setResForm({...resForm, duration: e.target.value})}/>
              </div>
            </>
          )}
          {resForm.type === "articles" && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Read Time</label>
              <input className="input-field bg-surface text-sm" placeholder="12 min" value={resForm.readTime} onChange={e => setResForm({...resForm, readTime: e.target.value})}/>
            </div>
          )}
          <button type="submit" disabled={saving} className="btn-primary sm:col-span-2 flex items-center justify-center gap-2 text-sm">
            {saving ? <Loader2 size={14} className="animate-spin"/> : <Plus size={14}/>} Add Resource
          </button>
        </form>
      </Section>

      {/* ── Manage Resources ─────────────────────────────────── */}
      <Section title={`📋 All Resources (${resources.length})`}>
        <div className="flex flex-col gap-1 max-h-80 overflow-y-auto">
          {resources.map(r => (
            <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-hover group">
              <span className={`badge text-[10px] shrink-0 ${
                r.type==="notes"?"bg-blue-500/20 text-blue-400":r.type==="videos"?"bg-red-500/20 text-red-400":r.type==="articles"?"bg-green-500/20 text-green-400":"bg-amber-500/20 text-amber-400"
              }`}>{r.type}</span>
              <span className="text-xs text-gray-300 flex-1 truncate">{r.title}</span>
              <span className="text-[10px] text-gray-600 shrink-0 hidden sm:block">{r.subject_name} U{r.unit_number}</span>
              <button onClick={() => handleDeleteResource(r.id)}
                className="p-1 text-gray-600 hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                <Trash2 size={13}/>
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Announcements ─────────────────────────────────────── */}
      <Section title="📢 Announcements">
        <form onSubmit={handleAddAnn} className="flex flex-col gap-3 mb-4">
          <input className="input-field bg-surface text-sm" placeholder="Announcement title *" value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} required/>
          <textarea className="input-field bg-surface text-sm resize-none h-20" placeholder="Message (optional)" value={annForm.content} onChange={e => setAnnForm({...annForm, content: e.target.value})}/>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Expires at (optional)</label>
            <input type="datetime-local" className="input-field bg-surface text-sm" value={annForm.expiresAt} onChange={e => setAnnForm({...annForm, expiresAt: e.target.value})}/>
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center justify-center gap-2 text-sm">
            {saving ? <Loader2 size={14} className="animate-spin"/> : <Plus size={14}/>} Post Announcement
          </button>
        </form>
        <div className="flex flex-col gap-2">
          {announcements.map(a => (
            <div key={a.id} className="flex items-start gap-2 p-2 rounded-lg bg-surface group">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">{a.title}</p>
                {a.content && <p className="text-xs text-gray-500 mt-0.5">{a.content}</p>}
              </div>
              <button onClick={() => handleDeleteAnn(a.id)} className="p-1 text-gray-600 hover:text-red-400 transition-colors shrink-0">
                <Trash2 size={13}/>
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Exam Dates ────────────────────────────────────────── */}
      <Section title="📅 Exam Dates">
        <form onSubmit={handleAddExam} className="grid gap-3 sm:grid-cols-2 mb-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Subject *</label>
            <select className="input-field bg-surface text-sm" value={examForm.subjectId} onChange={e => setExamForm({...examForm, subjectId: e.target.value})} required>
              <option value="">Select subject...</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Exam Date *</label>
            <input type="date" className="input-field bg-surface text-sm" value={examForm.examDate} onChange={e => setExamForm({...examForm, examDate: e.target.value})} required/>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Academic Year</label>
            <input className="input-field bg-surface text-sm" placeholder="2024-25" value={examForm.academicYear} onChange={e => setExamForm({...examForm, academicYear: e.target.value})}/>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Notes</label>
            <input className="input-field bg-surface text-sm" placeholder="Slot A, 10AM" value={examForm.notes} onChange={e => setExamForm({...examForm, notes: e.target.value})}/>
          </div>
          <button type="submit" disabled={saving} className="btn-primary sm:col-span-2 flex items-center justify-center gap-2 text-sm">
            {saving ? <Loader2 size={14} className="animate-spin"/> : <Plus size={14}/>} Add Exam Date
          </button>
        </form>
        <div className="flex flex-col gap-2">
          {exams.map(e => (
            <div key={e.id} className="flex items-center gap-3 p-2 rounded-lg bg-surface group">
              <span>{e.subject_icon || "📅"}</span>
              <div className="flex-1">
                <p className="text-sm text-white">{e.subject_name}</p>
                <p className="text-xs text-gray-500">{new Date(e.exam_date).toLocaleDateString()} {e.notes ? `· ${e.notes}` : ""}</p>
              </div>
              <span className="text-xs text-gray-500">{e.days_left}d left</span>
              <button onClick={() => handleDeleteExam(e.id)} className="p-1 text-gray-600 hover:text-red-400 transition-colors">
                <Trash2 size={13}/>
              </button>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
