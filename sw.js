'use strict';

importScripts('sw-toolbox.js');

toolbox.precache(["index.html", "css/bundle.min.css"]);

// See: https://googlechromelabs.github.io/sw-toolbox/api.html
toolbox.router.get('js/*', toolbox.cacheFirst);
toolbox.router.get('vendor/*', toolbox.fastest);
toolbox.router.get('img/*', toolbox.fastest);

toolbox.router.get('/*', toolbox.networkFirst, {
    networkTimeoutSeconds: 5
});