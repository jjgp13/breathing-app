/**
 * Audio Module
 * Handles all sound generation using Web Audio API
 */

const AudioManager = {
    context: null,
    enabled: true,

    /**
     * Initialize the audio context
     */
    init() {
        if (!this.context) {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    },

    /**
     * Toggle sound on/off
     * @returns {boolean} New sound state
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    },

    /**
     * Play a tone with specified parameters
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {string} type - Oscillator type (sine, square, etc.)
     * @param {number} volume - Volume (0-1)
     */
    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.context) return;
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, this.context.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.context.currentTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + duration);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    },

    /**
     * Play inhale sound (rising tone)
     */
    playInhale() {
        this.playTone(396, 0.4, 'sine', 0.2);
        setTimeout(() => this.playTone(528, 0.3, 'sine', 0.15), 100);
    },

    /**
     * Play hold sound (steady tone)
     */
    playHold() {
        this.playTone(432, 0.3, 'sine', 0.15);
    },

    /**
     * Play exhale sound (falling tone)
     */
    playExhale() {
        this.playTone(528, 0.4, 'sine', 0.2);
        setTimeout(() => this.playTone(396, 0.3, 'sine', 0.15), 100);
    },

    /**
     * Play completion celebration sound
     */
    playComplete() {
        this.playTone(528, 0.3, 'sine', 0.2);
        setTimeout(() => this.playTone(639, 0.3, 'sine', 0.2), 150);
        setTimeout(() => this.playTone(741, 0.5, 'sine', 0.25), 300);
    },

    /**
     * Play tick sound for countdown
     */
    playTick() {
        this.playTone(800, 0.05, 'sine', 0.1);
    },

    /**
     * Play sound based on phase type
     * @param {string} phaseType - 'inhale', 'hold', or 'exhale'
     */
    playPhaseSound(phaseType) {
        switch (phaseType) {
            case 'inhale':
                this.playInhale();
                break;
            case 'hold':
                this.playHold();
                break;
            case 'exhale':
                this.playExhale();
                break;
        }
    }
};
