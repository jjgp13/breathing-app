/** One cancelable clock for preparation, phases, cues, and visual guidance. */
class BreathingSession {
    constructor(technique, cycles, options = {}) {
        if (!technique.phases.length || technique.phases.some(p => !Number.isFinite(p.duration) || p.duration <= 0)) {
            throw new Error('Every breathing phase needs a positive duration.');
        }
        this.technique = technique;
        this.cycles = Math.max(1, Math.min(technique.maxCycles, Math.floor(cycles) || 1));
        this.now = options.now || (() => performance.now());
        this.request = options.request || (callback => requestAnimationFrame(callback));
        this.cancel = options.cancel || (id => cancelAnimationFrame(id));
        this.onUpdate = options.onUpdate || (() => {});
        this.onCue = options.onCue || (() => {});
        this.onComplete = options.onComplete || (() => {});
        this.preparation = (options.preparationSeconds ?? 3) * 1000;
        this.mode = 'stopped';
        this.frame = null;
        this.generation = 0;
    }

    start() {
        this.stop(false);
        this.mode = this.preparation ? 'preparing' : 'running';
        this.phaseIndex = 0;
        this.cycleIndex = 0;
        this.elapsed = 0;
        this.practiceElapsed = 0;
        this.prepareElapsed = 0;
        this.last = this.now();
        if (this.mode === 'running') this.onCue(this.snapshot());
        this.emit();
        this.schedule();
    }

    schedule() {
        if (this.frame !== null || !['preparing', 'running'].includes(this.mode)) return;
        const generation = this.generation;
        this.frame = this.request(timestamp => {
            if (generation !== this.generation) return;
            this.frame = null;
            this.step(timestamp);
            this.schedule();
        });
    }

    step(timestamp) {
        if (!['preparing', 'running'].includes(this.mode)) return;
        const delta = Math.max(0, timestamp - this.last);
        this.last = timestamp;
        // Never jump a person through several breathing instructions after a stalled frame.
        if (delta > 1500) {
            this.pause('interrupted', false);
            return;
        }
        this.advance(delta);
        this.emit();
    }

    advance(delta) {
        if (this.mode === 'preparing') {
            const consumed = Math.min(delta, this.preparation - this.prepareElapsed);
            this.prepareElapsed += consumed;
            delta -= consumed;
            if (this.prepareElapsed < this.preparation) return;
            this.mode = 'running';
            this.onCue(this.snapshot());
        }
        while (this.mode === 'running' && delta > 0) {
            const duration = this.technique.phases[this.phaseIndex].duration * 1000;
            const consumed = Math.min(delta, duration - this.elapsed);
            this.elapsed += consumed;
            this.practiceElapsed += consumed;
            delta -= consumed;
            if (this.elapsed >= duration) this.nextPhase();
        }
    }

    nextPhase() {
        this.elapsed = 0;
        this.phaseIndex++;
        if (this.phaseIndex === this.technique.phases.length) {
            this.phaseIndex = 0;
            this.cycleIndex++;
        }
        if (this.cycleIndex === this.cycles) {
            this.mode = 'complete';
            this.cancelFrame();
            this.onComplete(this.snapshot());
        } else {
            this.onCue(this.snapshot());
        }
    }

    endHold() {
        if (this.mode !== 'running' || !['hold', 'retention', 'recovery'].includes(this.technique.phases[this.phaseIndex].type)) return;
        this.nextPhase();
        this.last = this.now();
        this.emit();
    }

    pause(reason = 'user', capture = true) {
        if (!['preparing', 'running'].includes(this.mode)) return;
        if (capture) {
            const timestamp = this.now();
            this.advance(Math.max(0, Math.min(timestamp - this.last, 1500)));
            this.last = timestamp;
            if (this.mode === 'complete') return;
        }
        this.resumeMode = this.mode;
        this.mode = 'paused';
        this.pauseReason = reason;
        this.cancelFrame();
        this.emit();
    }

    resume() {
        if (this.mode !== 'paused') return;
        this.mode = this.resumeMode;
        this.pauseReason = null;
        this.last = this.now();
        this.emit();
        this.schedule();
    }

    cancelFrame() {
        this.generation++;
        if (this.frame !== null) this.cancel(this.frame);
        this.frame = null;
    }

    stop(emit = true) {
        this.cancelFrame();
        this.mode = 'stopped';
        if (emit) this.emit();
    }

    snapshot() {
        const phase = this.technique.phases[this.phaseIndex || 0];
        const preparing = this.mode === 'preparing' || (this.mode === 'paused' && this.resumeMode === 'preparing');
        return {
            mode: this.mode, preparing, pauseReason: this.pauseReason,
            phase, phaseIndex: this.phaseIndex || 0,
            cycle: Math.min((this.cycleIndex || 0) + 1, this.cycles), cycles: this.cycles,
            progress: preparing ? 0 : Math.min((this.elapsed || 0) / (phase.duration * 1000), 1),
            remaining: preparing ? Math.max(0, (this.preparation - (this.prepareElapsed || 0)) / 1000)
                : Math.max(0, phase.duration - (this.elapsed || 0) / 1000),
            practiceSeconds: (this.practiceElapsed || 0) / 1000
        };
    }

    emit() { this.onUpdate(this.snapshot()); }
}

if (typeof module !== 'undefined') module.exports = BreathingSession;
