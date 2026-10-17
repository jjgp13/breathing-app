const {test}=require('node:test');
const assert=require('node:assert/strict');
const Data=require('../js/practice-store.js');
const Profile=require('../js/practice-profile.js');
const catalog=require('../js/techniques.js');
function memory(initial=null){let text=initial,writes=0;return {getItem:()=>text,setItem:(key,value)=>{text=value;writes++;},get text(){return text;},get writes(){return writes;}};}
const session={techniqueId:'diaphragmatic',feeling:'tense',seconds:30,completed:false,unpaced:false};
const routine=(id='routine-1')=>({id,name:'Evening practice',techniqueId:'diaphragmatic',cycles:3,comfort:{pace:.8},audio:{ambient:'rain'},reminder:{time:'20:00',days:[1,2,3,4,5]}});

test('feedback is unsaved by default and skipping a later reflection preserves prior history',()=>{
 const storage=memory(),store=Data.create(storage,catalog);
 store.feedback(session,'settled',false);assert.equal(storage.writes,0);assert.equal(store.state.history.length,0);
 store.feedback(session,'settled',true);assert.equal(store.state.history.length,1);
 store.feedback(session,'same',false);assert.equal(store.state.history.length,1);assert.equal(store.state.history[0].outcome,'settled');
});
test('opt-in persistence stores only the bounded reflection schema, never attached health data',()=>{
 const storage=memory(),store=Data.create(storage,catalog);
 for(let i=0;i<205;i++)store.feedback({...session,health:{hrv:45},rawRecords:['private']},'settled',true);
 assert.equal(store.state.history.length,200);assert.ok(!storage.text.includes('hrv'));assert.ok(!storage.text.includes('rawRecords'));
 assert.equal(Data.create(storage,catalog).state.history.length,200);
 store.update({remember:false});assert.equal(store.state.history.length,0);
});
test('routine validation rejects unknown techniques and invalid reminders, and keeps a bounded collection',()=>{
 const store=Data.create(memory(),catalog);
 assert.equal(store.putRoutine({...routine(),techniqueId:'constructor'}),false);
 for(let i=0;i<30;i++)assert.equal(store.putRoutine(routine('r'+i)),true);
 assert.equal(store.putRoutine(routine('overflow')),false);
 assert.equal(store.putRoutine({...routine('r0'),name:'Changed',reminder:{time:'99:00',days:[9]}}),true);
 assert.equal(store.state.routines.find(r=>r.id==='r0').reminder,null);
 store.clearHistory();assert.equal(store.state.routines.length,30);
});
test('corrupt or unavailable storage leaves usable memory-only routines',()=>{
 const store=Data.create({getItem(){throw new Error('Blocked');},setItem(){throw new Error('Full');}},catalog);
 assert.equal(store.persistent,false);assert.equal(store.putRoutine(routine()),true);assert.equal(store.state.routines.length,1);assert.equal(store.persistent,false);
 const corrupt=Data.create(memory('{broken'),catalog);assert.equal(corrupt.state.history.length,0);
});
test('personalized suggestions use only a recent matching feeling within the supplied gentle candidates',()=>{
 const store=Data.create(memory(),catalog);store.feedback(session,'settled',true);
 assert.equal(store.helpful('tense',['diaphragmatic','cyclicSighing']),'diaphragmatic');
 assert.equal(store.helpful('busy',['diaphragmatic']),undefined);assert.equal(store.helpful('tense',['wimHof']),undefined);
 store.feedback({...session,techniqueId:'cyclicSighing',unpaced:true},'settled',true);
 assert.equal(store.helpful('tense',['cyclicSighing']),undefined);
});
test('calendar files escape user content, use local wall time and include only chosen weekdays',()=>{
 const r={...routine(),name:'Calm,\nBEGIN:OTHER;'};
 const text=Data.calendar(r,'Breathe',new Date(2026,9,16,21,0));
 assert.match(text,/DTSTART:20261019T200000/);assert.match(text,/BYDAY=MO,TU,WE,TH,FR/);
 assert.match(text,/DESCRIPTION:Calm\\,\\nBEGIN:OTHER\\;/);assert.equal((text.match(/BEGIN:VEVENT/g)||[]).length,1);
 assert.equal(Data.calendar({...r,reminder:null},'Breathe'),null);
 const long=Data.calendar({...r,name:'呼吸'.repeat(30)},'Breathe');
 for(const line of long.split('\r\n'))assert.ok(Buffer.byteLength(line,'utf8')<=75);
});
test('comfort pacing preserves phase order and proportions without mutating reference protocols',()=>{
 for(const base of Object.values(catalog)){
  const original=JSON.stringify(base),profile=Profile.build(base,{pace:.8});
  assert.equal(JSON.stringify(base),original);
  assert.deepEqual(profile.phases.map(p=>p.type),base.phases.map(p=>p.type));
  for(let i=0;i<base.phases.length;i++)assert.equal(profile.phases[i].duration,base.advanced?base.phases[i].duration:Math.round(base.phases[i].duration*.8*10)/10);
 }
});
test('an unpaced session uses one session-duration clock and does not emit guided breathing phases',()=>{
 const Session=require('../js/session.js');let now=0,completed=0;const cues=[];
 const profile=Profile.build(catalog.diaphragmatic,{unpaced:true});
 const clock=new Session({...profile,phases:[{type:'easy',duration:60}]},1,{preparationSeconds:0,now:()=>now,request:()=>1,cancel(){},onCue:s=>cues.push(s.phase.type),onComplete:()=>completed++});
 clock.start();clock.advance(30000);assert.equal(clock.snapshot().remaining,30);assert.deepEqual(cues,['easy']);
 clock.advance(30000);assert.equal(completed,1);assert.equal(clock.snapshot().practiceSeconds,60);
});
