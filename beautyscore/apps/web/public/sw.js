/**
 * BeautyScore Service Worker
 * Handles offline support, caching, and background sync
 */

const CACHE_NAME = 'beautyscore-v1';
const STATIC_CACHE = 'beautyscore-static-v1';
const DYNAMIC_CACHE = 'beautyscore-dynamic-v1';
const API_CACHE = 'beautyscore-api-v1';
const IMAGE_CACHE = 'beautyscore-images-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

// Pages to cache for offline navigation
const OFFLINE_PAGES = [
  '/app',
  '/app/shelf',
  '/app/trends',
  '/app/profile',
];

// Offline fallback page HTML
const OFFLINE_FALLBACK = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BeautyScore — Офлайн</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(135deg, #FDFCFB 0%, #F5F0EB 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .container {
      text-align: center;
      max-width: 400px;
    }
    .icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, #2D7A4F 0%, #1D5A3A 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 36px;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1A1A1A;
      margin-bottom: 12px;
    }
    p {
      color: #6B6B6B;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    button {
      background: linear-gradient(135deg, #2D7A4F 0%, #1D5A3A 100%);
      color: white;
      border: none;
      padding: 14px 28px;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(45, 122, 79, 0.3);
    }
    button:active {
      transform: translateY(0);
    }
    .retry-hint {
      margin-top: 16px;
      font-size: 0.875rem;
      color: #9B9B9B;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📡</div>
    <h1>Нет подключения</h1>
    <p>
      Похоже, вы офлайн. Проверьте подключение к интернету 
      и попробуйте снова.
    </p>
    <button onclick="location.reload()">Попробовать снова</button>
    <p class="retry-hint">Мы автоматически восстановим работу при появлении сети</p>
  </div>
</body>
</html>
`;

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache offline fallback
      caches.open(CACHE_NAME).then((cache) => {
        return cache.put('/offline', new Response(OFFLINE_FALLBACK, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }));
      }),
    ]).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Delete old caches
            return name.startsWith('beautyscore-') && 
                   name !== CACHE_NAME &&
                   name !== STATIC_CACHE &&
                   name !== DYNAMIC_CACHE &&
                   name !== API_CACHE &&
                   name !== IMAGE_CACHE;
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle image requests
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
    return;
  }
  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
  
  // Handle static assets (stale-while-revalidate)
  event.respondWith(handleStaticRequest(request));
});

/**
 * Handle API requests - Network first, cache fallback
 */
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Skip auth endpoints - never cache
  if (url.pathname.includes('/auth/')) {
    return fetch(request);
  }
  
  // For non-mutating requests, try cache-first approach for specific endpoints
  const cacheableEndpoints = ['/api/products', '/api/surveys', '/api/trends'];
  const isCacheable = cacheableEndpoints.some(ep => url.pathname.startsWith(ep));
  
  if (isCacheable) {
    try {
      const response = await fetch(request);
      
      if (response.ok) {
        const cache = await caches.open(API_CACHE);
        cache.put(request, response.clone());
      }
      
      return response;
    } catch (error) {
      // Network failed, try cache
      const cached = await caches.match(request);
      if (cached) {
        return cached;
      }
      
      // Return error response
      return new Response(JSON.stringify({ 
        error: 'Offline',
        message: 'Нет подключения к интернету' 
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // For non-cacheable API requests, just fetch
  return fetch(request);
}

/**
 * Handle image requests - Cache first, network fallback
 */
async function handleImageRequest(request) {
  const cached = await caches.match(request);
  
  if (cached) {
    // Return cached version and update in background
    updateCache(IMAGE_CACHE, request);
    return cached;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Return placeholder SVG for failed images
    return new Response(
      `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#F5F0EB"/>
        <text x="100" y="105" font-family="sans-serif" font-size="14" fill="#9B9B9B" text-anchor="middle">📷</text>
      </svg>`,
      {
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }
}

/**
 * Handle navigation requests - Network first, cache fallback
 */
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful navigation responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Try to serve from cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    // Serve offline fallback
    const offlinePage = await caches.match('/offline');
    if (offlinePage) {
      return offlinePage;
    }
    
    // Last resort - return inline offline page
    return new Response(OFFLINE_FALLBACK, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

/**
 * Handle static requests - Stale while revalidate
 */
async function handleStaticRequest(request) {
  const cached = await caches.match(request);
  
  // Return cached version immediately and update in background
  if (cached) {
    updateCache(STATIC_CACHE, request);
    return cached;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Return offline fallback for HTML pages
    if (request.headers.get('accept')?.includes('text/html')) {
      const offlinePage = await caches.match('/offline');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Update cache in background
 */
async function updateCache(cacheName, request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response);
    }
  } catch (error) {
    // Silently fail - we already have cached version
  }
}

/**
 * Check if request is for an image
 */
function isImageRequest(request) {
  const url = new URL(request.url);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'];
  
  return (
    imageExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext)) ||
    request.destination === 'image' ||
    url.hostname === 'pcdn.goldapple.ru'
  );
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('beautyscore-'))
            .map(name => caches.delete(name))
        );
      })
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-shelf') {
    event.waitUntil(syncShelfActions());
  }
});

/**
 * Sync queued shelf actions when back online
 */
async function syncShelfActions() {
  // This would sync any queued shelf add/remove actions
  // Implementation depends on IndexedDB queue
  console.log('[SW] Syncing shelf actions...');
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body || 'Новое уведомление от BeautyScore',
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || [],
    tag: data.tag || 'beautyscore-notification',
    renotify: true,
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'BeautyScore', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/app';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open new window if no existing one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('[SW] Service Worker loaded');
