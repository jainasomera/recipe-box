
const CACHE_NAME = "recipe-box-v4";


const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./icon.svg",
    "./icon-192.png",
    "./icon-512.png"
];


// Install service worker and cache app files
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(APP_FILES);
        })
    );

    self.skipWaiting();
});

// Activate service worker
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );

    self.clients.claim();
});

// Handle app file requests
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // Do not cache Firebase or other external requests
    if (url.origin !== self.location.origin) {
        return;
    }

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response.ok) {
                    const responseCopy = response.clone();

                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseCopy);
                    });
                }

                return response;
            })
            .catch(async () => {
                const cachedResponse = await caches.match(event.request);

                if (cachedResponse) {
                    return cachedResponse;
                }

                if (event.request.mode === "navigate") {
                    return caches.match("./index.html");
                }

                return new Response("File is not available offline.", {
                    status: 503,
                    headers: { "Content-Type": "text/plain" }
                });
            })
    );
});