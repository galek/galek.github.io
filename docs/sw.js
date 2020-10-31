'use strict';

importScripts('sw-toolbox.js');
self.toolbox.precache(['index.html','css/resume.min.css']);
self.toolbox.router.get('/images/*', self.toolbox.cacheFirst);
self.toolbox.router.get('/*', self.toolbox.networkFirst, { networkTimeoutSeconds: 5});
