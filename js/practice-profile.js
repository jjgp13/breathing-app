/** Adaptations are explicit; the reference technique and research copy stay intact. */
const PracticeProfile = {
    build(base,options={}) {
        const pace=base.advanced?1:[.6,.8,1,1.2,1.4].includes(Number(options.pace))?Number(options.pace):1;
        return {...base,unpaced:options.unpaced===true,minutes:[1,3,5,10].includes(Number(options.minutes))?Number(options.minutes):3,adapted:pace!==1,pace,
            phases:base.phases.map(p=>({...p,duration:Math.round(p.duration*pace*10)/10}))};
    },
    timings(technique){return Object.fromEntries(technique.phases.map(p=>[p.type,Number(p.duration.toFixed(1))]));},
    name(technique){return technique.unpaced?I18n.t('personal.unpaced'):I18n.getTechnique(technique.id,'name');}
};
if(typeof module!=='undefined')module.exports=PracticeProfile;
