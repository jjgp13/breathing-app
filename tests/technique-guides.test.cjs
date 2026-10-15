const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const GuidePatterns=require('../js/guide-patterns.js');
const Guide2D=require('../js/guide2d.js');
const catalog=require('../js/techniques.js');
const en=require('../locales/en.json'),es=require('../locales/es.json');
const sample=(id,index,progress,reduced=false)=>GuidePatterns.sample(catalog[id],{
    phase:catalog[id].phases[index],phaseIndex:index,progress,mode:'running',preparing:false
},reduced);

async function model(id){
    const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');
    const {prepareModel}=await import('../js/guide-poses.mjs');
    const data=fs.readFileSync(`assets/models/techniques/${id}.glb`);
    const gltf=await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');
    prepareModel(gltf.scene,id);return gltf.scene;
}

test('every technique has its own localized 2D artwork and loadable, bounded Blender model',async()=>{
    const {Box3,Vector3}=await import('three');
    const artwork=new Set();
    assert.deepEqual([...GuidePatterns.ids].sort(),Object.keys(catalog).sort());
    for(const id of GuidePatterns.ids){
        artwork.add(Guide2D.artwork(id,'unique-'));
        assert.ok(en.guide.visuals[id].name&&es.guide.visuals[id].description);
        const root=await model(id),size=new Box3().setFromObject(root).getSize(new Vector3());
        assert.ok(size.x>.25&&size.y>.25&&(size.x>1||size.y>1)&&size.x<4&&size.y<4,`${id}: ${size.toArray()}`);
    }
    assert.equal(artwork.size,9);
});

test('sighing fills the main chamber before the top-up, then releases both together',()=>{
    const first=sample('cyclicSighing',0,1),startTop=sample('cyclicSighing',1,0),top=sample('cyclicSighing',1,1);
    assert.equal(first.main,1);assert.equal(first.top,0);
    assert.equal(startTop.main,first.main);assert.equal(startTop.top,first.top);
    assert.equal(top.main,1);assert.equal(top.top,1);
    const release=sample('cyclicSighing',2,.5);
    assert.equal(release.main,release.top);assert.ok(release.main<1&&release.main>0);
});

test('4–7–8 ring allocates time proportionally and keeps its lantern still during the hold',()=>{
    assert.equal(sample('fourSevenEight',0,1).cycle,4/19);
    assert.equal(sample('fourSevenEight',1,1).cycle,11/19);
    assert.equal(sample('fourSevenEight',2,1).cycle,1);
    assert.equal(sample('fourSevenEight',1,0).volume,sample('fourSevenEight',1,1).volume);
});

test('the box path joins all four corners continuously, including pauses',()=>{
    for(const [step,point] of [[0,[-1,1]],[.25,[1,1]],[.5,[1,-1]],[.75,[-1,-1]],[1,[-1,1]]]) assert.deepEqual(GuidePatterns.square(step),point);
    for(let i=0;i<3;i++)assert.equal(sample('box',i,1).boxStep,sample('box',i+1,0).boxStep);
});

test('humming ripples are restricted to the humming exhale and the feather rests in unpaced phases',()=>{
    assert.equal(sample('humming',0,.5).hum,null);assert.equal(sample('humming',1,.5).hum,.5);
    for(const i of [2,3])assert.equal(sample('buteyko',i,.75).feather,0);
    assert.ok(sample('buteyko',0,.75).feather>0);
});

test('count beads enumerate 30 breaths only during the power phase',()=>{
    for(let i=0;i<30;i++)assert.equal(sample('wimHof',0,(i+.25)/30).breath,i+1);
    assert.equal(sample('wimHof',0,1).breath,30);
    for(const i of [1,2,3])assert.equal(sample('wimHof',i,.5).breath,0);
});

test('every model accepts all phase endpoints and reduced motion keeps transforms stable',async()=>{
    const {poseModel}=await import('../js/guide-poses.mjs');
    for(const id of GuidePatterns.ids){
        const root=await model(id);
        const transforms=()=>{const list=[];root.traverse(o=>list.push([...o.position.toArray(),...o.scale.toArray(),...o.quaternion.toArray()]));return list;};
        for(let i=0;i<catalog[id].phases.length;i++)for(const progress of [0,.25,.5,1]){
            poseModel(root,sample(id,i,progress));
            assert.ok(transforms().flat().every(Number.isFinite),id);
        }
        poseModel(root,sample(id,0,.1,true));const rest=transforms();
        for(let i=0;i<catalog[id].phases.length;i++){
            poseModel(root,sample(id,i,.8,true));assert.deepEqual(transforms(),rest,id);
        }
    }
});

test('the belly widens and diaphragm descends as inhale progresses',async()=>{
    const {poseModel}=await import('../js/guide-poses.mjs');const root=await model('diaphragmatic');
    poseModel(root,sample('diaphragmatic',0,0));
    const before={width:root.getObjectByName('belly').scale.x,height:root.getObjectByName('diaphragm').position.y};
    poseModel(root,sample('diaphragmatic',0,1));
    assert.ok(root.getObjectByName('belly').scale.x>before.width);
    assert.ok(root.getObjectByName('diaphragm').position.y<before.height);
});
