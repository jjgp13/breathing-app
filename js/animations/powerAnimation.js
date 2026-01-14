/**
 * Power/Wim Hof Animation
 * Creates an energetic pulsing animation for the Wim Hof breathing method
 * Shows rapid breathing pulses, then a glowing retention, then recovery
 */

const PowerAnimation = {
    elements: {
        container: null,
        core: null,
        ring1: null,
        ring2: null,
        ring3: null,
        breathCounter: null,
        timer: null
    },

    // Animation state
    currentSubBreath: 0,
    subBreathProgress: 0,

    /**
     * Initialize animation elements
     */
    init() {
        this.elements.container = document.getElementById('powerAnimation');
        this.elements.core = document.getElementById('powerCore');
        this.elements.ring1 = document.getElementById('powerRing1');
        this.elements.ring2 = document.getElementById('powerRing2');
        this.elements.ring3 = document.getElementById('powerRing3');
        this.elements.breathCounter = document.getElementById('breathCounter');
        this.elements.timer = document.getElementById('timerPower');
    },

    /**
     * Show this animation
     */
    show() {
        if (this.elements.container) {
            this.elements.container.style.display = 'flex';
        }
    },

    /**
     * Hide this animation
     */
    hide() {
        if (this.elements.container) {
            this.elements.container.style.display = 'none';
        }
    },

    /**
     * Reset to initial state
     */
    reset() {
        this.currentSubBreath = 0;
        this.subBreathProgress = 0;
        
        if (this.elements.core) {
            this.elements.core.style.transform = 'scale(0.6)';
            this.elements.core.style.opacity = '0.7';
        }
        if (this.elements.ring1) this.elements.ring1.style.transform = 'scale(0.8)';
        if (this.elements.ring2) this.elements.ring2.style.transform = 'scale(0.9)';
        if (this.elements.ring3) this.elements.ring3.style.transform = 'scale(1.0)';
        if (this.elements.breathCounter) {
            this.elements.breathCounter.style.display = 'none';
        }
    },

    /**
     * Update animation progress for a specific phase
     * @param {number} phaseIndex - Current phase (0=power breaths, 1=retention, 2=recovery)
     * @param {number} progress - Progress (0-1)
     * @param {Object} tech - Technique object with phase info
     */
    update(phaseIndex, progress, tech) {
        const normalizedProgress = progress > 1 ? progress / 100 : progress;
        
        if (phaseIndex === 0) {
            // POWER BREATHS - rapid pulsing animation
            this.animatePowerBreaths(normalizedProgress, tech);
        } else if (phaseIndex === 1) {
            // RETENTION - glowing hold
            this.animateRetention(normalizedProgress);
        } else {
            // RECOVERY - deep breath and hold
            this.animateRecovery(normalizedProgress);
        }
    },

    /**
     * Animate the power breathing phase (30 rapid breaths)
     */
    animatePowerBreaths(progress, tech) {
        const totalBreaths = tech?.phases[0]?.subBreaths || 30;
        const breathNumber = Math.floor(progress * totalBreaths) + 1;
        const breathProgress = (progress * totalBreaths) % 1;
        
        // Show breath counter
        if (this.elements.breathCounter) {
            this.elements.breathCounter.style.display = 'block';
            this.elements.breathCounter.textContent = Math.min(breathNumber, totalBreaths);
        }
        
        // Rapid pulse effect - each breath is a quick in/out
        const pulsePhase = breathProgress < 0.6 ? breathProgress / 0.6 : (1 - breathProgress) / 0.4;
        const pulseScale = 0.6 + (0.5 * pulsePhase);
        const pulseOpacity = 0.5 + (0.5 * pulsePhase);
        
        // Core pulsing
        if (this.elements.core) {
            this.elements.core.style.transform = `scale(${pulseScale})`;
            this.elements.core.style.opacity = pulseOpacity;
            this.elements.core.style.boxShadow = `
                0 0 ${30 + pulsePhase * 40}px rgba(255, 112, 67, ${0.5 + pulsePhase * 0.3}),
                0 0 ${60 + pulsePhase * 60}px rgba(255, 112, 67, ${0.3 + pulsePhase * 0.2}),
                inset 0 0 30px rgba(255, 200, 150, ${0.3 + pulsePhase * 0.2})
            `;
        }
        
        // Rings expand outward with each breath (building energy)
        const energyBuild = progress; // 0 to 1 over all breaths
        if (this.elements.ring1) {
            this.elements.ring1.style.transform = `scale(${0.9 + energyBuild * 0.3 + pulsePhase * 0.1})`;
            this.elements.ring1.style.opacity = 0.4 + energyBuild * 0.3;
        }
        if (this.elements.ring2) {
            this.elements.ring2.style.transform = `scale(${1.0 + energyBuild * 0.35 + pulsePhase * 0.08})`;
            this.elements.ring2.style.opacity = 0.3 + energyBuild * 0.25;
        }
        if (this.elements.ring3) {
            this.elements.ring3.style.transform = `scale(${1.1 + energyBuild * 0.4 + pulsePhase * 0.05})`;
            this.elements.ring3.style.opacity = 0.2 + energyBuild * 0.2;
        }
    },

    /**
     * Animate the retention (breath hold) phase
     */
    animateRetention(progress) {
        // Hide breath counter during retention
        if (this.elements.breathCounter) {
            this.elements.breathCounter.style.display = 'none';
        }
        
        // Slow pulsing glow during hold
        const slowPulse = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5;
        const fadeEffect = 1 - (progress * 0.3); // Slowly dim as hold continues
        
        if (this.elements.core) {
            this.elements.core.style.transform = `scale(${0.9 + slowPulse * 0.15})`;
            this.elements.core.style.opacity = 0.7 + slowPulse * 0.3;
            this.elements.core.style.boxShadow = `
                0 0 ${50 + slowPulse * 30}px rgba(255, 112, 67, ${0.6 * fadeEffect}),
                0 0 ${100 + slowPulse * 40}px rgba(255, 112, 67, ${0.3 * fadeEffect}),
                inset 0 0 40px rgba(255, 200, 150, 0.4)
            `;
        }
        
        // Rings slowly contract during retention
        const contractAmount = progress * 0.2;
        if (this.elements.ring1) {
            this.elements.ring1.style.transform = `scale(${1.2 - contractAmount})`;
            this.elements.ring1.style.opacity = 0.6 - progress * 0.2;
        }
        if (this.elements.ring2) {
            this.elements.ring2.style.transform = `scale(${1.35 - contractAmount})`;
            this.elements.ring2.style.opacity = 0.5 - progress * 0.15;
        }
        if (this.elements.ring3) {
            this.elements.ring3.style.transform = `scale(${1.5 - contractAmount})`;
            this.elements.ring3.style.opacity = 0.4 - progress * 0.1;
        }
    },

    /**
     * Animate the recovery breath phase
     */
    animateRecovery(progress) {
        // Hide breath counter
        if (this.elements.breathCounter) {
            this.elements.breathCounter.style.display = 'none';
        }
        
        // Quick inhale at start, then hold
        const inhalePhase = Math.min(progress * 5, 1); // First 20% is inhale
        const holdPhase = progress > 0.2 ? (progress - 0.2) / 0.8 : 0;
        
        const scale = 0.7 + (0.4 * inhalePhase);
        const glowPulse = Math.sin(holdPhase * Math.PI * 2) * 0.3 + 0.7;
        
        if (this.elements.core) {
            this.elements.core.style.transform = `scale(${scale})`;
            this.elements.core.style.opacity = 0.8 + inhalePhase * 0.2;
            this.elements.core.style.boxShadow = `
                0 0 ${40 + glowPulse * 30}px rgba(255, 183, 77, 0.6),
                0 0 ${80 + glowPulse * 40}px rgba(255, 112, 67, 0.3),
                inset 0 0 30px rgba(255, 220, 180, 0.4)
            `;
        }
        
        // Rings gently pulse during recovery
        if (this.elements.ring1) {
            this.elements.ring1.style.transform = `scale(${1.0 + glowPulse * 0.1})`;
            this.elements.ring1.style.opacity = 0.5;
        }
        if (this.elements.ring2) {
            this.elements.ring2.style.transform = `scale(${1.15 + glowPulse * 0.08})`;
            this.elements.ring2.style.opacity = 0.4;
        }
        if (this.elements.ring3) {
            this.elements.ring3.style.transform = `scale(${1.3 + glowPulse * 0.05})`;
            this.elements.ring3.style.opacity = 0.3;
        }
    },

    /**
     * Update the timer display
     * @param {number|string} value - Timer value to display
     */
    updateTimer(value) {
        if (this.elements.timer) {
            this.elements.timer.textContent = value;
        }
    },

    /**
     * Get the timer element
     * @returns {HTMLElement} Timer element
     */
    getTimerElement() {
        return this.elements.timer;
    }
};
