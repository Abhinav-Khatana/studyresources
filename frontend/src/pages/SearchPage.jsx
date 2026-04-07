import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { searchApi, progressApi, voteApi, bookmarkApi } from "../lib/api";
import ResourceCard from "../components/ResourceCard";
import { Search, Loader2, SlidersHorizontal } from "lucide-react";

const TYPES    = ["", "notes", "videos", "articles", "pyqs"];
const SUBJECTS = ["", "daa", "dbms", "os", "cn", "toc"];
const TYPE_LABELS    = { "": "All Types", notes: "Notes", videos: "Videos", articles: "Articles", pyqs: "PYQs" };
const SUBJECT_LABELS = { "": "All Subjects", daa: "DAA", dbms: "DBMS", os: "OS", cn: "CN", toc: "TOC" };

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query,     setQuery]     = useState(searchParams.get("q") || "");
  const [type,      setType]      = useState("");
  const [subject,   setSubject]   = useState("");
  const [results,   setResults]   = useState([]);
  const [completed, setCompleted] = useState([]);
  const [myVotes,   setMyVotes]   = useState({});
  const [myBookmarks,setMyBookmarks] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [searched,  setSearched]  = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    Promise.all([progressApi.me(), voteApi.myVotes(), bookmarkApi.list()])
      .then(([pRes, vRes, bRes]) => {
        setCompleted(pRes.data.completedResources || []);
        setMyVotes(vRes.data);
        setMyBookmarks(bRes.data.map(b => b.id));
      });
  }, []);

  // Auto-search if q param in URL
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) { setQuery(q); doSearch(q, type, subject); }
  }, []);

  const doSearch = async (q, t, s) => {
    if (!q || q.trim().length < 2) return;
    setLoading(true); setSearched(true);
    setSearchParams({ q });
    try {
      const res = await searchApi.search(q, t || undefined, s || undefined);
      setResults(res.data.results);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); doSearch(query, type, subject); };

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Search size={22} className="text-brand-400"/> Search Resources
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
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* Type filter */}
            <div className="flex gap-1 bg-surface rounded-lg p-1 flex-wrap">
              {TYPES.map(t => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all
                    ${type === t ? "bg-brand-600/20 text-brand-300 border border-brand-600/30" : "text-gray-500 hover:text-gray-300"}`}>
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            {/* Subject filter */}
            <div className="flex gap-1 bg-surface rounded-lg p-1 flex-wrap">
              {SUBJECTS.map(s => (
                <button key={s} type="button" onClick={() => setSubject(s)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all
                    ${subject === s ? "bg-brand-600/20 text-brand-300 border border-brand-600/30" : "text-gray-500 hover:text-gray-300"}`}>
                  {SUBJECT_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin"/> : <Search size={16}/>} Search
          </button>
        </form>
      </div>

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-brand-400" size={28}/></div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="card text-center py-12">
          <Search size={32} className="text-gray-600 mx-auto mb-3"/>
          <p className="text-gray-400 font-medium">No results found</p>
          <p className="text-gray-600 text-sm mt-1">Try different keywords or remove filters</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <p className="text-sm text-gray-400 mb-3">{results.length} result{results.length !== 1 ? "s" : ""} for <span className="text-white font-medium">"{query}"</span></p>
          <div className="flex flex-col gap-2">
            {results.map(resource => (
              <div key={resource.id}>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                  <span>{resource.subject_icon}</span>
                  <span>{resource.subject_name}</span>
                  <span className="text-gray-600">·</span>
                  <span>Unit {resource.unit_number}: {resource.unit_title}</span>
                </p>
                <ResourceCard
                  resource={resource}
                  type={resource.type}
                  completed={completed.includes(resource.id)}
                  myVote={myVotes[resource.id] || null}
                  bookmarked={myBookmarks.includes(resource.id)}
                  onComplete={(id) => setCompleted(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id])}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
