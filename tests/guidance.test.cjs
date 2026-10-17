const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
test('spoken and vibration cues occur only at phase changes, and preparation does not send repeated native calls',()=>{
 const calls=[],vibrations=[];let stops=0;
 const context={window:{speechSynthesis:{cancel(){stops++;},getVoices:()=>[],speak:voice=>calls.push(voice.text)},SpeechSynthesisUtterance:function(text){this.text=text;}},SpeechSynthesisUtterance:function(text){this.text=text;},navigator:{vibrate:p=>vibrations.push(p)},NativeClient:{available:()=>false},I18n:{currentLang:'en',t:key=>key},AudioManager:{enabled:true},GuideMath:{volume:()=>1}};
 const guide=vm.runInNewContext(fs.readFileSync('js/guidance.js','utf8')+'\nGuidance',context);
 guide.settings={voice:true,haptics:true};
 for(let i=0;i<20;i++)guide.phase({preparing:true,mode:'preparing'},{});
 assert.equal(stops,1);
 const inhale={mode:'running',preparing:false,cycle:1,phaseIndex:0,phase:{type:'inhale'}};
 guide.phase(inhale,{});guide.phase(inhale,{});assert.deepEqual(calls,['guide.cue.inhale']);
 guide.phase({...inhale,phaseIndex:1,phase:{type:'exhale'}},{});assert.equal(calls.length,2);
 guide.settings.quiet=true;guide.phase({...inhale,cycle:2},{});assert.equal(calls.length,2);
 guide.phase({...inhale,mode:'paused'},{});assert.ok(stops>1);
});
