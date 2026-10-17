// Generated; rebuild with npm run build.
const VERSION='3e77c550c43f0c49';
const CORE=["./","index.html","manifest.webmanifest","assets/icons/breathe.svg","assets/icons/icon-192.png","assets/icons/icon-512.png","css/vendor/swiper.css?v=96ec55ae706747dc","css/main.css?v=4374a3aed9baeb74","css/backgrounds.css?v=83a76d7eecf0367a","css/components.css?v=74cde4f99d935d49","css/guide.css?v=957ca6dbd8de4ded","css/audio.css?v=0972cfc1a52f9f7c","css/everyday.css?v=abfc4d3a48913353","js/vendor/swiper.js?v=73203b5c5f70f45b","js/vendor/gsap.js?v=92bb9a96476f983d","js/locales.generated.js?v=dd3ae2430e482f34","js/i18n.js?v=cfa4e5cda5a13b57","js/techniques.js?v=dea35a88a2b649b1","js/audio.js?v=ac21df3085eff6c2","js/audio-ui.js?v=cc34a8c7fdeae94b","js/backgrounds.js?v=f043fc3b6b28502c","js/session.js?v=12825d78fe2793c7","js/recommendations.js?v=78c1729da8907cd5","js/breath-guide.js?v=a389911680a67018","js/guide-patterns.js?v=8b20aa0cab092674","js/guide2d.js?v=f3f0a6aebec0d20e","js/movement-lesson.js?v=2bb96b479ed2e15d","js/practice-store.js?v=0aeeaa56f8d8bae0","js/practice-profile.js?v=49b0637ba3aaaba0","js/native-client.js?v=b2656ff937a6ae69","js/guidance.js?v=e576a7178ac96620","js/offline-assets.generated.js?v=7e7b5ff72de1e100","js/offline.js?v=952bc7e5ddfbfde3","js/everyday.js?v=617879480227e01b","js/app.js?v=c704c3c9be1208f0"];
const PACKS={"rain":{"url":"assets/audio/rain.ogg","cache":"breathe-audio-rain-c34d12243125c28f","bytes":198913},"stream":{"url":"assets/audio/stream.ogg","cache":"breathe-audio-stream-b71def4798508e58","bytes":1092440}};
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
