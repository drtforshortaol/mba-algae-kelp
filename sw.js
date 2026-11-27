const cacheName = "mba-algae-kelp-v9";
const home = new URL("./", self.registration.scope).href;
const photos = new URL("identification-photos.js", home).href;

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const [page, images] = await Promise.all([home, photos].map(url => fetch(url, {cache: "reload"})));
    if (!page.ok || page.redirected || !(await page.clone().text()).includes('id="photo-library"') ||
        !images.ok || images.redirected || !(await images.clone().text()).startsWith("globalThis.identificationPhotos")) {
      throw new Error("The offline reference could not be downloaded.");
    }
    const cache = await caches.open(cacheName);
    await Promise.all([cache.put(home, page), cache.put(photos, images)]);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith("mba-algae-kelp-") && name !== cacheName) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  const isGuide = event.request.mode === "navigate" && url.origin === self.location.origin &&
    [new URL(home).pathname, new URL("index.html", home).pathname].includes(url.pathname);
  if (!isGuide && url.href !== photos) return;
  event.respondWith(fetch(event.request).catch(async () => (await caches.open(cacheName)).match(isGuide ? home : photos)));
});
