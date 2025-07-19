// I realy liked the source code quoted in stackoverflow https://stackoverflow.com/questions/58288247/struggling-with-understanding-why-my-service-worker-isnt-working-uncaught-in
// this approach is vanilla so there is no need of an extra build step with workbox library in the python environement of Material for MkDocs.
// It seems the source code quoted is an early version of the boilerplate from Microsoft under MIT https://github.com/pwa-builder/PWABuilder/blob/main/LICENSE.txt  see commit 1255fb4b98d6b64be47006f79fbb2711ef6192ef
// Vanilla is also used on https://github.com/uni-notes/uni-notes/ too.
// (although workbox would save a lot of works and it is used on other mkdocs blogs like https://github.com/Snickdx/pwadocs)


const CACHE = "pwabuilder-offline-page";
const bc = new BroadcastChannel("cacheRequest");

bc.onmessage = async (event) => {
  const { data } = event;
  if (data.action === 'upgradeCache') {
    upgradeCache(event)
  }
};


function upgradeCache(event) {

  //event.waitUntil(
    caches.open(CACHE).then(async  (cache) => {
      console.log("[PWA Builder] Trying to cache pages offline");
      const batchSize = 45;
      const timestamp = await cache.match('/time-cached').then(response=>Date.parse(response?.text()))
      const lastCached = new Date(timestamp);
      
      const urlsPromise = fetch('/sitemap.xml')
        .then(response=>response.text())
        .then((xmlString) => {
          const urls = xmlString.match(/<loc>(.*?)<\/loc>/g).map(match => match.replace(/<\/?loc>/g, ''))
          const lastmod = xmlString.match(/<lastmod>(.*?)<\/lastmod>/g).map(match => match.replace(/<\/?lastmod>/g, '')).map(dateString => new Date(dateString))
          return urls.filter((url, index) => isNaN(timestamp) || lastmod[index] > lastCached);
        })

        urlsPromise.then(async urls => {for (let i = 0; i < urls.length; i += batchSize) {
          console.log(`[PWA Builder] Refresh caching ${i}/${urls.length}`);
          await cache.addAll(urls.slice(i, i + batchSize));
        }});
      cache.put('/time-cached', new Response(new Date().toISOString().substring(0,10)));
    })
  //);
}


// If any fetch fails, it will look for the request in the cache and serve it from there first
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;


  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        if (response.status != 200) {
          throw response;
        }
        console.log("[PWA Builder] add page to offline cache: " + response.url);

        // If request was success, add or update it in the cache
        event.waitUntil(updateCache(event.request, response.clone()));

        return response;
      })
      .catch(function (error) {
        console.log("[PWA Builder] Network request Failed. Serving content from cache: " + error);
        return fromCache(event.request);
      })
  );
});

function fromCache(request) {
  // Check to see if you have it in the cache
  // Return response
  // If not in the cache, then return the offline page
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request, {ignoreSearch: true}).then(function (matching) {
      if (!matching || matching.status === 404) {
        return Promise.reject("no-match");
      }

      return matching;
    });
  });
}

function updateCache(request, response) {
  return caches.open(CACHE).then(function (cache) {
    return cache.put(request, response);
  });
}
