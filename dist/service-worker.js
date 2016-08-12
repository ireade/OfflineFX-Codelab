// Service Worker Toolbox
importScripts('js/lib/sw-toolbox/sw-toolbox.js');

// Offline Google Analytics
importScripts('js/lib/sw-offline-google-analytics.js');
goog.offlineGoogleAnalytics.initialize();

// Testing versions
console.log("sw-1");


// @todo Step 4 - User Service Workers to Precache the App Shell