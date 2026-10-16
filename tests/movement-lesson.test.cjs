const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function setup({reduced=false,create}={}){
    const events=new Map(),nodes=new Map(),frames=[];
    let attempts=0,destroyed=0,motionChanged;
    const node=id=>{
        if(!nodes.has(id))nodes.set(id,{open:false,hidden:false,textContent:'',setAttribute(){},
            addEventListener:(event,fn)=>events.set(id+':'+event,fn),querySelector:()=>({setAttribute(){}}),
            showModal(){this.open=true;},close(){this.open=false;events.get(id+':close')?.();}});
        return nodes.get(id);
    };
    const context={
        document:{getElementById:node,querySelectorAll:()=>[],addEventListener(){},hidden:false},
        window:{addEventListener(){},matchMedia:()=>({matches:reduced,addEventListener:(type,fn)=>{motionChanged=fn;}}),
            Breathe3D:{async create(){attempts++;return create?create():{setView(){},update:frame=>frames.push(frame),destroy(){destroyed++;}};}}},
        performance:{now:()=>100},requestAnimationFrame(){throw new Error('No automatic animation during a lesson');},cancelAnimationFrame(){},
        Guide2D:{create:()=>({update:frame=>frames.push(frame),destroy(){}})},I18n:{t:key=>key}
    };
    const lesson=vm.runInNewContext(fs.readFileSync('js/movement-lesson.js','utf8')+'\nMovementLesson',context);
    lesson.init();
    return {lesson,nodes,frames,attempts:()=>attempts,destroyed:()=>destroyed,motionChanged:matches=>motionChanged({matches})};
}

test('a reduced-motion lesson never loads WebGL and compares explicit still positions',()=>{
    const h=setup({reduced:true});h.lesson.open();
    h.lesson.select('inhale');assert.equal(h.frames.at(-1).volume,1);
    h.lesson.select('exhale');assert.equal(h.frames.at(-1).volume,0);
    assert.equal(h.attempts(),0);
    assert.equal(h.nodes.get('lessonStatus').textContent,'lesson.reduced');
});

test('closing during a model download disposes the late model and leaves the lesson closed',async()=>{
    let resolve,destroyed=0;
    const h=setup({create:()=>new Promise(done=>{resolve=done;})});
    h.lesson.open();h.lesson.dialog.close();
    resolve({destroy(){destroyed++;}});
    await new Promise(setImmediate);
    assert.equal(destroyed,1);assert.equal(h.lesson.model,null);assert.equal(h.lesson.dialog.open,false);
});

test('a WebGL failure leaves the comparison diagram usable with a clear explanation',async()=>{
    const h=setup({create:()=>{throw new Error('No WebGL');}});h.lesson.open();
    await new Promise(setImmediate);
    assert.equal(h.nodes.get('lessonModel').hidden,true);
    assert.equal(h.nodes.get('lessonDiagram').hidden,false);
    assert.equal(h.nodes.get('lessonStatus').textContent,'lesson.fallback');
    h.motionChanged(true);h.lesson.select('inhale');assert.equal(h.frames.at(-1).volume,1);
});

test('opening a lesson does not autoplay and switching to reduced motion releases the renderer',async()=>{
    const h=setup();h.lesson.open();await new Promise(setImmediate);
    assert.equal(h.attempts(),1);assert.equal(h.nodes.get('lessonModel').hidden,false);
    assert.ok(h.frames.every(frame=>frame.volume===0));
    h.motionChanged(true);
    assert.equal(h.destroyed(),1);assert.equal(h.lesson.model,null);
    assert.equal(h.nodes.get('lessonDiagram').hidden,false);
    h.lesson.dialog.close();assert.equal(h.lesson.diagram,null);
});
