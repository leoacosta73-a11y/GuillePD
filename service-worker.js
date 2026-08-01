const CACHE_NAME = 'guillepd-pwa-v5';
const SUPABASE_LIBRARY = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
const APP_SHELL = [
  './',
  './index.html',
  './apd-styles.css',
  './apd-module.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all([
        cache.addAll(APP_SHELL),
        cache.add(SUPABASE_LIBRARY).catch(() => null)
      ]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isSupabaseLibrary = event.request.url.startsWith(SUPABASE_LIBRARY);

  // Las solicitudes de datos y autenticación de Supabase no deben recibir
  // index.html como respuesta cuando el dispositivo está sin conexión.
  if (!isSameOrigin && !isSupabaseLibrary) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && (response.ok || response.type === 'opaque')) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => {
        if (cached) return cached;
        if (isSameOrigin && event.request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      }))
  );
});
