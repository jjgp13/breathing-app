/** Pose Blender-authored parts without a second clock or free-running effects. */
export const requiredParts = {
    box:['marker','rail_0','rail_1','rail_2','rail_3'],
    fourSevenEight:['cadence_marker','lantern','arc_0','arc_1','arc_2'],
    diaphragmatic:['belly','diaphragm','torso'], resonance:['tide','buoy'],
    wimHof:['breath_core',...Array.from({length:30},(_,i)=>'bead_'+i)],
    buteyko:['feather','quill','rest'],
    cyclicSighing:['main_shell','main_fill','top_shell','top_fill'],
    extendedExhale:['upper_fill','lower_fill','flow'],
    humming:['bowl','breath_pearl','sound_ring_0','sound_ring_1','sound_ring_2']
};

export function prepareModel(model,id) {
    const parts=new Map(),originals=new Set();
    model.traverse(child=>{
        parts.set(child.name,child);
        if(child.material){
            const materials=Array.isArray(child.material)?child.material:[child.material];
            const clones=materials.map(material=>{
                originals.add(material);
                const clone=material.clone();clone.transparent=true;
                clone.opacity=child.name.endsWith('_shell')?.18:1;
                clone.depthWrite=!child.name.endsWith('_shell');
                return clone;
            });
            child.material=Array.isArray(child.material)?clones:clones[0];
        }
    });
    originals.forEach(material=>material.dispose());
    for(const name of requiredParts[id]||[])if(!parts.has(name))throw new Error('Missing guide part: '+name);
    model.userData.guideParts=parts;
}

function opacity(object,value) {
    const materials=Array.isArray(object.material)?object.material:[object.material];
    materials.filter(Boolean).forEach(material=>material.opacity=value);
}

export function poseModel(model,frame) {
    const part=name=>model.userData.guideParts.get(name);
    const v=frame.volume;
    switch(frame.id){
        case 'box': {
            const p=frame.boxStep*4,side=Math.min(3,Math.floor(p)),t=p-side;
            const points=[[-1.3,1.3],[1.3,1.3],[1.3,-1.3],[-1.3,-1.3],[-1.3,1.3]];
            const a=points[side],b=points[side+1];
            part('marker').position.set(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,.12);
            for(let i=0;i<4;i++)opacity(part('rail_'+i),i===frame.index&&!frame.preparing?.95:.36);
            break;
        }
        case 'fourSevenEight': {
            const a=frame.cycle*Math.PI*2;
            part('cadence_marker').position.set(Math.sin(a)*1.38,Math.cos(a)*1.38,.12);
            part('lantern').scale.set(.3+.4*v,.3+.4*v,.3);
            for(let i=0;i<3;i++)opacity(part('arc_'+i),i===frame.index&&!frame.preparing?1:.35);
            break;
        }
        case 'diaphragmatic':
            part('belly').scale.set(.62+.18*v,.5+.06*v,.28+.15*v);
            part('diaphragm').position.y=-.25*v;
            part('diaphragm').scale.y=1-.55*v;
            break;
        case 'resonance':part('tide').position.y=-.55+1.1*v;break;
        case 'wimHof':
            part('breath_core').scale.setScalar(.28+.35*v);
            for(let i=0;i<30;i++){
                const bead=part('bead_'+i),active=frame.breath===i+1;
                bead.scale.setScalar(active?.105:.073);
                opacity(bead,active?1:frame.breath>i+1?.58:.22);
            }
            break;
        case 'buteyko':
            part('feather').position.y=.12*frame.feather;
            part('feather').rotation.z=-.10*frame.feather;
            break;
        case 'cyclicSighing':
            part('main_fill').scale.set(.82*(.18+.66*frame.main),.70*(.18+.66*frame.main),.60*(.18+.66*frame.main));
            part('top_fill').scale.set(.44*(.18+.66*frame.top),.38*(.18+.66*frame.top),.36*(.18+.66*frame.top));
            break;
        case 'extendedExhale':
            part('upper_fill').scale.set(.25+.4*v,.12+.28*v,.24);
            part('lower_fill').scale.set(.25+.4*(1-v),.12+.28*(1-v),.24);
            opacity(part('flow'),frame.preparing?.15:.65);
            break;
        case 'humming':
            part('breath_pearl').scale.setScalar(.16+.14*v);
            for(let i=0;i<3;i++){
                const ring=part('sound_ring_'+i);
                ring.visible=frame.hum!==null;
                const ripple=frame.hum===null?0:(1-Math.cos(frame.hum*Math.PI*6-i*.8))/2;
                ring.scale.setScalar(.9+.22*ripple);
                opacity(ring,.35+.4*ripple);
            }
            break;
    }
}
