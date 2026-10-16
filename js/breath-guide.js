const GuideMath = {
    volume(technique, index, progress) {
        const phase = technique.phases[index];
        const smooth = value => (1 - Math.cos(Math.PI * Math.min(1, Math.max(0, value)))) / 2;
        const from = phase.volumeFrom;
        const to = phase.volumeTo;
        if (from !== undefined && to !== undefined) return from + (to - from) * smooth(progress);
        if (phase.type === 'inhale') return smooth(progress);
        if (['exhale', 'hum'].includes(phase.type)) return 1 - smooth(progress);
        if (phase.type === 'topUp') return 0.72 + 0.28 * smooth(progress);
        if (phase.type === 'retention') return 0;
        if (phase.type === 'recovery') return 1;
        if (phase.type === 'easy') return 0.25;
        if (phase.type === 'power') return (1 - Math.cos(progress * (phase.subBreaths || 30) * 2 * Math.PI)) / 2;
        if (phase.type === 'shallow') return 0.18 + 0.20 * (1 - Math.cos(progress * 5 * 2 * Math.PI)) / 2;
        const previous = technique.phases[(index + technique.phases.length - 1) % technique.phases.length];
        return ['inhale', 'topUp', 'recovery'].includes(previous.type) ? 1 : 0;
    }
};

const BreathGuide = {
    lastSnapshot: null,
    techniqueId:null, svgGuide:null, last2DAt:-Infinity,

    init() {
        this.stage = document.getElementById('guideStage');
        this.simple = document.getElementById('simpleGuide');
        this.name = document.getElementById('guideVisualName');
        this.detail = document.getElementById('guideVisualDetail');
        this.timer = document.getElementById('guideTimer');
        this.status = document.getElementById('guideModeStatus');
        this.progress = document.getElementById('guidePhaseProgress');
        this.motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.reduced = this.motionPreference.matches;
        this.motionPreference.addEventListener('change', event => {
            this.reduced = event.matches;
            this.refresh();
        });
        this.refresh();
    },

    refresh(redraw=true) {
        const description=this.techniqueId?I18n.t(`guide.visuals.${this.techniqueId}.description`):'';
        const note=this.reduced?I18n.t('guide.reduced'):'';
        this.status.textContent=[description,note].filter(Boolean).join(' ');
        this.name.textContent=this.techniqueId?I18n.t(`guide.visuals.${this.techniqueId}.name`):'';
        if (redraw && this.lastSnapshot) { this.last2DAt=-Infinity; this.update(...this.lastSnapshot); }
    },

    update(snapshot, technique) {
        this.lastSnapshot = [snapshot, technique];
        if(this.techniqueId!==technique.id){
            this.techniqueId=technique.id;
            this.svgGuide?.destroy();this.svgGuide=Guide2D.create(this.simple,technique.id);
            this.last2DAt=-Infinity;
            this.stage.dataset.technique=technique.id;
            this.refresh(false);
        }
        const frame=GuidePatterns.sample(technique,snapshot,this.reduced);
        this.timer.textContent = Math.ceil(snapshot.remaining);
        const now=performance.now();
        const phaseKey=[snapshot.mode,snapshot.phaseIndex,snapshot.preparing].join(':');
        if(now-this.last2DAt>=32||phaseKey!==this.last2DPhase){
            this.svgGuide.update(frame);this.last2DAt=now;this.last2DPhase=phaseKey;
            this.progress.style.transform=`scaleX(${this.reduced||snapshot.preparing?0:frame.progress})`;
        }
        const phaseCue=snapshot.preparing||snapshot.mode==='paused'?'':I18n.t(`guide.visualCues.${technique.id}.${frame.phase}`);
        this.detail.textContent=[frame.breath?I18n.t('guide.breathCount',{count:frame.breath}):'',phaseCue].filter(Boolean).join(' · ');
        this.stage.dataset.phase = snapshot.preparing ? 'preparing' : snapshot.phase.type;
        this.stage.classList.toggle('is-paused', snapshot.mode === 'paused');
    },

    clear() {
        this.lastSnapshot = null;
    }
};

if (typeof module !== 'undefined') module.exports = GuideMath;
