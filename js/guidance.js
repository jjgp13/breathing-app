/** User-selected sensory cues. Spoken content contains generic instructions only. */
const Guidance = {
    settings:{},
    configure(settings){this.settings=settings;this.stop();document.documentElement.classList.toggle('large-text',settings.largeText);document.body.classList.toggle('large-text',settings.largeText);document.body.classList.toggle('high-contrast',settings.contrast);document.body.classList.toggle('dim-display',settings.dim);AudioManager.setQuiet(settings.quiet);},
    phase(snapshot,technique){
        if(snapshot.mode==='paused'||snapshot.preparing){if(!this.suspended)this.stop();this.suspended=true;return;}
        this.suspended=false;
        const key=[snapshot.cycle,snapshot.phaseIndex].join(':');if(key===this.lastKey)return;this.lastKey=key;
        if(!AudioManager.enabled||this.settings.quiet)return;
        if(this.settings.haptics){
            const pattern=['exhale','hum'].includes(snapshot.phase.type)?[25,60,25]:[45];
            if(NativeClient.available())NativeClient.call('vibrate',{pattern}).catch(()=>{});else navigator.vibrate?.(pattern);
        }
        if(this.settings.voice){
            let cue=snapshot.phase.type;
            if(cue==='hold')cue=GuideMath.volume(technique,snapshot.phaseIndex,0)?'holdFull':'holdEmpty';
            const text=technique.unpaced?I18n.t('personal.naturalCue'):I18n.t('guide.cue.'+cue);
            this.speak(text);
        }
    },
    speak(text){
        if(!this.settings.voice||this.settings.quiet||!AudioManager.enabled)return;
        if(NativeClient.available()){NativeClient.call('speak',{text,language:I18n.currentLang}).catch(()=>{});return;}
        if(!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;
        window.speechSynthesis.cancel();
        const utterance=new SpeechSynthesisUtterance(text);utterance.lang=I18n.currentLang;utterance.rate=.9;
        const voice=window.speechSynthesis.getVoices().find(v=>v.localService&&v.lang.startsWith(I18n.currentLang));
        if(voice)utterance.voice=voice;
        window.speechSynthesis.speak(utterance);
    },
    stop(){window.speechSynthesis?.cancel();navigator.vibrate?.(0);if(NativeClient.available())NativeClient.call('silence').catch(()=>{});},
    reset(){this.lastKey=null;this.suspended=true;this.stop();}
};
