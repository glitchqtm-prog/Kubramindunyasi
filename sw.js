/* Astro Yuvam — service worker (uygulama gibi kullanım + çevrimdışı destek)
   İlke: sayfalar ve kodlar HER ZAMAN önce internetten taze gelir (güncellemeler anında görünür);
   telefondaki kopya yalnızca internet yokken kullanılır. Sadece görseller/ikonlar önbellekten gelir. */
var SURUM = "ay-v1";
var SAYFA = SURUM + "-sayfa", DOSYA = SURUM + "-dosya", GORSEL = SURUM + "-gorsel";
var ONCEDEN = ["/offline.html", "/icon-192.png", "/favicon-32x32.png", "/logo-174.webp"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(DOSYA).then(function (c) { return c.addAll(ONCEDEN); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil((async function () {
    if (self.registration.navigationPreload) { try { await self.registration.navigationPreload.enable(); } catch (x) {} }
    var ad = await caches.keys();
    await Promise.all(ad.filter(function (k) { return k.indexOf(SURUM) !== 0; }).map(function (k) { return caches.delete(k); }));
    await self.clients.claim();
  })());
});
function sinirla(ad, n) { caches.open(ad).then(function (c) { c.keys().then(function (k) { if (k.length > n) c.delete(k[0]).then(function () { sinirla(ad, n); }); }); }); }

self.addEventListener("fetch", function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== self.location.origin) return; // dış servisler (ödeme, üyelik, analiz) hiç ellenmez
  if (u.pathname === "/sw.js") return;

  // Sayfalar: önce internet (gezinme ön-yüklemesiyle, gecikme yok), yoksa kayıtlı kopya, o da yoksa çevrimdışı sayfası
  if (r.mode === "navigate") {
    e.respondWith((async function () {
      try {
        var on = await e.preloadResponse; var cevap = on || await fetch(r);
        if (cevap && cevap.ok) { var kopya = cevap.clone(); caches.open(SAYFA).then(function (c) { c.put(r, kopya); sinirla(SAYFA, 40); }); }
        return cevap;
      } catch (x) {
        return (await caches.match(r, { ignoreSearch: true })) || (await caches.match("/offline.html"));
      }
    })());
    return;
  }
  // Görseller: önbellekten hızlı, arka planda tazelenir
  if (r.destination === "image" || /\.(png|webp|jpe?g|svg|ico|gif)$/i.test(u.pathname)) {
    e.respondWith(caches.open(GORSEL).then(function (c) {
      return c.match(r).then(function (eski) {
        var yeni = fetch(r).then(function (cv) { if (cv && cv.ok) { c.put(r, cv.clone()); sinirla(GORSEL, 80); } return cv; }).catch(function () { return eski; });
        return eski || yeni;
      });
    }));
    return;
  }
  // Kod ve veri dosyaları: önce internet, yoksa kayıtlı kopya
  if (/\.(js|css|json)$/i.test(u.pathname)) {
    e.respondWith(fetch(r).then(function (cv) { if (cv && cv.ok) { var k = cv.clone(); caches.open(DOSYA).then(function (c) { c.put(r, k); sinirla(DOSYA, 60); }); } return cv; })
      .catch(function () { return caches.match(r); }));
  }
});
