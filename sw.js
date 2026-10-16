// Planning Vinvin: fonctionne hors ligne. Change VERSION à chaque mise à jour.
const VERSION = "pv-v2";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});

const put = (req, res) => { if(res && (res.ok || res.type === "opaque")){ const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return res; };

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  if(url.origin === location.origin){
    // réseau d'abord pour recevoir les mises à jour, cache si hors ligne
    e.respondWith(fetch(req).then(res => put(req, res)).catch(() => caches.match(req).then(m => m || caches.match("index.html"))));
  } else if(url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com"){
    e.respondWith(caches.match(req).then(m => m || fetch(req).then(res => put(req, res))));
  }
});
