// نام کش فعلی. هر زمان که فایل‌های ثابت (مانند index.html, manifest.json, icons) تغییر کردند، این نام را به 'smart-news-cache-v2', 'smart-news-cache-v3' و ... تغییر دهید تا کش‌های قدیمی پاک شوند.
const CACHE_NAME = 'smart-news-cache-v1'; 

// لیستی از URL هایی که می‌خواهیم کش شوند.
const urlsToCache = [
  '/', // روت سایت که index.html را بارگذاری می‌کند
  '/index.html',
  '/manifest.json',
  '/images/icons/my-app-icon.png', // مطمئن شوید مسیر آیکون درست است
  // فایل service-worker.js به صورت خودکار توسط مرورگر کش و مدیریت می‌شود
];

// هنگام نصب سرویس ورکر
self.addEventListener('install', (event) => {
  // منتظر می‌ماند تا کش باز شود و همه فایل‌های لازم کش شوند
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('کش باز شد');
        return cache.addAll(urlsToCache); // فایل‌های لیست شده را به کش اضافه می‌کند
      })
  );
});

// هنگام درخواست‌های شبکه
self.addEventListener('fetch', (event) => {
  // تلاش می‌کند پاسخ را از کش پیدا کند، اگر پیدا نکرد از شبکه می‌گیرد
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // اگر پاسخ در کش بود، آن را برمی‌گرداند
        if (response) {
          return response;
        }
        // اگر در کش نبود، از شبکه می‌گیرد
        return fetch(event.request);
      })
  );
});

// هنگام فعال شدن سرویس ورکر جدید (مثلاً بعد از آپدیت)
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]; // فقط کش فعلی را در لیست سفید نگه می‌دارد
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // همه کش‌های قدیمی را پاک می‌کند که با نام جدید مطابقت ندارند
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// نکته: برای اینکه تغییرات آیکون اعمال شود، باید:
// 1. فایل service-worker.js را به روز کنید (نام CACHE_NAME را تغییر دهید)
// 2. فایل manifest.json را به روز کنید (نام یا short_name را تغییر دهید)
// 3. فایل index.html را به روز کنید (لینک manifest نیازی به ?v= ندارد، اما برای اطمینان می‌توانید آن را نگه دارید یا یک timestamp جدید به index.html اضافه کنید تا مطمئن شوید مرورگر index.html جدید را می‌گیرد).
// 4. کاربر باید یک بار برنامه را از صفحه اصلی حذف و کش مرورگر را پاک کند و دوباره اضافه کند (فقط برای اولین بار بعد از اعمال Service Worker).
