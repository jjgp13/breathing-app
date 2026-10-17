/** Bounded, optional, local-only practice data. Health records never enter this store. */
const PracticeData = {
    defaults:()=>({version:1,remember:false,history:[],routines:[],comfort:{pace:1,avoidHolds:false,unpaced:false,minutes:3},access:{voice:false,haptics:false,dim:false,largeText:false,contrast:false,quiet:false}}),
    id:()=>globalThis.crypto?.randomUUID?.()||'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,10),
    validate(value,catalog) {
        const out=this.defaults(),v=value&&typeof value==='object'?value:{};
        out.remember=v.remember===true;
        for(const key of Object.keys(out.access))out.access[key]=v.access?.[key]===true;
        out.comfort=this.comfort(v.comfort);
        const validId=id=>typeof id==='string'&&Object.hasOwn(catalog,id);
        const finite=(n,min,max)=>Number.isFinite(n)&&n>=min&&n<=max;
        out.routines=(Array.isArray(v.routines)?v.routines:[]).filter(r=>r&&validId(r.techniqueId)&&/^[\w-]{1,80}$/.test(r.id)).slice(0,30).map(r=>({
            id:r.id,name:typeof r.name==='string'?r.name.trim().slice(0,60):'',techniqueId:r.techniqueId,
            favorite:r.favorite===true,cycles:finite(r.cycles,1,catalog[r.techniqueId].maxCycles)?Math.floor(r.cycles):catalog[r.techniqueId].defaultCycles,
            comfort:this.comfort(r.comfort),audio:{ambient:['off','rain','stream','tones'].includes(r.audio?.ambient)?r.audio.ambient:'off',ambientVolume:finite(r.audio?.ambientVolume,0,1)?r.audio.ambientVolume:.25,cueVolume:finite(r.audio?.cueVolume,0,1)?r.audio.cueVolume:.35},
            reminder:this.reminder(r.reminder)
        }));
        const ids=new Set();out.routines=out.routines.filter(r=>!ids.has(r.id)&&ids.add(r.id));
        if(out.remember)out.history=(Array.isArray(v.history)?v.history:[]).filter(s=>s&&validId(s.techniqueId)&&['settled','same','uncomfortable'].includes(s.outcome)&&finite(s.seconds,0,10800)&&typeof s.at==='string'&&Number.isFinite(Date.parse(s.at))).slice(-200).map(s=>({
            id:typeof s.id==='string'?s.id.slice(0,80):this.id(),techniqueId:s.techniqueId,outcome:s.outcome,seconds:Math.round(s.seconds),at:s.at,
            feeling:['tense','busy','sleep','low','curious'].includes(s.feeling)?s.feeling:null,unpaced:s.unpaced===true,completed:s.completed===true
        }));
        return out;
    },
    comfort(v={}) {return {pace:[.6,.8,1,1.2,1.4].includes(Number(v?.pace))?Number(v.pace):1,avoidHolds:v?.avoidHolds===true,unpaced:v?.unpaced===true,minutes:[1,3,5,10].includes(Number(v?.minutes))?Number(v.minutes):3};},
    reminder(v) {return v&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v.time)&&Array.isArray(v.days)&&v.days.some(d=>Number.isInteger(d)&&d>=0&&d<=6)?{time:v.time,days:[...new Set(v.days.filter(d=>Number.isInteger(d)&&d>=0&&d<=6))].sort()}:null;},
    create(storage,catalog) {
        let state=this.defaults(),persistent=true;
        try {state=this.validate(JSON.parse(storage.getItem('breathe-personal')||'null'),catalog);} catch {persistent=false;}
        const save=()=>{try{storage.setItem('breathe-personal',JSON.stringify(state));persistent=true;}catch{persistent=false;}return persistent;};
        return {
            get state(){return state;},get persistent(){return persistent;},
            update(patch){state=PracticeData.validate({...state,...patch},catalog);save();return state;},
            feedback(session,outcome,remember){
                if(!['settled','same','uncomfortable'].includes(outcome))return false;
                if(!remember)return true;
                state=PracticeData.validate({...state,remember:true,history:[...state.history,{...session,outcome,id:PracticeData.id(),at:new Date().toISOString()}]},catalog);save();return true;
            },
            putRoutine(routine){
                const list=state.routines.filter(r=>r.id!==routine.id);
                if(list.length>=30)return false;
                state=PracticeData.validate({...state,routines:[...list,routine]},catalog);save();return state.routines.some(r=>r.id===routine.id);
            },
            removeRoutine(id){state.routines=state.routines.filter(r=>r.id!==id);save();},
            clearHistory(){state.history=[];state.remember=false;save();},
            helpful(feeling,allowed){return [...state.history].reverse().find(s=>s.outcome==='settled'&&!s.unpaced&&s.feeling===feeling&&allowed.includes(s.techniqueId)&&Date.now()-Date.parse(s.at)<30*86400000)?.techniqueId;},
            export(){return JSON.stringify(state,null,2);}
        };
    },
    calendar(routine,title,now=new Date()) {
        const reminder=this.reminder(routine.reminder);if(!reminder)return null;
        const start=new Date(now),[h,m]=reminder.time.split(':').map(Number);
        start.setHours(h,m,0,0);
        for(let i=0;i<8&&(start<=now||!reminder.days.includes(start.getDay()));i++)start.setDate(start.getDate()+1);
        const local=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0'),'T',String(d.getHours()).padStart(2,'0'),String(d.getMinutes()).padStart(2,'0'),'00'].join('');
        const escape=s=>String(s).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/[,;]/g,'\\$&');
        const days=['SU','MO','TU','WE','TH','FR','SA'];
        const fold=line=>{let out='',length=0;for(const character of line){const bytes=new TextEncoder().encode(character).length;if(length+bytes>75){out+='\r\n ';length=1;}out+=character;length+=bytes;}return out;};
        return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Breathe//Personal practice//EN','BEGIN:VEVENT',`UID:${routine.id}@breathe.local`,`DTSTAMP:${now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART:${local(start)}`,'DURATION:PT5M',`RRULE:FREQ=WEEKLY;BYDAY=${reminder.days.map(d=>days[d]).join(',')}`,`SUMMARY:${escape(title)}`,`DESCRIPTION:${escape(routine.name||title)}\\nhttps://jjgp13.github.io/breathing-app/?routine=${routine.id}`,'BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY',`DESCRIPTION:${escape(title)}`,'END:VALARM','END:VEVENT','END:VCALENDAR',''].map(fold).join('\r\n');
    }
};
if(typeof module!=='undefined')module.exports=PracticeData;
