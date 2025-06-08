// service-worker.js
// این فایل مسئول کش کردن منابع برنامه برای کار آفلاین و بهبود عملکرد است.

// نام کش فعلی. هر زمان که فایل‌های ثابت (مانند index.html, manifest.json, icons) تغییر کردند، این نام را به 'smart-news-cache-v5', 'smart-news-cache-v6' و ... تغییر دهید تا کش‌های قدیمی پاک شوند.
const CACHE_NAME = 'smart-news-cache-v4'; 

// لیستی از URL هایی که می‌خواهیم کش شوند.
const urlsToCache = [
  '/', // روت سایت که index.html را بارگذاری می‌کند
  '/index.html',
  '/manifest.json',
  '/images/icons/my-app-icon.png', // مسیر آیکون سایت خبری
  // سایر دارایی‌ها اگر وجود دارند
  'https://cdn.tailwindcss.com', 
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700&display=swap' // فونت Vazirtmatn
];

// هنگام نصب سرویس ورکر
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('کش باز شد');
        return cache.addAll(urlsToCache); // فایل‌های لیست شده را به کش اضافه می‌کند
      })
  );
});

// هنگام فعال‌سازی سرویس‌ورکر، کش‌های قدیمی را پاک می‌کند.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]; // فقط کش فعلی را در لیست سفید نگه می‌دارد
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // همه کش‌های قدیمی را پاک می‌کند که با نام جدید مطابقت ندارند
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});

// درخواست‌های شبکه راIntercept می‌کند و محتوا را از کش یا شبکه باز می‌گرداند.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // اگر پاسخی در کش پیدا شد، آن را برمی‌گرداند.
        if (response) {
          return response;
        }
        // در غیر این صورت، درخواست را به شبکه می‌فرستد.
        return fetch(event.request)
          .then((networkResponse) => {
            // پاسخ شبکه را کش می‌کند تا برای درخواست‌های بعدی در دسترس باشد.
            return caches.open(CACHE_NAME).then((cache) => {
              // فقط درخواست‌های GET و پاسخ‌های موفق (status 200) را کش کنید
              if (networkResponse.ok && event.request.method === 'GET') {
                  cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            });
          });
      })
      .catch(() => {
        // اگر هیچ پاسخی در کش و شبکه پیدا نشد (مثلاً آفلاین هستید)، می‌توانید یک صفحه آفلاین پیش‌فرض را برگردانید.
        console.log('Fetch failed, request not in cache:', event.request.url);
        return new Response('<h1>شما آفلاین هستید و این صفحه در کش نیست!</h1>', { headers: { 'Content-Type': 'text/html' }});
      })
  );
});
