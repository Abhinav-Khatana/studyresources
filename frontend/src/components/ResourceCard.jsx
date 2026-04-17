import React, { useState } from "react";
import { FileText, Youtube, Globe, ClipboardList, CheckCircle, ExternalLink, Clock, Bookmark, ThumbsUp, ThumbsDown } from "lucide-react";
import { progressApi, voteApi, bookmarkApi } from "../lib/api";

const TYPE_CONFIG = {
  notes:    { icon: FileText,      color: "text-blue-400",  bg: "bg-blue-500/10"  },
  videos:   { icon: Youtube,       color: "text-red-400",   bg: "bg-red-500/10"   },
  articles: { icon: Globe,         color: "text-green-400", bg: "bg-green-500/10" },
  pyqs:     { icon: ClipboardList, color: "text-amber-400", bg: "bg-amber-500/10" },
};

export default function ResourceCard({
  resource,
  type,
  completed,
  onComplete,
  onBookmarkChange,
  myVote: initialVote,
  bookmarked: initialBookmarked,
}) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.notes;
  const Icon = cfg.icon;
  const isLink = resource.url && resource.url !== "#";

  const [voteScore,  setVoteScore]  = useState(resource.vote_score || 0);
  const [upvotes,    setUpvotes]    = useState(resource.upvotes || 0);
  const [downvotes,  setDownvotes]  = useState(resource.downvotes || 0);
  const [myVote,     setMyVote]     = useState(initialVote || null);
  const [bookmarked, setBookmarked] = useState(initialBookmarked || false);
  const [isDone,     setIsDone]     = useState(completed);

  const handleComplete = async (e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      if (isDone) {
        await progressApi.uncomplete(resource.id);
        setIsDone(false);
      } else {
        await progressApi.complete(resource.id);
        setIsDone(true);
      }
      onComplete?.(resource.id, !isDone);
    } catch {}
  };

  const handleVote = async (e, vote) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const res = await voteApi.cast(resource.id, vote);
      setVoteScore(res.data.score);
      setUpvotes(res.data.upvotes);
      setDownvotes(res.data.downvotes);
      setMyVote(res.data.myVote);
    } catch {}
  };

  const handleBookmark = async (e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      if (bookmarked) {
        await bookmarkApi.remove(resource.id);
        setBookmarked(false);
        onBookmarkChange?.(resource.id, false);
      } else {
        await bookmarkApi.add(resource.id);
        setBookmarked(true);
        onBookmarkChange?.(resource.id, true);
      }
    } catch {}
  };

  const Inner = () => (
    <div className={`card flex items-start gap-3 group transition-all hover:border-surface-hover ${isDone ? "opacity-60" : ""}`}>
      <div className={`p-2 rounded-lg ${cfg.bg} shrink-0`}>
        <Icon size={16} className={cfg.color} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium leading-snug ${isDone ? "line-through text-gray-500" : "text-white"}`}>
            {resource.title}
          </p>
          {isLink && <ExternalLink size={13} className="text-gray-600 group-hover:text-brand-400 shrink-0 transition-colors" />}
        </div>

        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
          {resource.uploaded_by  && <span>by {resource.uploaded_by}</span>}
          {resource.uploadedBy   && <span>by {resource.uploadedBy}</span>}
          {resource.channel      && <span>{resource.channel}</span>}
          {(resource.duration)   && <span className="flex items-center gap-1"><Clock size={11}/>{resource.duration}</span>}
          {(resource.read_time || resource.readTime) && <span className="flex items-center gap-1"><Clock size={11}/>{resource.read_time || resource.readTime} read</span>}
          {(resource.file_size || resource.fileSize) && <span>{resource.file_size || resource.fileSize}</span>}
          {resource.year         && <span className="badge bg-amber-500/10 text-amber-400">{resource.year}</span>}
        </div>

        {/* Vote bar */}
        <div className="flex items-center gap-2 mt-2">
          <button onClick={(e) => handleVote(e, 1)}
            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md transition-all
              ${myVote === 1 ? "bg-green-500/20 text-green-400" : "text-gray-600 hover:text-green-400 hover:bg-green-500/10"}`}>
            <ThumbsUp size={11} /> {upvotes}
          </button>
          <button onClick={(e) => handleVote(e, -1)}
            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md transition-all
              ${myVote === -1 ? "bg-red-500/20 text-red-400" : "text-gray-600 hover:text-red-400 hover:bg-red-500/10"}`}>
            <ThumbsDown size={11} /> {downvotes}
          </button>
          {voteScore !== 0 && (
            <span className={`text-xs font-medium ${voteScore > 0 ? "text-green-400" : "text-red-400"}`}>
              {voteScore > 0 ? "+" : ""}{voteScore}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-1.5 shrink-0">
        <button onClick={handleBookmark} title={bookmarked ? "Remove bookmark" : "Bookmark"}
          className={`p-1 rounded-full transition-all ${bookmarked ? "text-brand-400" : "text-gray-600 hover:text-brand-400 hover:bg-brand-500/10"}`}>
          <Bookmark size={15} fill={bookmarked ? "currentColor" : "none"} />
        </button>
        <button onClick={handleComplete} title={isDone ? "Mark incomplete" : "Mark done"}
          className={`p-1 rounded-full transition-all ${isDone ? "text-green-400" : "text-gray-600 hover:text-green-400 hover:bg-green-500/10"}`}>
          <CheckCircle size={15} />
        </button>
      </div>
    </div>
  );

  return isLink
    ? <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block"><Inner /></a>
    : <div className="cursor-default"><Inner /></div>;
}
