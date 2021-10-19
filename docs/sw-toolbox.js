!function(e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).toolbox=e()}(function(){return function r(o,i,c){function s(t,e){if(!i[t]){if(!o[t]){var n="function"==typeof require&&require;if(!e&&n)return n(t,!0);if(a)return a(t,!0);n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}n=i[t]={exports:{}};o[t][0].call(n.exports,function(e){return s(o[t][1][e]||e)},n,n.exports,r,o,i,c)}return i[t].exports}for(var a="function"==typeof require&&require,e=0;e<c.length;e++)s(c[e]);return s}({1:[function(e,t,n){"use strict";function s(e,t){((t=t||{}).debug||c.debug)&&console.log("[sw-toolbox] "+e)}function o(e){var t=(t=e&&e.cache?e.cache.name:t)||c.cache.name;return caches.open(t)}function r(e){var t=Array.isArray(e);if(t&&e.forEach(function(e){"string"==typeof e||e instanceof Request||(t=!1)}),!t)throw new TypeError("The precache method expects either an array of strings and/or Requests or a Promise that resolves to an array of strings and/or Requests.");return e}var i,c=e("./options"),a=e("./idb-cache-expiration");t.exports={debug:s,fetchAndCache:function(n,r){var t=(r=r||{}).successResponses||c.successResponses;return fetch(n.clone()).then(function(e){return"GET"===n.method&&t.test(e.status)&&o(r).then(function(t){t.put(n,e).then(function(){var e=r.cache||c.cache;(e.maxEntries||e.maxAgeSeconds)&&e.name&&function(e,t,n){n=function(e,t,n){var r=e.url,o=n.maxAgeSeconds,i=n.maxEntries,n=n.name,c=Date.now();return s("Updating LRU order for "+r+". Max entries is "+i+", max age is "+o),a.getDb(n).then(function(e){return a.setTimestampForUrl(e,r,c)}).then(function(e){return a.expireEntries(e,i,o,c)}).then(function(e){s("Successfully updated IDB.");e=e.map(function(e){return t.delete(e)});return Promise.all(e).then(function(){s("Done with cache cleanup.")})}).catch(function(e){s(e)})}.bind(null,e,t,n);i=i?i.then(n):n()}(n,t,e)})}),e.clone()})},openCache:o,renameCache:function(t,e,n){return s("Renaming cache: ["+t+"] to ["+e+"]",n),caches.delete(e).then(function(){return Promise.all([caches.open(t),caches.open(e)]).then(function(e){var n=e[0],r=e[1];return n.keys().then(function(e){return Promise.all(e.map(function(t){return n.match(t).then(function(e){return r.put(t,e)})}))}).then(function(){return caches.delete(t)})})})},cache:function(t,e){return o(e).then(function(e){return e.add(t)})},uncache:function(t,e){return o(e).then(function(e){return e.delete(t)})},precache:function(e){e instanceof Promise||r(e),c.preCacheItems=c.preCacheItems.concat(e)},validatePrecacheInput:r,isResponseFresh:function(e,t,n){if(!e)return!1;if(t){e=e.headers.get("date");if(e&&new Date(e).getTime()+1e3*t<n)return!1}return!0}}},{"./idb-cache-expiration":2,"./options":4}],2:[function(e,t,n){"use strict";var o="sw-toolbox-",i=1,u="store",h="url",p="timestamp",c={};t.exports={getDb:function(e){return e in c||(c[e]=(r=e,new Promise(function(e,t){var n=indexedDB.open(o+r,i);n.onupgradeneeded=function(){n.result.createObjectStore(u,{keyPath:h}).createIndex(p,p,{unique:!1})},n.onsuccess=function(){e(n.result)},n.onerror=function(){t(n.error)}}))),c[e];var r},setTimestampForUrl:function(r,o,i){return new Promise(function(e,t){var n=r.transaction(u,"readwrite");n.objectStore(u).put({url:o,timestamp:i}),n.oncomplete=function(){e(r)},n.onabort=function(){t(n.error)}})},expireEntries:function(e,n,t,r){return c=e,a=r,((s=t)?new Promise(function(e,t){var n=1e3*s,r=[],o=c.transaction(u,"readwrite"),i=o.objectStore(u);i.index(p).openCursor().onsuccess=function(e){var t=e.target.result;t&&a-n>t.value[p]&&(e=t.value[h],r.push(e),i.delete(e),t.continue())},o.oncomplete=function(){e(r)},o.onabort=t}):Promise.resolve([])).then(function(t){return s=e,((a=n)?new Promise(function(e,t){var r=[],n=s.transaction(u,"readwrite"),o=n.objectStore(u),i=o.index(p),c=i.count();i.count().onsuccess=function(){var n=c.result;a<n&&(i.openCursor().onsuccess=function(e){var t=e.target.result;t&&(e=t.value[h],r.push(e),o.delete(e),n-r.length>a&&t.continue())})},n.oncomplete=function(){e(r)},n.onabort=t}):Promise.resolve([])).then(function(e){return t.concat(e)});var s,a});var c,s,a}}},{}],3:[function(e,t,n){"use strict";function r(e){return e.reduce(function(e,t){return e.concat(t)},[])}e("serviceworker-cache-polyfill");var o=e("./helpers"),i=e("./router"),c=e("./options");t.exports={fetchListener:function(e){var t=i.match(e.request);t?e.respondWith(t(e.request)):i.default&&"GET"===e.request.method&&0===e.request.url.indexOf("http")&&e.respondWith(i.default(e.request))},activateListener:function(e){o.debug("activate event fired");var t=c.cache.name+"$$$inactive$$$";e.waitUntil(o.renameCache(t,c.cache.name))},installListener:function(e){var t=c.cache.name+"$$$inactive$$$";o.debug("install event fired"),o.debug("creating cache ["+t+"]"),e.waitUntil(o.openCache({cache:{name:t}}).then(function(t){return Promise.all(c.preCacheItems).then(r).then(o.validatePrecacheInput).then(function(e){return o.debug("preCache list: "+(e.join(", ")||"(none)")),t.addAll(e)})}))}}},{"./helpers":1,"./options":4,"./router":6,"serviceworker-cache-polyfill":16}],4:[function(e,t,n){"use strict";var r=self.registration?self.registration.scope:self.scope||new URL("./",self.location).href;t.exports={cache:{name:"$$$toolbox-cache$$$"+r+"$$$",maxAgeSeconds:null,maxEntries:null,queryOptions:null},debug:!1,networkTimeoutSeconds:null,preCacheItems:[],successResponses:/^0|([123]\d\d)|(40[14567])|410$/}},{}],5:[function(e,t,n){"use strict";var o=new URL("./",self.location).pathname,i=e("path-to-regexp"),e=function(e,t,n,r){t instanceof RegExp?this.fullUrlRegExp=t:(0!==t.indexOf("/")&&(t=o+t),this.keys=[],this.regexp=i(t,this.keys)),this.method=e,this.options=r,this.handler=n};e.prototype.makeHandler=function(e){var n,r;return this.regexp&&(n=this.regexp.exec(e),r={},this.keys.forEach(function(e,t){r[e.name]=n[t+1]})),function(e){return this.handler(e,r,this.options)}.bind(this)},t.exports=e},{"path-to-regexp":15}],6:[function(e,t,n){"use strict";function i(e,t){for(var n=e.entries(),r=n.next(),o=[];!r.done;)new RegExp(r.value[0]).test(t)&&o.push(r.value[1]),r=n.next();return o}function o(){this.routes=new Map,this.routes.set(RegExp,new Map),this.default=null}var c=e("./route"),s=e("./helpers");["get","post","put","delete","head","any"].forEach(function(r){o.prototype[r]=function(e,t,n){return this.add(r,e,t,n)}}),o.prototype.add=function(e,t,n,r){r=r||{},o=t instanceof RegExp?RegExp:(o=r.origin||self.location.origin)instanceof RegExp?o.source:o.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&"),e=e.toLowerCase();r=new c(e,t,n,r);this.routes.has(o)||this.routes.set(o,new Map);var o=this.routes.get(o);o.has(e)||o.set(e,new Map);o=o.get(e),e=r.regexp||r.fullUrlRegExp;o.has(e.source)&&s.debug('"'+t+'" resolves to same regex as existing route.'),o.set(e.source,r)},o.prototype.matchMethod=function(e,t){var n=new URL(t),r=n.origin,n=n.pathname;return this._match(e,i(this.routes,r),n)||this._match(e,[this.routes.get(RegExp)],t)},o.prototype._match=function(e,t,n){if(0===t.length)return null;for(var r=0;r<t.length;r++){var o=t[r],o=o&&o.get(e.toLowerCase());if(o){o=i(o,n);if(0<o.length)return o[0].makeHandler(n)}}return null},o.prototype.match=function(e){return this.matchMethod(e.method,e.url)||this.matchMethod("any",e.url)},t.exports=new o},{"./helpers":1,"./route":5}],7:[function(e,t,n){"use strict";var i=e("../options"),c=e("../helpers");t.exports=function(n,e,r){var o=(r=r||{}).cache||i.cache,t=o.queryOptions;return c.debug("Strategy: cache first ["+n.url+"]",r),c.openCache(r).then(function(e){return e.match(n,t).then(function(e){var t=Date.now();return c.isResponseFresh(e,o.maxAgeSeconds,t)?e:c.fetchAndCache(n,r)})})}},{"../helpers":1,"../options":4}],8:[function(e,t,n){"use strict";var i=e("../options"),c=e("../helpers");t.exports=function(t,e,n){var r=(n=n||{}).cache||i.cache,o=r.queryOptions;return c.debug("Strategy: cache only ["+t.url+"]",n),c.openCache(n).then(function(e){return e.match(t,o).then(function(e){var t=Date.now();if(c.isResponseFresh(e,r.maxAgeSeconds,t))return e})})}},{"../helpers":1,"../options":4}],9:[function(e,t,n){"use strict";var u=e("../helpers"),h=e("./cacheOnly");t.exports=function(c,s,a){return u.debug("Strategy: fastest ["+c.url+"]",a),new Promise(function(t,n){function e(e){e instanceof Response?t(e):i("No result returned")}var r=!1,o=[],i=function(e){o.push(e.toString()),r?n(new Error('Both cache and network failed: "'+o.join('", "')+'"')):r=!0};u.fetchAndCache(c.clone(),a).then(e,i),h(c,s,a).then(e,i)})}},{"../helpers":1,"./cacheOnly":8}],10:[function(e,t,n){t.exports={networkOnly:e("./networkOnly"),networkFirst:e("./networkFirst"),cacheOnly:e("./cacheOnly"),cacheFirst:e("./cacheFirst"),fastest:e("./fastest")}},{"./cacheFirst":7,"./cacheOnly":8,"./fastest":9,"./networkFirst":11,"./networkOnly":12}],11:[function(e,t,n){"use strict";var r=e("../options"),p=e("../helpers");t.exports=function(i,e,c){var s=(c=c||{}).cache||r.cache,a=s.queryOptions,u=c.successResponses||r.successResponses,h=c.networkTimeoutSeconds||r.networkTimeoutSeconds;return p.debug("Strategy: network first ["+i.url+"]",c),p.openCache(c).then(function(e){var t,n,r=[];h&&(o=new Promise(function(r){t=setTimeout(function(){e.match(i,a).then(function(e){var t=Date.now(),n=s.maxAgeSeconds;p.isResponseFresh(e,n,t)&&r(e)})},1e3*h)}),r.push(o));var o=p.fetchAndCache(i,c).then(function(e){if(t&&clearTimeout(t),u.test(e.status))return e;throw p.debug("Response was an HTTP error: "+e.statusText,c),n=e,new Error("Bad response")}).catch(function(t){return p.debug("Network or response error, fallback to cache ["+i.url+"]",c),e.match(i,a).then(function(e){if(e)return e;if(n)return n;throw t})});return r.push(o),Promise.race(r)})}},{"../helpers":1,"../options":4}],12:[function(e,t,n){"use strict";var r=e("../helpers");t.exports=function(e,t,n){return r.debug("Strategy: network only ["+e.url+"]",n),fetch(e)}},{"../helpers":1}],13:[function(e,t,n){"use strict";var r=e("./options"),o=e("./router"),i=e("./helpers"),c=e("./strategies"),e=e("./listeners");i.debug("Service Worker Toolbox is loading"),self.addEventListener("install",e.installListener),self.addEventListener("activate",e.activateListener),self.addEventListener("fetch",e.fetchListener),t.exports={networkOnly:c.networkOnly,networkFirst:c.networkFirst,cacheOnly:c.cacheOnly,cacheFirst:c.cacheFirst,fastest:c.fastest,router:o,options:r,cache:i.cache,uncache:i.uncache,precache:i.precache}},{"./helpers":1,"./listeners":3,"./options":4,"./router":6,"./strategies":10}],14:[function(e,t,n){t.exports=Array.isArray||function(e){return"[object Array]"==Object.prototype.toString.call(e)}},{}],15:[function(e,t,n){function r(e,t){for(var n=[],r=0,o=0,i="",c=t&&t.delimiter||"/";null!=(p=v.exec(e));){var s,a,u,h,p,f=p[0],l=p[1],d=p.index;i+=e.slice(o,d),o=d+f.length,l?i+=l[1]:(s=e[o],a=p[2],u=p[3],h=p[4],d=p[5],f=p[6],l=p[7],i&&(n.push(i),i=""),p=p[2]||c,n.push({name:u||r++,prefix:a||"",delimiter:p,optional:"?"===f||"*"===f,repeat:"+"===f||"*"===f,partial:null!=a&&null!=s&&s!==a,asterisk:!!l,pattern:(d=h||d)?d.replace(/([=!:$\/()])/g,"\\$1"):l?".*":"[^"+m(p)+"]+?"}))}return o<e.length&&(i+=e.substr(o)),i&&n.push(i),n}function f(e){return encodeURI(e).replace(/[\/?#]/g,function(e){return"%"+e.charCodeAt(0).toString(16).toUpperCase()})}function o(h){for(var p=new Array(h.length),e=0;e<h.length;e++)"object"==typeof h[e]&&(p[e]=new RegExp("^(?:"+h[e].pattern+")$"));return function(e,t){for(var n="",r=e||{},o=(t||{}).pretty?f:encodeURIComponent,i=0;i<h.length;i++){var c=h[i];if("string"!=typeof c){var s,a=r[c.name];if(null==a){if(c.optional){c.partial&&(n+=c.prefix);continue}throw new TypeError('Expected "'+c.name+'" to be defined')}if(g(a)){if(!c.repeat)throw new TypeError('Expected "'+c.name+'" to not repeat, but received `'+JSON.stringify(a)+"`");if(0===a.length){if(c.optional)continue;throw new TypeError('Expected "'+c.name+'" to not be empty')}for(var u=0;u<a.length;u++){if(s=o(a[u]),!p[i].test(s))throw new TypeError('Expected all "'+c.name+'" to match "'+c.pattern+'", but received `'+JSON.stringify(s)+"`");n+=(0===u?c.prefix:c.delimiter)+s}}else{if(s=c.asterisk?encodeURI(a).replace(/[?#]/g,function(e){return"%"+e.charCodeAt(0).toString(16).toUpperCase()}):o(a),!p[i].test(s))throw new TypeError('Expected "'+c.name+'" to match "'+c.pattern+'", but received "'+s+'"');n+=c.prefix+s}}else n+=c}return n}}function m(e){return e.replace(/([.+*?=^!:${}()[\]|\/\\])/g,"\\$1")}function l(e,t){return e.keys=t,e}function d(e){return e.sensitive?"":"i"}function i(e,t,n){g(t)||(n=t||n,t=[]);for(var r=(n=n||{}).strict,o=!1!==n.end,i="",c=0;c<e.length;c++){var s,a,u=e[c];"string"==typeof u?i+=m(u):(s=m(u.prefix),a="(?:"+u.pattern+")",t.push(u),u.repeat&&(a+="(?:"+s+a+")*"),i+=a=u.optional?u.partial?s+"("+a+")?":"(?:"+s+"("+a+"))?":s+"("+a+")")}var h=m(n.delimiter||"/"),p=i.slice(-h.length)===h;return r||(i=(p?i.slice(0,-h.length):i)+"(?:"+h+"(?=$))?"),i+=o?"$":r&&p?"":"(?="+h+"|$)",l(new RegExp("^"+i,d(n)),t)}function c(e,t,n){return g(t)||(n=t||n,t=[]),n=n||{},e instanceof RegExp?function(e,t){var n=e.source.match(/\((?!\?)/g);if(n)for(var r=0;r<n.length;r++)t.push({name:r,prefix:null,delimiter:null,optional:!1,repeat:!1,partial:!1,asterisk:!1,pattern:null});return l(e,t)}(e,t):g(e)?function(e,t,n){for(var r=[],o=0;o<e.length;o++)r.push(c(e[o],t,n).source);return l(new RegExp("(?:"+r.join("|")+")",d(n)),t)}(e,t,n):(t=t,i(r(e,n=n),t,n))}var g=e("isarray");t.exports=c,t.exports.parse=r,t.exports.compile=function(e,t){return o(r(e,t))},t.exports.tokensToFunction=o,t.exports.tokensToRegExp=i;var v=new RegExp(["(\\\\.)","([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))"].join("|"),"g")},{isarray:14}],16:[function(e,t,n){var r,o,i,c;i=Cache.prototype.addAll,(c=navigator.userAgent.match(/(Firefox|Chrome)\/(\d+\.)/))&&(r=c[1],o=parseInt(c[2])),i&&(!c||"Firefox"===r&&46<=o||"Chrome"===r&&50<=o)||(Cache.prototype.addAll=function(n){function r(e){this.name="NetworkError",this.code=19,this.message=e}var o=this;return r.prototype=Object.create(Error.prototype),Promise.resolve().then(function(){if(arguments.length<1)throw new TypeError;return n=n.map(function(e){return e instanceof Request?e:String(e)}),Promise.all(n.map(function(e){"string"==typeof e&&(e=new Request(e));var t=new URL(e.url).protocol;if("http:"!==t&&"https:"!==t)throw new r("Invalid scheme");return fetch(e.clone())}))}).then(function(e){if(e.some(function(e){return!e.ok}))throw new r("Incorrect response status");return Promise.all(e.map(function(e,t){return o.put(n[t],e)}))}).then(function(){})},Cache.prototype.add=function(e){return this.addAll([e])})},{}]},{},[13])(13)});