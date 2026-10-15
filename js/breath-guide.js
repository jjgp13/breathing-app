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
    mode: '3d', model: null, loading: null, failed: false, lastSnapshot: null, lifecycle: 0,
    techniqueId:null, svgGuide:null, last2DAt:-Infinity,

    init() {
        this.stage = document.getElementById('guideStage');
        this.host = document.getElementById('model3d');
        this.simple = document.getElementById('simpleGuide');
        this.name = document.getElementById('guideVisualName');
        this.detail = document.getElementById('guideVisualDetail');
        this.timer = document.getElementById('guideTimer');
        this.status = document.getElementById('guideModeStatus');
        this.motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.reduced = this.motionPreference.matches;
        try { this.mode = localStorage.getItem('breathe-guide') || '3d'; } catch {}
        if (!['3d', 'simple'].includes(this.mode)) this.mode = '3d';
        this.motionPreference.addEventListener('change', event => {
            this.reduced = event.matches;
            this.refreshMode();
            if (this.lastSnapshot) this.update(...this.lastSnapshot);
        });
        document.querySelectorAll('[data-guide-mode]').forEach(button => {
            button.addEventListener('click', () => {
                this.mode = button.dataset.guideMode;
                try { localStorage.setItem('breathe-guide', this.mode); } catch {}
                this.refreshMode();
                this.last2DAt=-Infinity;
                if (this.lastSnapshot) this.update(...this.lastSnapshot);
            });
        });
        window.addEventListener('pagehide', () => {
            this.lifecycle++;
            this.model?.destroy(); this.model = null; this.loading = null;
        });
        window.addEventListener('pageshow', () => this.refreshMode());
        this.refreshMode();
    },

    async load() {
        if (this.loading || this.model || this.failed || this.reduced || this.mode !== '3d') return;
        const lifecycle = this.lifecycle;
        this.loading = (async () => {
            if (!window.Breathe3D) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'js/vendor/guide3d.bundle.js?v=6304f3f3ab4c4a34';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }
            const model = await window.Breathe3D.create(this.host, () => {
                if (lifecycle !== this.lifecycle) return;
                this.model = null;
                this.failed = true;
                this.refreshMode();
            },this.techniqueId||'resonance');
            if (lifecycle !== this.lifecycle) { model.destroy(); return; }
            this.model = model;
            this.refreshMode();
            if (this.lastSnapshot) this.update(...this.lastSnapshot);
        })().catch(() => {
            if (lifecycle !== this.lifecycle) return;
            this.failed = true;
            this.refreshMode();
        }).finally(() => { if (lifecycle === this.lifecycle) this.loading = null; });
        return this.loading;
    },

    refreshMode() {
        const use3d = this.mode === '3d' && !this.reduced && !this.failed && !!this.model;
        this.host.hidden = !use3d;
        this.simple.toggleAttribute('hidden', use3d);
        document.querySelectorAll('[data-guide-mode]').forEach(button => {
            button.setAttribute('aria-pressed', String(button.dataset.guideMode === (use3d ? '3d' : 'simple')));
            button.disabled = button.dataset.guideMode === '3d' && (this.reduced || this.failed);
        });
        const description=this.techniqueId?I18n.t(`guide.visuals.${this.techniqueId}.description`):'';
        const note=this.reduced?I18n.t('guide.reduced'):this.failed?I18n.t('guide.fallback'):'';
        this.status.textContent=[description,note].filter(Boolean).join(' ');
        this.name.textContent=this.techniqueId?I18n.t(`guide.visuals.${this.techniqueId}.name`):'';
        if (this.mode === '3d' && !this.model && !this.reduced && !this.failed && this.lastSnapshot) this.load();
    },

    update(snapshot, technique) {
        this.lastSnapshot = [snapshot, technique];
        if(this.techniqueId!==technique.id){
            this.lifecycle++;
            this.model?.destroy();this.model=null;this.loading=null;this.failed=false;
            this.techniqueId=technique.id;
            this.svgGuide?.destroy();this.svgGuide=Guide2D.create(this.simple,technique.id);
            this.last2DAt=-Infinity;
            this.stage.dataset.technique=technique.id;
            this.refreshMode();
        }
        const frame=GuidePatterns.sample(technique,snapshot,this.reduced);
        this.timer.textContent = Math.ceil(snapshot.remaining);
        const use3d=this.mode==='3d'&&!this.reduced&&!this.failed&&!!this.model;
        const now=performance.now();
        const phaseKey=[snapshot.mode,snapshot.phaseIndex,snapshot.preparing].join(':');
        if(!use3d&&(now-this.last2DAt>=32||phaseKey!==this.last2DPhase)){
            this.svgGuide.update(frame);this.last2DAt=now;this.last2DPhase=phaseKey;
        }
        this.detail.textContent=frame.breath?I18n.t('guide.breathCount',{count:frame.breath}):'';
        this.stage.dataset.phase = snapshot.preparing ? 'preparing' : snapshot.phase.type;
        this.stage.classList.toggle('is-paused', snapshot.mode === 'paused');
        if(use3d)this.model.update(frame);
        if (!this.model && this.mode === '3d' && !this.failed && !this.reduced) this.load();
    },

    clear() {
        this.lastSnapshot = null;
    }
};

if (typeof module !== 'undefined') module.exports = GuideMath;
