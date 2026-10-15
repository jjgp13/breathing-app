const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function harness({saved=null,fail=false,fetcher}={}) {
    const nodes=[],timers=new Map(); let contexts=0,requests=0,id=0;
    const param=()=>({value:0,cancelScheduledValues(){},setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;},exponentialRampToValueAtTime(v){this.value=v;}});
    const node=()=>{const n={gain:param(),frequency:param(),connect(){},disconnect(){},start(...args){this.starts=args;},stop(...args){this.stops=args;}};nodes.push(n);return n;};
    const buffer=(channels,length,rate)=>{
        const data=Array.from({length:channels},()=>new Float32Array(length));
        return {numberOfChannels:channels,length,sampleRate:rate,getChannelData:c=>data[c]};
    };
    const context={state:'running',currentTime:2,destination:{},createGain:node,createOscillator:node,createBufferSource:node,createBuffer:buffer,decodeAudioData:async()=>buffer(2,1000,100)};
    const manager=vm.runInNewContext(fs.readFileSync('js/audio.js','utf8')+'\nAudioManager',{
        window:{AudioContext:function(){contexts++;return context;}},
        localStorage:{getItem:()=>JSON.stringify(saved),setItem(){}},
        fetch:async(...args)=>{requests++;if(fetcher)return fetcher(...args);if(fail)throw new Error('offline');return {ok:true,arrayBuffer:async()=>new ArrayBuffer(1)};},
        setTimeout:fn=>{timers.set(++id,fn);return id;},clearTimeout:key=>timers.delete(key)
    });
    const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
    manager.setup();
    return {manager,context,nodes,timers,flush,buffer,contexts:()=>contexts,requests:()=>requests};
}

test('page setup neither creates an audio context nor downloads recordings; preferences are bounded',()=>{
    const h=harness({saved:{ambient:'invalid',ambientVolume:500,cueVolume:-5,enabled:false}});
    assert.equal(h.contexts(),0);assert.equal(h.requests(),0);
    assert.equal(h.manager.settings.ambient,'off');assert.equal(h.manager.settings.ambientVolume,1);
    assert.equal(h.manager.settings.cueVolume,0);assert.equal(h.manager.enabled,false);
});

test('pause stops the ambient source and scheduled cues; resume and unmute create one new voice',async()=>{
    const h=harness();h.manager.configure({ambient:'tones'});h.manager.startSession();await h.flush();
    const first=h.manager.voice;assert.equal(first.nodes.length,3);
    h.manager.playPhaseSound('inhale');const cues=[...h.manager.cues];assert.equal(cues.length,2);
    h.manager.setPaused(true);
    assert.equal(h.manager.voice,null);assert.equal(h.manager.cues.size,0);
    first.nodes.forEach(n=>assert.ok(n.stops));cues.forEach(c=>assert.ok(c.oscillator.stops));
    h.manager.playPhaseSound('exhale');assert.equal(h.manager.cues.size,0);
    h.manager.setPaused(false);await h.flush();assert.ok(h.manager.voice);
    h.manager.toggle();assert.equal(h.manager.voice,null);
    h.manager.toggle();await h.flush();assert.equal(h.manager.voice.nodes.length,3);
    h.manager.stop();assert.equal(h.manager.role,'idle');
});

test('a recording that finishes loading after stop cannot start playback',async()=>{
    let resolve;
    const h=harness({fetcher:()=>new Promise(done=>{resolve=done;})});
    h.manager.configure({ambient:'rain'});h.manager.startSession();await h.flush();
    h.manager.stop();resolve({ok:true,arrayBuffer:async()=>new ArrayBuffer(1)});await h.flush();
    assert.equal(h.manager.voice,null);assert.equal(h.manager.status,'idle');
    assert.equal(h.nodes.filter(n=>n.starts).length,0);
});

test('rapid track changes cannot let an earlier recording replace the current choice',async()=>{
    let resolve;
    const h=harness({fetcher:()=>new Promise(done=>{resolve=done;})});
    h.manager.configure({ambient:'rain'});h.manager.startSession();await h.flush();
    h.manager.configure({ambient:'tones'});await h.flush();
    const current=h.manager.voice;
    resolve({ok:true,arrayBuffer:async()=>new ArrayBuffer(1)});await h.flush();
    assert.equal(h.manager.voice,current);assert.equal(current.nodes.length,3);
});

test('preview expires and closing/canceling it clears its timer and sources',async()=>{
    const h=harness();h.manager.configure({ambient:'tones'});h.manager.preview();await h.flush();
    assert.equal(h.manager.role,'preview');assert.equal(h.timers.size,1);
    [...h.timers.values()][0]();assert.equal(h.manager.role,'idle');assert.equal(h.manager.voice,null);
    h.manager.preview();await h.flush();h.manager.endPreview();
    assert.equal(h.timers.size,0);assert.equal(h.manager.voice,null);
    h.manager.preview();await h.flush();h.manager.configure({ambient:'off'});
    assert.equal(h.manager.role,'idle');assert.equal(h.timers.size,0);
});

test('failed audio loads leave the session available and remove the failed cache entry',async()=>{
    const h=harness({fail:true});h.manager.configure({ambient:'rain'});h.manager.startSession();await h.flush();
    assert.equal(h.manager.status,'unavailable');assert.equal(h.manager.role,'session');assert.equal(h.manager.voice,null);
    assert.equal(h.manager.buffers.has('rain'),false);
    h.manager.configure({ambient:'tones'});await h.flush();assert.equal(h.manager.status,'playing');
});

test('switching from muted to cues-only unlocks audio without downloading a recording',async()=>{
    const h=harness({saved:{enabled:false,ambient:'off'}});h.manager.startSession();await h.flush();
    assert.equal(h.contexts(),0);h.manager.toggle();await h.flush();
    h.manager.playPhaseSound('inhale');assert.equal(h.contexts(),1);assert.equal(h.requests(),0);assert.equal(h.manager.cues.size,2);
});

test('loop preparation blends a smooth seam and bounds amplitude on both channels',async()=>{
    const h=harness();await h.manager.init();const input=h.buffer(2,1000,100);
    for(let c=0;c<2;c++)for(let i=0;i<1000;i++)input.getChannelData(c)[i]=(i/999*2-1)*(c?0.5:1);
    const loop=h.manager.prepareLoop(input);assert.equal(loop.length,850);
    let energy=0;
    for(let c=0;c<2;c++){
        const data=loop.getChannelData(c);
        assert.ok(Math.abs(data[0]-data[data.length-1])<.005);
        for(const value of data){assert.ok(Number.isFinite(value));assert.ok(Math.abs(value)<=.600001);energy+=value*value;}
    }
    assert.ok(Math.sqrt(energy/(loop.length*2))<=.120001);
});
