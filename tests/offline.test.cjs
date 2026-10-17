const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
function setup(){
 const events=new Map(),stores=new Map(),deleted=[];let online=false;
 const cache=name=>{if(!stores.has(name))stores.set(name,new Map());return {match:async key=>stores.get(name).get(typeof key==='string'?key:key.url),addAll:async urls=>urls.forEach(url=>stores.get(name).set(url,{ok:true,source:url}))};};
 const self={location:{href:'https://example.test/breathing-app/sw.js'},clients:{claim:async()=>{}},addEventListener:(name,fn)=>events.set(name,fn),skipWaiting(){}};
 const context={self,URL,Set,AbortController,setTimeout,clearTimeout,caches:{open:async name=>cache(name),keys:async()=>[...stores.keys()],delete:async name=>{deleted.push(name);return stores.delete(name);}},fetch:async request=>{if(!online)throw new Error('Offline');return {ok:true,source:request.url||request};}};
 vm.runInNewContext(fs.readFileSync('sw.js','utf8'),context);
 const dispatch=async(type,event={})=>{let promise;events.get(type)({...event,waitUntil:p=>{promise=p;},respondWith:p=>{promise=p;}});return promise&&await promise;};
 return {stores,deleted,dispatch,online:()=>{online=true;}};
}
test('the complete core is installed atomically and serves an offline navigation under a project subpath',async()=>{
 const h=setup();await h.dispatch('install');
 const result=await h.dispatch('fetch',{request:{url:'https://example.test/breathing-app/?routine=local',method:'GET',mode:'navigate'}});
 assert.equal(result.source,'https://example.test/breathing-app/index.html');
 const core=[...h.stores.values()][0];assert.ok([...core.keys()].some(url=>url.includes('js/vendor/swiper.js')));assert.ok([...core.keys()].some(url=>url.includes('js/everyday.js')));
 assert.ok(![...core.keys()].some(url=>url.includes('.ogg')));
});
test('offline worker ignores third-party and non-GET requests, and preserves unrelated caches',async()=>{
 const h=setup();h.stores.set('another-app',new Map());h.stores.set('breathe-core-old',new Map());await h.dispatch('install');await h.dispatch('activate');
 assert.ok(h.stores.has('another-app'));assert.ok(h.deleted.includes('breathe-core-old'));
 assert.equal(await h.dispatch('fetch',{request:{url:'https://third.party/private',method:'GET',mode:'cors'}}),undefined);
 assert.equal(await h.dispatch('fetch',{request:{url:'https://example.test/breathing-app/private',method:'POST',mode:'cors'}}),undefined);
});
test('generated offline assets have no external core dependencies and optional sounds stay separately versioned',()=>{
 const html=fs.readFileSync('index.html','utf8');assert.ok(!/<(?:script|link)[^>]+(?:src|href)="https:/.test(html));
 const context={};const assets=vm.runInNewContext(fs.readFileSync('js/offline-assets.generated.js','utf8')+'\nOfflineAssets',context);
 for(const [id,pack]of Object.entries(assets.packs)){assert.match(pack.cache,new RegExp('^breathe-audio-'+id+'-'));assert.ok(pack.bytes>1000);assert.ok(fs.existsSync(pack.url));}
});
