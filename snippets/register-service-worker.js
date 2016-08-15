if ( 'serviceWorker' in navigator ) {

    myFX.init();

    navigator.serviceWorker
    .register('./service-worker.js', { scope: './' })
    .then(function(reg) {
        console.log('Service Worker Registered', reg);
    })
    .catch(function(err) {
        console.log('Service Worker Failed to Register', err);
    });

} else {

    new Toast('error', "Your browser doesn't support some great features to really take advantage of this application. Why not try using Chrome instead?");

}