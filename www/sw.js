var version = "0.0.36";
var cacheName = "isoptera";

self.addEventListener('install', function(event) {
	console.log("The service worker is being installed.");
	event.waitUntil(
		caches.open(cacheName).then(function(cache) {
			return cache.addAll([
				"/",
            	"/css/style.css",
				"/js/app/muskatUtils.js",
				"/js/app/muskatGl.js",
				"/js/app/app.js",
				"/js/lib/gl-matrix-min.js",
            	"/img/logo.png",
            	"/img/kiste.png",
            	"/img/sprite.jpg",
            	"/img/sprite2.png",
				"/img/reload.png",
            	"/manifest.json",
            	"/favicon.ico"
			]);
	}));
});

self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches.open(cacheName).then(function(cache) {
			return cache.match(event.request)
				.then(function(response) {
					if(response)
						return response;
					return fetch(event.request);
			});
		})
	);
});

self.addEventListener("message", function(event) {
	if(event.data.action === "skipWaiting") {
		self.skipWaiting();
	}
});
