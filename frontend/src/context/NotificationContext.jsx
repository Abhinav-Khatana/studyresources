import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import api from "../lib/api";

const NotificationContext = createContext(null);

// Convert VAPID public key to Uint8Array for push subscription
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw     = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [open,          setOpen]          = useState(false);
  const pollRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      setUnreadCount(res.data.count);
    } catch {}
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
      const unread = res.data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch {}
  }, []);

  const markRead = useCallback(async (id) => {
    try {
      await api.post(`/notifications/read/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.post("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  }, []);

  // Register service worker & subscribe to push
  const subscribeToPush = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    try {
      const { data } = await api.get("/notifications/vapid-key");
      if (!data.publicKey) return;

      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      const sub = existing || await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      });
      await api.post("/notifications/push-subscribe", { subscription: sub.toJSON() });
    } catch (err) {
      console.warn("Push subscription failed:", err.message);
    }
  }, []);

  // Register SW on mount
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        console.log("SW registered:", reg.scope);
      }).catch(console.warn);
    }
  }, []);

  // Poll for unread count every 30 seconds
  useEffect(() => {
    const token = sessionStorage.getItem("studyhub_token");
    if (!token) return;

    fetchUnreadCount();
    pollRef.current = setInterval(fetchUnreadCount, 30_000);
    return () => clearInterval(pollRef.current);
  }, [fetchUnreadCount]);

  // Request push permission and subscribe after user interaction
  const requestPushPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    if (perm === "granted") await subscribeToPush();
    return perm;
  }, [subscribeToPush]);

  const openPanel = useCallback(() => {
    setOpen(true);
    fetchNotifications();
  }, [fetchNotifications]);

  const closePanel = useCallback(() => setOpen(false), []);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, open,
      fetchNotifications, markRead, markAllRead,
      requestPushPermission, openPanel, closePanel,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be inside NotificationProvider");
  return ctx;
};
