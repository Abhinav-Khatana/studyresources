import React, { useState, useEffect } from "react";
import { bookmarkApi, progressApi, voteApi } from "../lib/api";
import ResourceCard from "../components/ResourceCard";
import { Bookmark, Loader2, BookOpen } from "lucide-react";

export default function BookmarksPage() {
  const [bookmarks,  setBookmarks]  = useState([]);
  const [completed,  setCompleted]  = useState([]);
  const [myVotes,    setMyVotes]    = useState({});
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([bookmarkApi.list(), progressApi.me(), voteApi.myVotes()])
      .then(([bRes, pRes, vRes]) => {
        setBookmarks(bRes.data);
        setCompleted(pRes.data.completedResources || []);
        setMyVotes(vRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = (resourceId) => {
    setBookmarks(prev => prev.filter(b => b.id !== resourceId));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-brand-400" size={28}/></div>;

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bookmark size={22} className="text-brand-400"/> Bookmarks
        </h1>
        <p className="text-gray-400 text-sm mt-1">{bookmarks.length} saved resource{bookmarks.length !== 1 ? "s" : ""}</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="card text-center py-16">
          <Bookmark size={32} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No bookmarks yet</p>
          <p className="text-gray-600 text-sm mt-1">Click the bookmark icon on any resource to save it here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {bookmarks.map(resource => (
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
                bookmarked={true}
                onComplete={(id) => setCompleted(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id])}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
