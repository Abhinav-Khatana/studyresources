import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchApi, progressApi, voteApi, bookmarkApi, subjectsApi } from "../lib/api";
import ResourceCard from "../components/ResourceCard";
import { Search, Loader2, ExternalLink } from "lucide-react";

const TYPES       = ["", "notes", "videos", "articles", "pyqs"];
const TYPE_LABELS = { "": "All Types", notes: "Notes", videos: "Videos", articles: "Articles", pyqs: "PYQs" };

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query,       setQuery]       = useState(searchParams.get("q") || "");
  const [type,        setType]        = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [results,     setResults]     = useState([]);
  const [completed,   setCompleted]   = useState([]);
  const [myVotes,     setMyVotes]     = useState({});
  const [myBookmarks, setMyBookmarks] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [searched,    setSearched]    = useState(false);
  const [subjects,    setSubjects]    = useState([]);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    // Load subjects for filter bar + user data
    Promise.all([
      progressApi.me(),
      voteApi.myVotes(),
      bookmarkApi.list(),
      subjectsApi.list(),
    ]).then(([pRes, vRes, bRes, sRes]) => {
      setCompleted(pRes.data.completedResources || []);
      setMyVotes(vRes.data);
      setMyBookmarks(bRes.data.map((b) => b.id));
      setSubjects(sRes.data);
    });
  }, []);

  // Auto-search if q param in URL
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) { setQuery(q); doSearch(q, type, subjectFilter); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doSearch = async (q, t, s) => {
    if (!q || q.trim().length < 2) return;
    setLoading(true); setSearched(true);
    setSearchParams({ q });
    try {
      const res = await searchApi.search(q, t || undefined, s || undefined);
      setResults(res.data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); doSearch(query, type, subjectFilter); };

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Search size={22} className="text-brand-400" /> Search Resources
        </h1>
        <p className="text-gray-400 text-sm mt-1">Search across all subjects, videos, notes, articles and PYQs</p>
      </div>

      {/* Search form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              ref={inputRef}
              className="input-field pl-9"
              placeholder="Search for merge sort, SQL joins, Huffman coding..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Type filter */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide font-medium">Type</p>
            <div className="flex gap-1.5 flex-wrap">
              {TYPES.map((t) => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                    ${type === t
                      ? "bg-brand-600/20 text-brand-300 border-brand-600/30"
                      : "bg-surface border-surface-border text-gray-500 hover:border-gray-500 hover:text-gray-300"}`}>
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Subject filter — dynamic */}
          {subjects.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide font-medium">Subject</p>
              <div className="flex gap-1.5 flex-wrap">
                <button type="button" onClick={() => setSubjectFilter("")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                    ${subjectFilter === ""
                      ? "bg-brand-600/20 text-brand-300 border-brand-600/30"
                      : "bg-surface border-surface-border text-gray-500 hover:border-gray-500 hover:text-gray-300"}`}>
                  All
                </button>
                {subjects.map((s) => (
                  <button key={s.id} type="button" onClick={() => setSubjectFilter(s.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                      ${subjectFilter === s.id
                        ? "bg-brand-600/20 text-brand-300 border-brand-600/30"
                        : "bg-surface border-surface-border text-gray-500 hover:border-gray-500 hover:text-gray-300"}`}>
                    <span>{s.icon}</span>{s.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Search
          </button>
        </form>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-brand-400" size={28} />
        </div>
      )}

      {/* No results */}
      {!loading && searched && results.length === 0 && (
        <div className="card text-center py-12">
          <Search size={32} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No results found</p>
          <p className="text-gray-600 text-sm mt-1">Try different keywords or remove filters</p>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div>
          <p className="text-sm text-gray-400 mb-3">
            {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
            <span className="text-white font-medium">"{query}"</span>
          </p>
          <div className="flex flex-col gap-2">
            {results.map((resource) => (
              <div key={resource.id}>
                {/* Breadcrumb with link to subject */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1 px-1">
                  <span>{resource.subject_icon}</span>
                  <Link
                    to={`/subjects/${resource.subject_id}`}
                    className="hover:text-brand-400 transition-colors flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {resource.subject_name}
                    <ExternalLink size={10} />
                  </Link>
                  <span className="text-gray-600">·</span>
                  <span>Unit {resource.unit_number}: {resource.unit_title}</span>
                </div>
                <ResourceCard
                  resource={resource}
                  type={resource.type}
                  completed={completed.includes(resource.id)}
                  myVote={myVotes[resource.id] || null}
                  bookmarked={myBookmarks.includes(resource.id)}
                  onComplete={(id) =>
                    setCompleted((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state — not searched yet */}
      {!searched && !loading && (
        <div className="card text-center py-16 border-dashed">
          <Search size={36} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Start searching</p>
          <p className="text-gray-600 text-sm mt-1">Type at least 2 characters and hit Search</p>
        </div>
      )}
    </div>
  );
}
