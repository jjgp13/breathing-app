const Offline = {
    initialized:false,registration:null,installPrompt:null,
    async init(){
        this.initialized=true;
        window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();this.installPrompt=event;this.refresh();});
        document.getElementById('installApp').addEventListener('click',async()=>{if(this.installPrompt){await this.installPrompt.prompt();this.installPrompt=null;this.refresh();}});
        document.getElementById('updateApp').addEventListener('click',()=>{if(!App.state.isRunning)this.registration?.waiting?.postMessage({type:'ACTIVATE'});});
        window.addEventListener('online',()=>this.refresh());window.addEventListener('offline',()=>this.refresh());
        if(!NativeClient.available()&&'serviceWorker' in navigator){
            let controlled=!!navigator.serviceWorker.controller;
            navigator.serviceWorker.addEventListener('controllerchange',()=>{if(controlled&&!App.state.isRunning)location.reload();controlled=true;this.refresh();});
            try{
                this.registration=await navigator.serviceWorker.register('sw.js');
                this.registration.addEventListener('updatefound',()=>{this.registration.installing?.addEventListener('statechange',()=>this.refresh());});
                navigator.serviceWorker.ready.then(()=>this.refresh());
            }catch{this.failed=true;}
        }
        this.refresh();
    },
    async refresh(){
        if(!this.initialized)return;
        const generation=this.generation=(this.generation||0)+1;
        const native=NativeClient.available(),ready=native||!!navigator.serviceWorker?.controller;
        document.getElementById('offlineStatus').textContent=I18n.t(native?'offline.native':this.failed?'offline.unavailable':ready?(navigator.onLine?'offline.ready':'offline.offline'):'offline.preparing');
        document.getElementById('installApp').hidden=!this.installPrompt;
        document.getElementById('updateApp').hidden=!this.registration?.waiting;
        document.getElementById('updateApp').disabled=App.state.isRunning;
        const list=document.getElementById('offlinePacks');list.replaceChildren();
        for(const [id,pack] of Object.entries(OfflineAssets.packs)){
            const row=Everyday.node('article');row.className='saved-routine';
            let saved=native;
            try{if(!saved&&'caches' in window)saved=!!(await (await caches.open(pack.cache)).match(pack.url));}catch{}
            if(generation!==this.generation)return;
            row.append(Everyday.node('p',I18n.t('audio.tracks.'+id)+' · '+Math.ceil(pack.bytes/1024)+' KB'));
            const button=Everyday.button(saved?'offline.removeSound':'offline.saveSound',async()=>{
                button.disabled=true;
                try{
                    const cache=await caches.open(pack.cache);
                    if(saved)await caches.delete(pack.cache);
                    else {const response=await fetch(pack.url);if(!response.ok)throw new Error('Download failed');await cache.put(pack.url,response);}
                    await this.refresh();
                }catch{document.getElementById('offlineStatus').textContent=I18n.t('offline.downloadFailed');button.disabled=false;}
            });
            button.disabled=native||!('caches' in window);if(native)button.textContent=I18n.t('offline.bundled');row.append(button);list.append(row);
        }
    }
};
