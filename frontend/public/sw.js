// StudyHub Service Worker v1
// Handles browser push notifications

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();

  const options = {
    body: data.body || "You have a new notification",
    icon: "/vite.svg",
    badge: "/vite.svg",
    vibrate: [200, 100, 200],
    data: { url: data.actionUrl || "/" },
    actions: [
      { action: "open",    title: "Open App" },
      { action: "dismiss", title: "Dismiss"  },
    ],
    tag: "studyhub-notification",
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "StudyHub", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("localhost") && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

self.addEventListener("install",  () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));
