// This is an original service worker with warmup from sitemap, and with offline copy of pages.

if ("serviceWorker" in navigator) {
  if (navigator.serviceWorker.controller) {
    console.log("[PWA Builder] active service worker found, no need to register");
  } else {
    // Register the service worker
    navigator.serviceWorker
      .register("/service_worker.js", {
        scope: "./"
      })
      .then(function (reg) {
        console.log("[PWA Builder] Service worker has been registered for scope: " + reg.scope);
      });
  }

    // Listen for messages from the service worker
    const bc = new BroadcastChannel("cacheRequest");

    
    window.addEventListener("appinstalled", () => {
      bc.postMessage({ action: "upgradeCache" });
    });

    document.addEventListener('DOMContentLoaded', () => {
      const paragraph = document.querySelector('.md-social');
      if (paragraph) {
        const actions = {'⟳':'upgradeCache'};
        for (const key in actions) {
          const button = document.createElement('a');
          button.innerHTML = key;
          button.href = "#";
          button.onclick = (e) => {
            e.preventDefault(); 
            new Promise(()=> {
              if (confirm(actions[key])) {
                bc.postMessage({ action: actions[key] });
              }
            }) ;
            return false;
          };
          paragraph.appendChild(button);
        }
      }
    });
}
