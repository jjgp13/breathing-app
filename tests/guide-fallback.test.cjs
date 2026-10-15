const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup({ reduced = false, reject3d = false, create } = {}) {
    const nodes = new Map();
    const element = () => ({ hidden:false, style:{}, dataset:{}, textContent:'', disabled:false,
        attrs:{}, classList:{ toggle(){} },
        setAttribute(key,value){this.attrs[key]=value;},
        toggleAttribute(key,value){if(value)this.attrs[key]='';else delete this.attrs[key];}
    });
    for (const id of ['guideStage','bloom3d','simpleGuide','guideOrb','guideProgress','guideTimer','guideModeStatus']) nodes.set(id, element());
    const buttons = ['3d','simple'].map(mode => ({...element(),dataset:{guideMode:mode},addEventListener(){}}));
    let attempts = 0, renders = 0;
    const events = new Map();
    const context = {
        document:{ getElementById:id=>nodes.get(id), querySelectorAll:()=>buttons },
        window:{ addEventListener:(name,fn)=>events.set(name,fn), matchMedia:()=>({matches:reduced,addEventListener(){}}),
            Breathe3D:{async create(){ attempts++; if(reject3d)throw new Error('No WebGL'); return create ? create() : {update(){renders++;}};}} },
        localStorage:{getItem(){throw new Error('Storage disabled');}},
        I18n:{t:key=>key}
    };
    const guide = vm.runInNewContext(fs.readFileSync('js/breath-guide.js','utf8')+'\nBreathGuide',context);
    guide.init();
    return {guide,nodes,buttons,events,attempts:()=>attempts,renders:()=>renders};
}

test('reduced motion uses a stable circle, keeps words and countdown, and never starts WebGL', () => {
    const h=setup({reduced:true});
    h.guide.update({preparing:false,phaseIndex:0,phase:{type:'inhale'},progress:.75,remaining:1,mode:'running'}, {phases:[{type:'inhale'}]});
    assert.equal(h.attempts(),0);
    assert.equal(h.nodes.get('guideOrb').style.transform,'none');
    assert.equal(h.nodes.get('guideTimer').textContent,1);
    assert.equal(h.buttons[0].disabled,true);
});

test('a failed 3D load leaves a working simple guide without a retry loop', async () => {
    const h=setup({reject3d:true}); await h.guide.load(); await h.guide.load();
    assert.equal(h.attempts(),1);
    assert.equal(h.nodes.get('bloom3d').hidden,true);
    assert.equal('hidden' in h.nodes.get('simpleGuide').attrs,false);
    assert.equal(h.nodes.get('guideModeStatus').textContent,'guide.fallback');
});

test('loading 3D explicitly hides the SVG fallback and switching modes restores it', async () => {
    const h=setup(); await h.guide.load();
    assert.equal(h.nodes.get('bloom3d').hidden,false);
    assert.equal('hidden' in h.nodes.get('simpleGuide').attrs,true);
    h.guide.mode='simple'; h.guide.refreshMode();
    assert.equal(h.nodes.get('bloom3d').hidden,true);
    assert.equal('hidden' in h.nodes.get('simpleGuide').attrs,false);
    h.guide.update({preparing:false,phaseIndex:0,phase:{type:'inhale'},progress:.5,remaining:1,mode:'running'}, {phases:[{type:'inhale'}]});
    assert.equal(h.renders(),0);
});

test('navigating away while a model is loading disposes the late model', async () => {
    let resolve, destroyed=0;
    const h=setup({create:()=>new Promise(done=>{resolve=done;})});
    const pending=h.guide.load();
    h.events.get('pagehide')();
    resolve({destroy(){destroyed++;}});
    await pending;
    assert.equal(destroyed,1);
    assert.equal(h.guide.model,null);
});
