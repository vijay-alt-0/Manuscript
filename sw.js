const CACHE_NAME = "manuscript-v5-tools-fixed-1";
const LOCAL_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png"
];
const REMOTE_SHELL = [
  "https://unpkg.com/react@18.2.0/umd/react.production.min.js",
  "https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js",
  "https://unpkg.com/@babel/standalone@7.24.7/babel.min.js",
  "https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
];

self.addEventListener("install", event => {
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await cache.addAll(LOCAL_SHELL);
    await Promise.all(REMOTE_SHELL.map(async url=>{try{const r=await fetch(url,{mode:"cors",cache:"no-cache"});if(r.ok)await cache.put(url,r.clone());}catch(e){}}));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener("fetch", event => {
  const req=event.request;
  if(req.method!=="GET")return;
  event.respondWith((async()=>{
    const cached=await caches.match(req);
    if(cached)return cached;
    try{
      const response=await fetch(req);
      if(response && (response.ok || response.type==="opaque")){
        const cache=await caches.open(CACHE_NAME);
        cache.put(req,response.clone()).catch(()=>{});
      }
      return response;
    }catch(e){
      if(req.mode==="navigate")return caches.match("./index.html");
      throw e;
    }
  })());
});
