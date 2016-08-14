// Service Worker Toolbox
importScripts('js/lib/sw-toolbox/sw-toolbox.js');

// Offline Google Analytics
importScripts('js/lib/sw-offline-google-analytics.js');
goog.offlineGoogleAnalytics.initialize();

// @todo Step 4 - User Service Workers to Precache the App Shell
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


// Install and Activate events
self.addEventListener('install', (event) => event.waitUntil(self.skipWaiting()) );
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()) );

// Fetch events
self.addEventListener('fetch', (event) => {
	// @todo Step 4 - Serve the precached app shell
});