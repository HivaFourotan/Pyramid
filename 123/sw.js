/* ======================================================================
   PIRAMID — Service Worker
   استراتژی: stale-while-revalidate برای assets اصلی
   ====================================================================== */
'use strict';

const CACHE_NAME = 'piramid-v1';
const RUNTIME_CACHE = 'piramid-runtime-v1';

// فقط فایل‌های اصلی که همیشه باید کش بشن
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

/* ============ نصب ============ */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // هر فایل رو جدا کش می‌کنیم تا اگه یکی 404 بود کل fail نشه
        return Promise.all(
          CORE_ASSETS.map(url =>
            cache.add(url).catch(err => console.warn('cache miss:', url, err))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

/* ============ فعال‌سازی ============ */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== RUNTIME_CACHE)
            .map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

/* ============ Fetch ============ */
self.addEventListener('fetch', event => {
  const req = event.request;

  // فقط GET
  if(req.method !== 'GET') return;

  // از دامنه‌ی خودمون نباشه، ولش کن
  const url = new URL(req.url);
  if(url.origin !== self.location.origin && !req.url.includes('cdn.jsdelivr.net')){
    return;
  }

  // فایل‌های HTML: network-first (تازه بمونه)
  if(req.headers.get('accept')?.includes('text/html')){
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // بقیه: stale-while-revalidate
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req)
        .then(res => {
          if(res && res.status === 200){
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then(c => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

/* ============ پیام‌ها ============ */
self.addEventListener('message', event => {
  if(event.data?.type === 'SKIP_WAITING'){
    self.skipWaiting();
  }
  if(event.data?.type === 'CLEAR_CACHE'){
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
});

/* ============ Push Notification ============ */
self.addEventListener('push', event => {
  const data = event.data?.json() || {
    title: 'پیرامید',
    body: 'یه خبر تازه داری!'
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'پیرامید', {
      body: data.body || '',
      icon: './icons/icon.svg',
      badge: './icons/icon.svg',
      vibrate: [100, 50, 100],
      dir: 'rtl',
      lang: 'fa',
      data: { url: data.url || './index.html' }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || './';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for(const c of list){
        if(c.url.includes(url) && 'focus' in c) return c.focus();
      }
      if(clients.openWindow) return clients.openWindow(url);
    })
  );
});