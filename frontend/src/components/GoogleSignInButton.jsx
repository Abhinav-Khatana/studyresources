import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

const GOOGLE_SCRIPT_ID = "studyhub-google-gsi";

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }

    const existing = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google), { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export default function GoogleSignInButton({ onCredential, className = "" }) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const clientId = useMemo(() => import.meta.env.VITE_GOOGLE_CLIENT_ID || "", []);

  useEffect(() => {
    let mounted = true;

    if (!clientId) {
      setStatus("missing");
      return undefined;
    }

    setStatus("loading");
    loadGoogleScript()
      .then((google) => {
        if (!mounted || !google?.accounts?.id || !containerRef.current) return;

        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential) onCredential?.(response.credential);
          },
        });

        containerRef.current.innerHTML = "";
        google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          width: 320,
          text: "continue_with",
        });

        setStatus("ready");
      })
      .catch(() => mounted && setStatus("error"));

    return () => {
      mounted = false;
    };
  }, [clientId, onCredential]);

  if (status === "missing") {
    return (
      <div className={`rounded-2xl border border-surface-border bg-surface-hover px-4 py-3 text-sm text-gray-500 ${className}`}>
        Google sign in will appear here after VITE_GOOGLE_CLIENT_ID is configured.
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className={`flex items-center justify-center gap-2 rounded-2xl border border-surface-border bg-surface-hover px-4 py-3 text-sm text-gray-400 ${className}`}>
        <Loader2 size={16} className="animate-spin" />
        Loading Google sign in...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={`rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 ${className}`}>
        Google sign in could not load right now. Try email instead.
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}
