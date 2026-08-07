const CACHE_NAME = 'guillepd-pwa-v12';
const SUPABASE_LIBRARY = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
const APP_SHELL = [
  './',
  './index.html',
  './apd-styles.css',
  './apd-module.js',
  './smart-features.css',
  './fluid-tracking.css',
  './i18n.js',
  './notifications.js',
  './fluid-tracking.js',
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

/* Notificaciones mostradas por la PWA. El horario se conserva en el
 * dispositivo y la página solicita al Service Worker que muestre el aviso.
 * Este mismo formato queda preparado para incorporar Web Push en el futuro. */
self.addEventListener('message', event => {
  const message=event.data||{};
  if(message.type==='SKIP_WAITING'){
    self.skipWaiting();
    return;
  }
  if(message.type==='SHOW_NOTIFICATION'&&message.title){
    event.waitUntil(self.registration.showNotification(message.title,message.options||{}));
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target=(event.notification.data&&event.notification.data.url)||'./';
  event.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(openClients=>{
      for(const client of openClients){
        if('focus' in client){
          client.navigate(target).catch(()=>null);
          return client.focus();
        }
      }
      return clients.openWindow?clients.openWindow(target):null;
    })
  );
});

// Punto de extensión reservado para recordatorios APD y notificaciones push.
self.addEventListener('push', event => {
  if(!event.data)return;
  let payload={};
  try{payload=event.data.json()}catch(_){payload={body:event.data.text()}}
  const title=payload.title||'GuillePD';
  const options={
    body:payload.body||'',
    icon:'./icon-192.png',
    badge:'./icon-192.png',
    tag:payload.tag||'guillepd-push',
    data:{url:payload.url||'./',type:payload.type||'custom',...(payload.data||{})}
  };
  event.waitUntil(self.registration.showNotification(title,options));
});
