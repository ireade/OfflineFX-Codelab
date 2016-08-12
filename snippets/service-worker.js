// Precache
const precacheFiles = [
	'./',
	'./index.html',
	'./css/main.css',
	'https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css',
	'https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,300,300italic,700,900,900italic,700italic,400italic',
	'./data/Common-Currency.json',
	'./img/logo.png',
	'./img/icon-convert.png',
	'./img/icon-delete.png',
	'./js/main.js',
	'./js/utils.js',
	'./js/lib/lib.js'
];
toolbox.precache(precacheFiles);

// Install and Activate events
self.addEventListener('install', (event) => event.waitUntil(self.skipWaiting()) );
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()) );

// Fetch events
self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request).then( (response) => response || fetch(event.request) )
	);
});