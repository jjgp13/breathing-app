const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const GuidePatterns=require('../js/guide-patterns.js');
const catalog=require('../js/techniques.js');
const en=require('../locales/en.json');

function setup(reduced=false) {
    const nodes=new Map();let motionChanged;
    const frames=[],mounted=[];
    const context={
        document:{getElementById(id){
            if(!nodes.has(id))nodes.set(id,{dataset:{},style:{},textContent:'',classList:{toggle(){}}});
            return nodes.get(id);
        }},
        window:{matchMedia:()=>({matches:reduced,addEventListener:(type,fn)=>{motionChanged=fn;}}),
            Breathe3D:{create(){throw new Error('Practice must not load WebGL');}}},
        localStorage:{getItem:()=> '3d'},
        I18n:{t:(key,args)=>key==='guide.breathCount'?`Breath ${args.count}`:key.split('.').reduce((v,k)=>v?.[k],en)},
        GuidePatterns,performance:{now:()=>100},
        Guide2D:{create:(host,id)=>{mounted.push(id);return {update:frame=>frames.push(frame),destroy(){}};}}
    };
    const guide=vm.runInNewContext(fs.readFileSync('js/breath-guide.js','utf8')+'\nBreathGuide',context);
    guide.init();
    return {guide,nodes,frames,mounted,motionChanged:matches=>motionChanged({matches})};
}
const snapshot=(tech,index=0,progress=.5,mode='running')=>({phase:tech.phases[index],phaseIndex:index,progress,remaining:2,preparing:false,mode});

test('all practices use matching 2D guides even with an old saved 3D preference',()=>{
    const h=setup();
    for(const tech of Object.values(catalog))h.guide.update(snapshot(tech),tech);
    assert.deepEqual(h.mounted,Object.keys(catalog));
    assert.equal(h.nodes.has('model3d'),false);
    assert.equal(h.nodes.get('guideTimer').textContent,2);
});

test('all phase cues are translated and distinguish the second inhale from the exhale',()=>{
    const h=setup(),sigh=catalog.cyclicSighing;
    for(const tech of Object.values(catalog))for(let i=0;i<tech.phases.length;i++){
        h.guide.update(snapshot(tech,i),tech);
        assert.ok(h.nodes.get('guideVisualDetail').textContent,`${tech.id}:${i}`);
    }
    h.guide.update(snapshot(sigh,1),sigh);
    assert.match(h.nodes.get('guideVisualDetail').textContent,/2 · One small top-up/);
    h.guide.update(snapshot(sigh,2),sigh);
    assert.match(h.nodes.get('guideVisualDetail').textContent,/3 · Both chambers release/);
});

test('pause preserves the pose and phase progress while clearing active movement instructions',()=>{
    const h=setup(),tech=catalog.box;
    h.guide.update(snapshot(tech),tech);
    const volume=h.frames.at(-1).volume;
    h.guide.update(snapshot(tech,0,.5,'paused'),tech);
    assert.equal(h.frames.at(-1).volume,volume);
    assert.equal(h.nodes.get('guidePhaseProgress').style.transform,'scaleX(0.5)');
    assert.equal(h.nodes.get('guideVisualDetail').textContent,'');
    h.guide.clear();assert.equal(h.guide.lastSnapshot,null);
});

test('changing reduced-motion preference stabilizes the illustration and keeps the countdown',()=>{
    const h=setup(),tech=catalog.box;
    h.guide.update(snapshot(tech),tech);
    h.motionChanged(true);
    assert.equal(h.frames.at(-1).volume,.45);
    assert.equal(h.frames.at(-1).boxStep,0);
    assert.equal(h.nodes.get('guidePhaseProgress').style.transform,'scaleX(0)');
    assert.equal(h.nodes.get('guideTimer').textContent,2);
    assert.match(h.nodes.get('guideModeStatus').textContent,/Reduced motion/);
});
