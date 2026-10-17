/** Personal practice tools; the only health context is held in this page's memory. */
const Everyday = {
    pending:null,health:null,manual:{sleep:null,activity:''},
    init(){
        NativeClient.init();
        let storage;try{storage=window.localStorage;}catch{storage={getItem(){throw new Error('Storage unavailable');},setItem(){throw new Error('Storage unavailable');}};}
        this.store=PracticeData.create(storage,techniques);
        Guidance.configure(this.store.state.access);
        const open=(selector,id,refresh)=>document.querySelectorAll(selector).forEach(button=>button.addEventListener('click',()=>{refresh?.();document.getElementById(id).showModal();}));
        open('[data-open-personal]','personalDialog',()=>this.renderPersonal());
        open('[data-open-access]','accessDialog',()=>this.renderAccess());
        open('[data-open-offline]','offlineDialog',()=>Offline.refresh());
        open('[data-open-context]','contextDialog',()=>this.renderContext());
        document.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
        document.querySelectorAll('[data-access]').forEach(input=>input.addEventListener('change',()=>{
            this.store.update({access:{...this.store.state.access,[input.dataset.access]:input.checked}});Guidance.configure(this.store.state.access);this.renderAccess();this.storageNotice();
        }));
        document.getElementById('testVoice').addEventListener('click',()=>Guidance.speak(I18n.t('personal.voiceSample')));
        document.getElementById('avoidHolds').addEventListener('change',event=>{
            this.store.update({comfort:{...this.store.state.comfort,avoidHolds:event.target.checked}});
            if(event.target.checked){document.getElementById('checkinHolds').checked=false;App.checkin.holds=false;}
            App.renderRecommendation();if(App.state.selectedTechnique)this.renderDetail();
        });
        for(const id of ['practicePace','practiceUnpaced','naturalMinutes'])document.getElementById(id).addEventListener('change',()=>{
            this.store.update({comfort:{...this.store.state.comfort,pace:Number(document.getElementById('practicePace').value),unpaced:document.getElementById('practiceUnpaced').checked,minutes:Number(document.getElementById('naturalMinutes').value)}});
            this.renderDetail();App.updateDuration();this.storageNotice();
        });
        document.getElementById('noHoldAlternative').addEventListener('click',()=>App.showTechniqueDetail('diaphragmatic'));
        document.getElementById('favoritePractice').addEventListener('click',()=>this.favorite());
        document.getElementById('saveRoutine').addEventListener('click',()=>this.editRoutine());
        document.getElementById('routineReminder').addEventListener('change',event=>{document.getElementById('reminderFields').hidden=!event.target.checked;});
        document.getElementById('routineForm').addEventListener('submit',event=>{event.preventDefault();this.saveRoutine();});
        document.getElementById('keepHistory').addEventListener('change',event=>{this.store.update({remember:event.target.checked});this.renderPersonal();this.storageNotice();});
        document.getElementById('exportPersonal').addEventListener('click',()=>this.download('breathe-personal.json',this.store.export(),'application/json'));
        document.getElementById('clearHistory').addEventListener('click',event=>{
            if(!this.confirmClear){this.confirmClear=true;event.target.textContent=I18n.t('personal.confirmClear');return;}
            this.store.clearHistory();this.confirmClear=false;this.renderPersonal();
        });
        document.querySelectorAll('[data-outcome]').forEach(button=>button.addEventListener('click',()=>this.feedback(button.dataset.outcome)));
        document.getElementById('skipFeedback').addEventListener('click',()=>{this.pending=null;document.getElementById('feedbackCard').hidden=true;});
        document.getElementById('connectHealth').addEventListener('click',()=>this.connectHealth(true));
        document.getElementById('refreshHealth').addEventListener('click',()=>this.connectHealth(false));
        document.getElementById('disconnectHealth').addEventListener('click',async()=>{
            this.healthEpoch=(this.healthEpoch||0)+1;this.healthLoading=false;this.health=null;this.renderContext();
            try{await NativeClient.call('disconnectHealth');document.getElementById('healthStatus').textContent=I18n.t('context.disconnected');}catch{document.getElementById('healthStatus').textContent=I18n.t('context.error');}
        });
        document.getElementById('sleepContext').addEventListener('input',event=>{const n=Number(event.target.value);this.manual.sleep=event.target.value!==''&&Number.isFinite(n)&&n>=0&&n<=16?n:null;this.renderContextSummary();});
        document.getElementById('activityContext').addEventListener('change',event=>{this.manual.activity=event.target.value;this.renderContextSummary();});
        document.getElementById('soundToggle').addEventListener('click',()=>Guidance.stop());
        document.addEventListener('visibilitychange',()=>{if(document.hidden)Guidance.stop();else this.checkReminders();});
        window.addEventListener('pagehide',()=>{Guidance.stop();this.health=null;this.healthEpoch=(this.healthEpoch||0)+1;});
        this.reminderTimer=setInterval(()=>this.checkReminders(),60000);
        this.refresh();Offline.init();
        const routineId=new URL(location.href).searchParams.get('routine');
        const routine=this.store.state.routines.find(r=>r.id===routineId);if(routine)this.useRoutine(routine);
    },
    profile(){return PracticeProfile.build(App.state.selectedTechnique,this.store.state.comfort);},
    renderDetail(){
        if(!App.state.selectedTechnique)return;
        const base=App.state.selectedTechnique,profile=this.profile(),options=this.store.state.comfort;
        const pace=document.getElementById('practicePace');pace.value=String(options.pace);pace.disabled=base.advanced||options.unpaced;
        document.getElementById('practiceUnpaced').checked=options.unpaced;
        document.getElementById('naturalDuration').hidden=!options.unpaced;
        document.getElementById('naturalMinutes').value=String(options.minutes);
        document.getElementById('repetitions').closest('.setting-group').hidden=options.unpaced;
        document.getElementById('paceDescription').textContent=I18n.t(options.unpaced?'personal.naturalCue':base.advanced?'personal.fixedAdvanced':'personal.paceDescription',{pattern:profile.phases.map(p=>p.duration).join('–')});
        document.getElementById('adaptationNote').hidden=!profile.adapted&&!options.unpaced;
        document.getElementById('noHoldAlternative').hidden=!base.phases.some(p=>['hold','retention','recovery'].includes(p.type));
        const favorite=this.store.state.routines.some(r=>r.favorite&&r.techniqueId===base.id);
        const button=document.getElementById('favoritePractice');button.setAttribute('aria-pressed',String(favorite));button.textContent=I18n.t(favorite?'personal.unfavorite':'personal.favorite');
        [...pace.options].forEach(option=>{option.textContent=I18n.t('personal.paces.'+option.value.replace('.','_'));});
    },
    snapshotRoutine(name='',favorite=false){return {id:PracticeData.id(),name,favorite,techniqueId:App.state.selectedTechnique.id,cycles:Number(App.elements.repetitionsSlider.value),comfort:{...this.store.state.comfort},audio:{...AudioManager.settings},reminder:null};},
    favorite(){
        const existing=this.store.state.routines.find(r=>r.favorite&&r.techniqueId===App.state.selectedTechnique.id);
        if(existing){if(existing.name||existing.reminder)this.store.putRoutine({...existing,favorite:false});else this.store.removeRoutine(existing.id);}else this.store.putRoutine(this.snapshotRoutine('',true));
        this.renderDetail();this.storageNotice();
    },
    editRoutine(routine=null){
        this.editing=routine;
        document.getElementById('routineName').value=routine?(routine.name||I18n.getTechnique(routine.techniqueId,'name')):PracticeProfile.name(this.profile());
        document.getElementById('routineReminder').checked=!!routine?.reminder;
        document.getElementById('reminderFields').hidden=!routine?.reminder;
        document.getElementById('reminderTime').value=routine?.reminder?.time||'20:00';
        document.querySelectorAll('[data-reminder-day]').forEach(input=>{input.checked=(routine?.reminder?.days||[0,1,2,3,4,5,6]).includes(Number(input.dataset.reminderDay));});
        document.getElementById('routineStatus').textContent='';
        document.getElementById('routineDialog').showModal();
    },
    async saveRoutine(){
        const name=document.getElementById('routineName').value.trim();if(!name)return;
        const reminder=document.getElementById('routineReminder').checked?PracticeData.reminder({time:document.getElementById('reminderTime').value,days:[...document.querySelectorAll('[data-reminder-day]:checked')].map(input=>Number(input.dataset.reminderDay))}):null;
        if(document.getElementById('routineReminder').checked&&!reminder){document.getElementById('routineStatus').textContent=I18n.t('personal.chooseDays');return;}
        const routine={...(this.editing||this.snapshotRoutine()),name,reminder};
        if(!this.store.putRoutine(routine)){document.getElementById('routineStatus').textContent=I18n.t('personal.routineLimit');return;}
        document.getElementById('routineDialog').close();this.renderPersonal();this.storageNotice();
        if(NativeClient.available()){
            try{const reply=await this.syncReminders(!!reminder);document.getElementById('personalStatus').textContent=I18n.t(reply?.permissionNeeded?'personal.notificationPermission':'personal.reminderScheduled');}
            catch{document.getElementById('personalStatus').textContent=I18n.t('personal.reminderError');}
        }
        if(!document.getElementById('personalDialog').open)document.getElementById('personalDialog').showModal();
    },
    async syncReminders(requestPermission=false){return NativeClient.call('setReminders',{requestPermission,routines:this.store.state.routines.filter(r=>r.reminder).map(r=>({id:r.id,...r.reminder}))});},
    useRoutine(routine){
        this.store.update({comfort:routine.comfort});AudioManager.configure(routine.audio);AudioUI.select.value=routine.audio.ambient;AudioUI.ambientVolume.value=routine.audio.ambientVolume*100;AudioUI.cueVolume.value=routine.audio.cueVolume*100;AudioUI.refresh();
        document.getElementById('personalDialog').close();App.showTechniqueDetail(routine.techniqueId,routine.cycles);
    },
    renderPersonal(){
        const list=document.getElementById('routineList');list.replaceChildren();
        if(!this.store.state.routines.length)list.append(this.node('p',I18n.t('personal.noRoutines')));
        for(const routine of this.store.state.routines){
            const card=this.node('article');card.className='saved-routine';
            card.append(this.node('h4',routine.name||(routine.comfort.unpaced?I18n.t('personal.unpaced'):I18n.getTechnique(routine.techniqueId,'name'))));
            const seconds=routine.comfort.unpaced?routine.comfort.minutes*60:PracticeProfile.build(techniques[routine.techniqueId],routine.comfort).phases.reduce((sum,p)=>sum+p.duration,0)*routine.cycles;
            card.append(this.node('p',App.formatDuration(seconds)+' · '+I18n.t('audio.tracks.'+routine.audio.ambient)));
            if(routine.reminder)card.append(this.node('p',I18n.t('personal.reminderAt',{time:routine.reminder.time})+' · '+routine.reminder.days.map(d=>I18n.t('personal.weekdays.'+d)).join(', ')));
            const actions=this.node('div');actions.className='tool-actions';
            actions.append(this.button('personal.openRoutine',()=>this.useRoutine(routine)),this.button('personal.editRoutine',()=>this.editRoutine(routine)));
            if(routine.reminder&&!NativeClient.available())actions.append(this.button('personal.calendar',()=>this.download('breathe-reminder.ics',PracticeData.calendar(routine,I18n.t('personal.calendarTitle')),'text/calendar')));
            actions.append(this.button('personal.removeRoutine',async()=>{this.store.removeRoutine(routine.id);this.renderPersonal();if(App.state.selectedTechnique)this.renderDetail();if(NativeClient.available())try{await this.syncReminders();}catch{};}));
            card.append(actions);list.append(card);
        }
        document.getElementById('keepHistory').checked=this.store.state.remember;
        document.getElementById('reflectionSummary').textContent=I18n.t('personal.reflectionCount',{count:this.store.state.history.length});
        const reflections=document.getElementById('reflectionList');reflections.replaceChildren();
        for(const s of [...this.store.state.history].reverse().slice(0,12)){
            const name=s.unpaced?I18n.t('personal.unpaced'):I18n.getTechnique(s.techniqueId,'name');
            reflections.append(this.node('p',new Date(s.at).toLocaleDateString(I18n.currentLang)+' · '+name+' · '+I18n.t('personal.outcomes.'+s.outcome)));
        }
        document.getElementById('clearHistory').textContent=I18n.t(this.confirmClear?'personal.confirmClear':'personal.clear');
        document.getElementById('clearHistory').disabled=!this.store.state.history.length;
    },
    finish(snapshot,technique,completed){
        this.pending={techniqueId:technique.id,unpaced:technique.unpaced,feeling:App.checkin.feeling,seconds:snapshot.practiceSeconds,completed};
        document.getElementById('feedbackCard').hidden=false;document.getElementById('rememberFeedback').checked=this.store.state.remember;
        document.getElementById('rememberFeedback').disabled=false;
        document.getElementById('feedbackStatus').textContent='';document.querySelectorAll('[data-outcome]').forEach(b=>{b.disabled=false;b.setAttribute('aria-pressed','false');});
    },
    feedback(outcome){
        if(!this.pending)return;
        const remember=document.getElementById('rememberFeedback').checked;
        this.store.feedback(this.pending,outcome,remember);this.pending=null;
        document.getElementById('rememberFeedback').disabled=true;
        document.querySelectorAll('[data-outcome]').forEach(b=>{b.disabled=true;b.setAttribute('aria-pressed',String(b.dataset.outcome===outcome));});
        document.getElementById('feedbackStatus').textContent=I18n.t(remember&&this.store.persistent?'personal.feedbackSaved':'personal.feedbackThanks');this.storageNotice();
    },
    personalize(result){
        if(!result)return result;
        const id=this.store.helpful(result.feeling,result.choices.map(c=>c.id));
        if(id){result.choices.sort((a,b)=>Number(b.id===id)-Number(a.id===id));result.personal=id;}return result;
    },
    renderAccess(){
        document.querySelectorAll('[data-access]').forEach(input=>{input.checked=this.store.state.access[input.dataset.access];});
        document.getElementById('avoidHolds').checked=this.store.state.comfort.avoidHolds;
        document.getElementById('testVoice').disabled=!this.store.state.access.voice||this.store.state.access.quiet||!AudioManager.enabled;
        document.getElementById('sensoryStatus').textContent=I18n.t(NativeClient.available()?'personal.nativeSensory':'personal.webSensory');
    },
    async connectHealth(request){
        const status=document.getElementById('healthStatus');status.textContent=I18n.t('context.loading');
        const types=[...document.querySelectorAll('[data-health-type]:checked')].map(input=>input.dataset.healthType);
        if(!types.length){status.textContent=I18n.t('context.chooseTypes');return;}
        const epoch=this.healthEpoch=(this.healthEpoch||0)+1;this.healthLoading=true;this.renderContext();
        try{const health=await NativeClient.call(request?'connectHealth':'readHealth',{types});if(epoch!==this.healthEpoch)return;this.health=health;status.textContent=I18n.t('context.status.'+(health.status||'ready'));}
        catch{if(epoch!==this.healthEpoch)return;this.health=null;status.textContent=I18n.t('context.error');}
        finally{if(epoch===this.healthEpoch){this.healthLoading=false;this.renderContext();}}
    },
    renderContext(){
        const native=NativeClient.available();document.getElementById('nativeContextNote').textContent=I18n.t(native?'context.nativeIntro':'context.webIntro');
        document.getElementById('connectHealth').disabled=!native||!!this.healthLoading;
        document.querySelectorAll('[data-health-type]').forEach(input=>{input.disabled=!native;});
        document.getElementById('refreshHealth').hidden=!native||!this.health;
        document.getElementById('refreshHealth').disabled=!!this.healthLoading;
        document.getElementById('disconnectHealth').hidden=!native||!this.health;
        const list=document.getElementById('healthMetrics');list.replaceChildren();
        for(const type of ['sleep','activity','hrv','restingHeartRate']){
            const metric=this.health?.metrics?.[type];list.append(this.node('dt',I18n.t('context.'+type)));
            let text=I18n.t('context.metricStatus.'+(metric?.status||'notShared'));
            if(metric?.status==='available'&&Number.isFinite(metric.value))text=new Intl.NumberFormat(I18n.currentLang,{maximumFractionDigits:1}).format(metric.value)+' '+I18n.t('context.units.'+type)+' · '+new Date(metric.at).toLocaleString(I18n.currentLang)+(metric.source?' · '+String(metric.source).slice(0,120):'');
            list.append(this.node('dd',text));
        }
        this.renderContextSummary();
    },
    renderContextSummary(){
        const parts=[];if(this.manual.sleep!==null)parts.push(I18n.t('context.sleepSummary',{hours:this.manual.sleep}));
        if(this.manual.activity)parts.push(I18n.t('context.'+this.manual.activity));
        document.getElementById('contextSummary').textContent=parts.length?parts.join(' · ')+' — '+I18n.t('context.memory'):'';
    },
    checkReminders(){
        const now=new Date(),time=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
        const due=this.store.state.routines.find(r=>r.reminder?.time===time&&r.reminder.days.includes(now.getDay()));
        const banner=document.getElementById('reminderBanner');banner.hidden=!due||App.state.isRunning;
        if(due)banner.textContent=I18n.t('personal.due',{name:due.name||I18n.getTechnique(due.techniqueId,'name')});
    },
    storageNotice(){document.getElementById('storageNotice').hidden=this.store.persistent;},
    refresh(){this.renderAccess();this.renderPersonal();this.renderContext();this.storageNotice();if(App.state.selectedTechnique)this.renderDetail();},
    node(tag,text){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;},
    button(key,action){const button=this.node('button',I18n.t(key));button.type='button';button.addEventListener('click',action);return button;},
    async download(name,text,type){
        if(NativeClient.available()){
            const bytes=new TextEncoder().encode(text);let binary='';bytes.forEach(byte=>{binary+=String.fromCharCode(byte);});
            try{await NativeClient.call('saveFile',{name,type,base64:btoa(binary)});}catch{document.getElementById('personalStatus').textContent=I18n.t('personal.exportError');}
        }else{const url=URL.createObjectURL(new Blob([text],{type}));const anchor=this.node('a');anchor.href=url;anchor.download=name;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
    }
};
