const AudioUI = {
    init() {
        this.dialog=document.getElementById('soundDialog');
        this.select=document.getElementById('ambientSound');
        this.ambientVolume=document.getElementById('ambientVolume');
        this.cueVolume=document.getElementById('cueVolume');
        this.preview=document.getElementById('previewSound');
        this.status=document.getElementById('audioStatus');
        this.summary=document.getElementById('audioSummary');
        this.mute=document.getElementById('soundToggle');
        document.querySelectorAll('[data-open-audio]').forEach(button=>button.addEventListener('click',()=>this.dialog.showModal()));
        document.getElementById('closeSounds').addEventListener('click',()=>this.dialog.close());
        this.dialog.addEventListener('close',()=>AudioManager.endPreview());
        this.select.addEventListener('change',()=>AudioManager.configure({ambient:this.select.value}));
        this.ambientVolume.addEventListener('input',()=>AudioManager.configure({ambientVolume:Number(this.ambientVolume.value)/100}));
        this.cueVolume.addEventListener('input',()=>AudioManager.configure({cueVolume:Number(this.cueVolume.value)/100}));
        this.preview.addEventListener('click',()=>AudioManager.preview());
        AudioManager.onChange=()=>this.refresh();
        AudioManager.setup();
        this.select.value=AudioManager.settings.ambient;
        this.ambientVolume.value=AudioManager.settings.ambientVolume*100;
        this.cueVolume.value=AudioManager.settings.cueVolume*100;
        this.refresh();
        window.addEventListener('pagehide',()=>{
            if(AudioManager.role==='session') AudioManager.setPaused(true);
            else AudioManager.stop();
        });
        document.addEventListener('visibilitychange',()=>{if(document.hidden)AudioManager.endPreview();});
    },

    refresh() {
        if (!this.dialog) return;
        const audio=AudioManager;
        const previewing=audio.role==='preview';
        const key=!audio.enabled||audio.quiet?'muted':audio.paused?'paused':audio.status==='idle'?'ready':audio.status;
        this.status.textContent=I18n.t('audio.status.'+key);
        this.preview.textContent=I18n.t(previewing?'audio.stopPreview':'audio.preview');
        this.preview.disabled=!audio.enabled||audio.quiet||audio.role==='session'||audio.settings.ambient==='off';
        this.mute.disabled=audio.quiet;
        this.mute.textContent=audio.enabled&&!audio.quiet?'🔊':'🔇';
        this.mute.title=I18n.t(audio.quiet?'personal.quiet':audio.enabled?'audio.mute':'audio.unmute');
        this.mute.setAttribute('aria-label',this.mute.title);
        this.mute.setAttribute('aria-pressed',String(!audio.enabled||audio.quiet));
        this.summary.textContent=I18n.t('audio.tracks.'+audio.settings.ambient);
        document.getElementById('ambientVolumeValue').textContent=Math.round(audio.settings.ambientVolume*100)+'%';
        document.getElementById('cueVolumeValue').textContent=Math.round(audio.settings.cueVolume*100)+'%';
        document.getElementById('audioSettingsToggle').title=I18n.t('audio.title');
    }
};
