import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bookmarkApi, progressApi, voteApi } from "../lib/api";
import ResourceCard from "../components/ResourceCard";
import { Bookmark, Loader2, ExternalLink } from "lucide-react";

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

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-brand-400" size={28}/></div>;

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bookmark size={22} className="text-brand-400"/> Bookmarks
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {bookmarks.length} saved resource{bookmarks.length !== 1 ? "s" : ""}
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="card text-center py-16">
          <Bookmark size={32} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No bookmarks yet</p>
          <p className="text-gray-600 text-sm mt-1">Click the bookmark icon on any resource to save it here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bookmarks.map((resource) => (
            <div key={resource.id}>
              {/* Breadcrumb with link to subject */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1 px-1">
                <span>{resource.subject_icon}</span>
                <Link
                  to={`/subjects/${resource.subject_id}`}
                  className="hover:text-brand-400 transition-colors flex items-center gap-1"
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
                bookmarked={true}
                onBookmarkChange={(id, nextBookmarked) => {
                  if (!nextBookmarked) {
                    setBookmarks((current) => current.filter((item) => item.id !== id));
                  }
                }}
                onComplete={(id) =>
                  setCompleted((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
