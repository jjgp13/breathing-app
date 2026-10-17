const SHELL='breathe-core-'+VERSION;
const scope=new URL('./',self.location.href);
const absolute=url=>new URL(url,scope).href;
const coreURLs=new Set(CORE.map(absolute));
self.addEventListener('install',event=>{event.waitUntil(caches.open(SHELL).then(cache=>cache.addAll(CORE.map(absolute))));});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
 const keep=new Set([SHELL,...Object.values(PACKS).map(p=>p.cache)]);
 for(const key of await caches.keys())if((key.startsWith('breathe-core-')||key.startsWith('breathe-audio-'))&&!keep.has(key))await caches.delete(key);
 await self.clients.claim();
})());});
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 if(request.mode==='navigate'){
  event.respondWith((async()=>{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),3000);try{const response=await fetch(request,{signal:controller.signal});if(response.ok)return response;}catch{}finally{clearTimeout(timeout);}return (await caches.open(SHELL)).match(absolute('index.html'));})());return;
 }
 if(coreURLs.has(url.href)){event.respondWith((async()=>{const cache=await caches.open(SHELL);return await cache.match(request)||fetch(request);})());return;}
 const pack=Object.values(PACKS).find(p=>absolute(p.url)===url.href);
 if(pack)event.respondWith((async()=>{const cache=await caches.open(pack.cache);return await cache.match(request)||fetch(request);})());
});
