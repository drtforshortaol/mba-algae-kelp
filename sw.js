const cacheName = "mba-algae-kelp-v24";
const home = new URL("./", self.registration.scope).href;
const assets = [
  {url: home, marker: 'id="photo-library"'},
  {url: new URL("identification-photos.js", home).href, marker: "globalThis.identificationPhotos"},
  {url: new URL("identification-photos-2.js", home).href, marker: "globalThis.identificationPhotos"},
  {url: new URL("identification-photos-3.js", home).href, marker: "globalThis.identificationPhotos"},
  {url: new URL("identification-photos-4.js", home).href, marker: "globalThis.identificationPhotos"},
  {url: new URL("identification-photos-5.js", home).href, marker: "globalThis.identificationPhotos"},
  {url: new URL("identification-photos-6.js", home).href, marker: "globalThis.identificationPhotos"},
  {url: new URL("identification-photos-7.js", home).href, marker: "globalThis.identificationPhotos"},
  {url: new URL("identification-photos-8.js", home).href, marker: "globalThis.identificationPhotos"},
  {url: new URL("identification-photos-9.js", home).href, marker: "globalThis.identificationPhotos"},
  {url: new URL("identification-photos-10.js", home).href, marker: "globalThis.identificationPhotos"},
  {url: new URL("identification-photos-11.js", home).href, marker: "globalThis.identificationPhotos"},
  {url: new URL("identification-photos-12.js", home).href, marker: "globalThis.identificationPhotos"}
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const responses = await Promise.all(assets.map(async ({url, marker}) => {
      const response = await fetch(url, {cache: "reload"});
      if (!response.ok || response.redirected || !(await response.clone().text()).includes(marker)) {
        throw new Error("The offline reference could not be downloaded.");
      }
      return response;
    }));
    const cache = await caches.open(cacheName);
    await Promise.all(assets.map(({url}, i) => cache.put(url, responses[i])));
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
  const asset = assets.find(item => item.url === url.href);
  if (!isGuide && !asset) return;
  event.respondWith(fetch(event.request).catch(async () => (await caches.open(cacheName)).match(isGuide ? home : asset.url)));
});
