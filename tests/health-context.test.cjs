const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('a late health read cannot replace a newer request or a cleared health view',async()=>{
 const requests=[],status={textContent:''};
 const ui=vm.runInNewContext(fs.readFileSync('js/everyday.js','utf8')+'\nEveryday',{
  document:{getElementById:()=>status,querySelectorAll:()=>[{dataset:{healthType:'sleep'}}]},
  I18n:{t:key=>key},NativeClient:{call:()=>new Promise(resolve=>requests.push(resolve))}
 });
 ui.renderContext=()=>{};
 const first=ui.connectHealth(false),second=ui.connectHealth(false);
 requests[1]({status:'ready',metrics:{sleep:{value:7}}});await second;
 requests[0]({status:'ready',metrics:{sleep:{value:4}}});await first;
 assert.equal(ui.health.metrics.sleep.value,7);
 const late=ui.connectHealth(false);ui.healthEpoch++;ui.health=null;
 requests[2]({status:'ready',metrics:{sleep:{value:9}}});await late;assert.equal(ui.health,null);
});
