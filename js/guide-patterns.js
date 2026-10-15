/** A shared visual score: both renderers receive the same phase-derived pose. */
const PatternMath=typeof module!=='undefined'?require('./breath-guide.js'):GuideMath;
const GuidePatterns = {
    ids: ['box','fourSevenEight','diaphragmatic','resonance','wimHof','buteyko','cyclicSighing','extendedExhale','humming'],
    sample(technique, snapshot, reduced = false) {
        const id = this.ids.includes(technique.id) ? technique.id : 'resonance';
        const phase = snapshot.phase || technique.phases[snapshot.phaseIndex || 0];
        const progress = Math.min(1,Math.max(0,snapshot.progress || 0));
        const preparing = !!snapshot.preparing;
        const index = snapshot.phaseIndex || 0;
        const volume = reduced ? 0.45 : preparing ? 0 : PatternMath.volume(technique,index,progress);
        const duration = technique.phases.reduce((sum,p)=>sum+p.duration,0);
        const before = technique.phases.slice(0,index).reduce((sum,p)=>sum+p.duration,0);
        const cycle = reduced || preparing ? 0 : (before+phase.duration*progress)/duration;
        const power = !reduced && !preparing && phase.type==='power';
        const breath = power ? Math.min(30,Math.floor(progress*30)+1) : 0;
        let main=volume,top=volume;
        if (!reduced && id==='cyclicSighing' && phase.type!=='exhale') {
            main=Math.min(1,volume/0.72); top=Math.max(0,(volume-0.72)/0.28);
        }
        const featherRest = preparing || ['hold','easy'].includes(phase.type);
        return { id, phase:phase.type, index, progress:reduced||preparing?0:progress,
            volume, cycle, breath, main, top, reduced, preparing,
            boxStep:reduced||preparing?0:(index+progress)/4,
            feather:reduced?0:featherRest?0:volume,
            hum:!reduced&&!preparing&&phase.type==='hum' ? progress : null };
    },

    square(progress, size = 1) {
        const point = ((progress % 1)+1)%1*4;
        if(point<1)return [-size+point*size*2,size];
        if(point<2)return [size,size-(point-1)*size*2];
        if(point<3)return [size-(point-2)*size*2,-size];
        return [-size,-size+(point-3)*size*2];
    }
};
if(typeof module!=='undefined')module.exports=GuidePatterns;
