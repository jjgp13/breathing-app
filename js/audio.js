/** Optional local soundscapes and quiet cues; no audio starts on page load. */
const AudioManager = {
    context: null, enabled: true, quiet:false, role: 'idle', paused: false, generation: 0,
    settings: { ambient: 'off', ambientVolume: 0.25, cueVolume: 0.35 },
    files: { rain: 'assets/audio/rain.ogg', stream: 'assets/audio/stream.ogg' },
    buffers: new Map(), cues: new Set(), voice: null, previewTimer: null, status: 'idle',
    onChange: () => {},

    setup() {
        try {
            const saved = JSON.parse(localStorage.getItem('breathe-audio') || 'null');
            if (saved) this.settings = this.validate(saved);
            this.enabled = saved?.enabled !== false;
        } catch { /* Controls work without persistent storage. */ }
        this.notify();
    },

    validate(value) {
        const volume = (number, fallback) => Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : fallback;
        return {
            ambient: ['off','rain','stream','tones'].includes(value.ambient) ? value.ambient : 'off',
            ambientVolume: volume(value.ambientVolume, 0.25), cueVolume: volume(value.cueVolume, 0.35)
        };
    },

    save() {
        try { localStorage.setItem('breathe-audio', JSON.stringify({ ...this.settings, enabled: this.enabled })); } catch {}
    },

    async init() {
        if (!this.context) {
            const Context = window.AudioContext || window.webkitAudioContext;
            if (!Context) throw new Error('Audio unavailable');
            this.context = new Context();
            this.master = this.context.createGain();
            this.ambientGain = this.context.createGain();
            this.cueGain = this.context.createGain();
            this.ambientGain.connect(this.master);
            this.cueGain.connect(this.master);
            this.master.connect(this.context.destination);
            this.master.gain.value = this.enabled && !this.quiet ? 1 : 0;
            this.ambientGain.gain.value = this.settings.ambientVolume * 0.6;
            this.cueGain.gain.value = this.settings.cueVolume;
        }
        if (this.context.state === 'suspended') await this.context.resume();
        if (this.context.state !== 'running') throw new Error('Audio unavailable');
    },

    ramp(parameter, value, seconds = 0.15) {
        const now = this.context.currentTime;
        parameter.cancelScheduledValues(now);
        parameter.setValueAtTime(parameter.value, now);
        parameter.linearRampToValueAtTime(value, now + seconds);
    },

    configure(patch) {
        const previous = this.settings.ambient;
        this.settings = this.validate({ ...this.settings, ...patch });
        this.save();
        if (this.context) {
            this.ramp(this.ambientGain.gain, this.settings.ambientVolume * 0.6);
            this.ramp(this.cueGain.gain, this.settings.cueVolume);
        }
        if (previous !== this.settings.ambient) this.syncAmbient();
        if (this.settings.ambient === 'off' && this.role === 'preview') this.endPreview();
        this.notify();
    },

    toggle() {
        this.enabled = !this.enabled;
        this.save();
        if (this.context) this.ramp(this.master.gain, this.enabled && !this.quiet ? 1 : 0, 0.05);
        this.stopCues();
        if (this.enabled && this.role === 'session' && !this.paused) this.unlock();
        if (!this.enabled && this.role === 'preview') this.endPreview();
        else this.syncAmbient();
        this.notify();
        return this.enabled;
    },

    setQuiet(quiet){this.quiet=!!quiet;this.stopCues();if(this.context)this.ramp(this.master.gain,this.enabled&&!this.quiet?1:0,.05);this.syncAmbient();this.notify();},
    audible() { return this.enabled && !this.quiet && !this.paused && this.role !== 'idle'; },

    unlock() {
        this.init().catch(() => {
            if (this.audible()) { this.status = 'unavailable'; this.notify(); }
        });
    },

    startSession() {
        this.stop();
        this.role = 'session';
        this.paused = false;
        // Called from Begin Practice to unlock audio on phones.
        if (this.enabled && !this.quiet) this.unlock();
        this.syncAmbient();
    },

    setPaused(paused) {
        if (this.role !== 'session' || this.paused === paused) return;
        this.paused = paused;
        if (paused) this.stopCues();
        else if (this.enabled && !this.quiet) this.unlock();
        this.syncAmbient();
    },

    preview() {
        if (this.role === 'preview') { this.endPreview(); return; }
        if (this.role === 'session' || !this.enabled || this.settings.ambient === 'off') return;
        this.role = 'preview';
        this.paused = false;
        this.previewTimer = setTimeout(() => this.endPreview(), 15000);
        this.syncAmbient();
    },

    endPreview() { if (this.role === 'preview') this.stop(); },

    stop() {
        clearTimeout(this.previewTimer);
        this.previewTimer = null;
        this.role = 'idle';
        this.paused = false;
        this.generation++;
        this.stopVoice();
        this.stopCues();
        this.status = 'idle';
        this.notify();
    },

    async syncAmbient() {
        const generation = ++this.generation;
        this.stopVoice();
        this.status = 'idle';
        if (!this.audible() || this.settings.ambient === 'off') { this.notify(); return; }
        this.status = 'loading'; this.notify();
        const selected = this.settings.ambient;
        try {
            await this.init();
            if (generation !== this.generation || !this.audible()) return;
            const buffer = selected === 'tones' ? null : await this.loadBuffer(selected);
            if (generation !== this.generation || !this.audible()) return;
            const gain = this.context.createGain();
            gain.gain.value = 0;
            gain.connect(this.ambientGain);
            const nodes = [];
            if (buffer) {
                const source = this.context.createBufferSource();
                source.buffer = buffer; source.loop = true; source.connect(gain);
                source.start(); nodes.push(source);
            } else {
                // Original musical tones; no physiological frequency claim.
                for (const [frequency, level] of [[174.614, 0.12], [261.626, 0.05], [349.228, 0.015]]) {
                    const oscillator = this.context.createOscillator(), balance = this.context.createGain();
                    oscillator.type = 'sine'; oscillator.frequency.value = frequency;
                    balance.gain.value = level;
                    oscillator.connect(balance); balance.connect(gain); oscillator.start();
                    oscillator.onended = () => { oscillator.disconnect(); balance.disconnect(); };
                    nodes.push(oscillator);
                }
            }
            this.ramp(gain.gain, 1, 1.2);
            this.voice = { gain, nodes };
            this.status = 'playing'; this.notify();
        } catch {
            if (generation !== this.generation) return;
            this.status = 'unavailable'; this.notify();
        }
    },

    async loadBuffer(id) {
        if (!this.buffers.has(id)) {
            const loading = (async () => {
                const response = await fetch(this.files[id]);
                if (!response.ok) throw new Error('Sound unavailable');
                const decoded = await this.context.decodeAudioData(await response.arrayBuffer());
                return this.prepareLoop(decoded);
            })();
            this.buffers.set(id, loading);
        }
        try { return await this.buffers.get(id); }
        catch (error) { this.buffers.delete(id); throw error; }
    },

    prepareLoop(decoded) {
        const fade = Math.min(Math.floor(decoded.sampleRate * 1.5), Math.floor(decoded.length / 4));
        const length = decoded.length - fade;
        const loop = this.context.createBuffer(decoded.numberOfChannels, length, decoded.sampleRate);
        let energy = 0, peak = 0;
        for (let channel = 0; channel < decoded.numberOfChannels; channel++) {
            const input = decoded.getChannelData(channel), output = loop.getChannelData(channel);
            output.set(input.subarray(0,length));
            // Blend the old tail into the head to avoid a hard loop seam.
            for (let i=0; i<fade; i++) {
                const mix = i / Math.max(1,fade-1);
                output[i] = input[length+i]*(1-mix) + input[i]*mix;
            }
            for (const value of output) { energy += value*value; peak = Math.max(peak,Math.abs(value)); }
        }
        const rms = Math.sqrt(energy / (length*decoded.numberOfChannels));
        const scale = Math.min(0.12 / (rms || 1), 0.6 / (peak || 1));
        for (let channel=0; channel<loop.numberOfChannels; channel++) {
            const output=loop.getChannelData(channel);
            for(let i=0;i<output.length;i++) output[i]*=scale;
        }
        return loop;
    },

    stopVoice() {
        const voice = this.voice;
        if (!voice) return;
        this.voice = null;
        this.ramp(voice.gain.gain, 0, 0.15);
        let remaining=voice.nodes.length;
        for (const node of voice.nodes) {
            const cleanup=node.onended;
            node.onended=()=>{ cleanup?.(); node.disconnect(); if(--remaining===0)voice.gain.disconnect(); };
            try { node.stop(this.context.currentTime + 0.16); } catch {}
        }
    },

    playTone(frequency, delay = 0, duration = 0.65) {
        if (!this.enabled || this.quiet || this.paused || !this.context || this.context.state !== 'running' || this.settings.cueVolume === 0) return;
        const oscillator=this.context.createOscillator(), gain=this.context.createGain();
        oscillator.frequency.value=frequency;
        oscillator.connect(gain); gain.connect(this.cueGain);
        const start=this.context.currentTime+delay;
        gain.gain.setValueAtTime(0,start);
        gain.gain.linearRampToValueAtTime(0.075,start+0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001,start+duration);
        oscillator.start(start); oscillator.stop(start+duration+0.02);
        const voice={oscillator,gain}; this.cues.add(voice);
        oscillator.onended=()=>{ this.cues.delete(voice); oscillator.disconnect(); gain.disconnect(); };
    },

    stopCues() {
        for (const voice of this.cues) {
            this.ramp(voice.gain.gain, 0, 0.03);
            try { voice.oscillator.stop(this.context.currentTime + 0.04); } catch {}
        }
        this.cues.clear();
    },

    playPhaseSound(type) {
        if (this.role !== 'session' || this.paused) return;
        if (type === 'inhale') { this.playTone(220); this.playTone(277.18,0.16); }
        else if (type === 'topUp') this.playTone(329.63,0,0.45);
        else if (['exhale','hum'].includes(type)) { this.playTone(277.18); this.playTone(220,0.16); }
        else if (['hold','retention','recovery'].includes(type)) this.playTone(196,0,0.45);
    },

    playComplete() { this.playTone(261.63,0,0.9); this.playTone(329.63,0.2,0.9); },
    notify() { this.onChange(); }
};

if (typeof module !== 'undefined') module.exports = AudioManager;
