const cacheName = "mba-algae-kelp-v4";
const home = new URL("./", self.registration.scope).href;

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const response = await fetch(home, {cache: "reload"});
    if (!response.ok || response.redirected || !(await response.clone().text()).includes('id="photo-library"')) {
      throw new Error("The offline reference could not be downloaded.");
    }
    const cache = await caches.open(cacheName);
    await cache.put(home, response);
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
  if (event.request.mode !== "navigate" || url.origin !== self.location.origin ||
      ![new URL(home).pathname, new URL("index.html", home).pathname].includes(url.pathname)) return;
  event.respondWith(fetch(event.request).catch(async () => (await caches.open(cacheName)).match(home)));
});
