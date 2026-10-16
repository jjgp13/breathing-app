/** Optional teaching aid. Timed practice never loads or depends on this renderer. */
const MovementLesson = {
    model:null, diagram:null, epoch:0, bundle:null, volume:0, position:'exhale', view:'front',
    init() {
        this.dialog=document.getElementById('movementLesson');
        this.host=document.getElementById('lessonModel');
        this.fallback=document.getElementById('lessonDiagram');
        this.status=document.getElementById('lessonStatus');
        this.explanation=document.getElementById('lessonExplanation');
        this.motion=window.matchMedia('(prefers-reduced-motion: reduce)');
        this.reduced=this.motion.matches;
        document.getElementById('openMovementLesson').addEventListener('click',()=>this.open());
        document.getElementById('closeMovementLesson').addEventListener('click',()=>this.dialog.close());
        this.dialog.addEventListener('close',()=>this.release());
        document.querySelectorAll('[data-lesson-position]').forEach(button=>button.addEventListener('click',()=>this.select(button.dataset.lessonPosition)));
        document.querySelectorAll('[data-lesson-view]').forEach(button=>button.addEventListener('click',()=>{
            this.view=button.dataset.lessonView;this.model?.setView(this.view);this.refresh();
        }));
        this.motion.addEventListener('change',event=>{
            this.reduced=event.matches;
            if(!this.dialog.open)return;
            this.releaseModel();this.draw();this.refresh();
            if(!this.reduced)this.load();
        });
        document.addEventListener('visibilitychange',()=>{if(document.hidden)this.finishTransition();});
        window.addEventListener('pagehide',()=>{if(this.dialog.open)this.dialog.close();this.release();});
    },
    open() {
        this.release();
        this.failed=false;this.position='exhale';this.volume=0;this.view='front';
        this.diagram=Guide2D.create(this.fallback,'diaphragmatic');
        this.dialog.showModal();this.draw();this.refresh();
        if(!this.reduced)this.load();
    },
    async load() {
        const epoch=this.epoch;
        this.failed=false;this.refresh();
        try {
            if(!window.Breathe3D){
                this.bundle ||= new Promise((resolve,reject)=>{
                    const script=document.createElement('script');
                    script.src='js/vendor/guide3d.bundle.js?v=9abcbe3134fc160d';
                    script.onload=resolve;
                    script.onerror=()=>{script.remove();reject(new Error('Teaching model unavailable'));};
                    document.head.appendChild(script);
                }).catch(error=>{this.bundle=null;throw error;});
                await this.bundle;
            }
            if(epoch!==this.epoch||!this.dialog.open)return;
            const model=await window.Breathe3D.create(this.host,()=>{
                if(epoch!==this.epoch)return;
                this.model=null;this.failed=true;this.refresh();
            },'diaphragmatic');
            if(epoch!==this.epoch||!this.dialog.open){model.destroy();return;}
            this.model=model;this.refresh();this.model.setView(this.view);this.draw();
        } catch {
            if(epoch!==this.epoch)return;
            this.failed=true;this.refresh();
        }
    },
    select(position) {
        if(!['inhale','exhale'].includes(position))return;
        cancelAnimationFrame(this.animation);
        this.position=position;
        const from=this.volume,target=position==='inhale'?1:0;
        if(this.reduced||document.hidden){this.volume=target;this.draw();}
        else {
            const start=performance.now();
            const step=now=>{
                const t=Math.min(1,(now-start)/750);
                this.volume=from+(target-from)*(1-Math.cos(t*Math.PI))/2;
                this.draw();
                if(t<1)this.animation=requestAnimationFrame(step);
                else this.animation=null;
            };
            this.animation=requestAnimationFrame(step);
        }
        this.refresh();
    },
    finishTransition() {
        cancelAnimationFrame(this.animation);this.animation=null;
        this.volume=this.position==='inhale'?1:0;
        if(this.dialog.open)this.draw();
    },
    draw() {
        // End positions are a comparison illustration, without breathing targets or a timer.
        const frame={id:'diaphragmatic',phase:this.position,index:this.position==='inhale'?0:1,volume:this.volume,preparing:false};
        this.diagram?.update(frame);this.model?.update(frame,performance.now(),true);
    },
    refresh() {
        if(!this.dialog.open)return;
        const use3d=!!this.model&&!this.reduced&&!this.failed;
        this.host.hidden=!use3d;this.fallback.hidden=use3d;
        document.querySelectorAll('[data-lesson-view]').forEach(button=>{
            button.disabled=!use3d;
            button.setAttribute('aria-pressed',String(use3d&&button.dataset.lessonView===this.view));
        });
        document.querySelectorAll('[data-lesson-position]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lessonPosition===this.position)));
        this.dialog.querySelector('.lesson-views').setAttribute('aria-label',I18n.t('lesson.views'));
        this.dialog.querySelector('.lesson-positions').setAttribute('aria-label',I18n.t('lesson.positions'));
        this.explanation.textContent=I18n.t('lesson.'+this.position+'Explanation');
        this.status.textContent=this.reduced?I18n.t('lesson.reduced'):this.failed?I18n.t('lesson.fallback'):!this.model?I18n.t('lesson.loading'):'';
    },
    releaseModel() {
        this.epoch++;
        this.model?.destroy();this.model=null;
        this.finishTransition();
    },
    release() {
        this.releaseModel();this.diagram?.destroy();this.diagram=null;
    }
};
