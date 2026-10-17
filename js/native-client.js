/** Native calls are available only inside the packaged, offline Android application. */
const NativeClient = {
    sequence:0,pending:new Map(),
    available(){return location.origin==='https://appassets.androidplatform.net'&&typeof window.BreatheAndroid?.postMessage==='function';},
    init(){window.addEventListener('breathe-native',event=>{
        const reply=event.detail,entry=this.pending.get(reply?.id);if(!entry)return;
        clearTimeout(entry.timeout);this.pending.delete(reply.id);
        if(reply.error)entry.reject(new Error(reply.error));else entry.resolve(reply.data);
    });},
    call(method,payload={}) {
        if(!this.available())return Promise.reject(new Error('nativeOnly'));
        const id=String(++this.sequence);
        return new Promise((resolve,reject)=>{
            const timeout=setTimeout(()=>{this.pending.delete(id);reject(new Error('timeout'));},120000);
            this.pending.set(id,{resolve,reject,timeout});
            try{window.BreatheAndroid.postMessage(JSON.stringify({id,method,payload}));}
            catch(error){clearTimeout(timeout);this.pending.delete(id);reject(error);}
        });
    }
};
