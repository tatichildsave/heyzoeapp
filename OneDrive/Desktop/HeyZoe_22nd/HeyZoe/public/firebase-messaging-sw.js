/* eslint-disable no-undef */
// Service worker for Hey Zoe. Two independent jobs live here:
//   1. Basic offline/install support (install/activate/fetch below) —
//      registered unconditionally on every app load, which is also what
//      makes the app installable ("Add to Home Screen").
//   2. Firebase Cloud Messaging background push (goal check-in reminders)
//      — only sets itself up if Firebase config was passed in the
//      registration URL's query string (see services/pwa/index.js).
// Must live at the site root (not under /src) so it can be registered
// with scope "/".

const CACHE_NAME = "heyzoe-shell-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Network-first, falling back to cache when offline. This is a small,
// honest offline story — pages/assets you've already loaded once keep
// working without a connection — not a full precached app shell (Vite's
// hashed filenames change every build, so a static precache list would
// go stale immediately without a build-time step to generate one).
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// --- Push messaging (only if config was supplied) ---
const params = new URL(self.location.href).searchParams;

if (params.get("apiKey")) {
  importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

  firebase.initializeApp({
    apiKey: params.get("apiKey"),
    authDomain: params.get("authDomain"),
    projectId: params.get("projectId"),
    storageBucket: params.get("storageBucket"),
    messagingSenderId: params.get("messagingSenderId"),
    appId: params.get("appId"),
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || "Hey Zoe";
    const body = payload.notification?.body || "Your goals are waiting for you.";
    self.registration.showNotification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "heyzoe-goal-reminder", // replaces any earlier unopened reminder instead of stacking
    });
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("/");
    })
  );
});
