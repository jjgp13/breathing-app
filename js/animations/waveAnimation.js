/**
 * Wave/Resonance Animation
 * Creates a flowing wave that represents the continuous, coherent breathing pattern
 * The wave rises during inhale and falls during exhale with no pauses
 */

const WaveAnimation = {
    elements: {
        container: null,
        wave1: null,
        wave2: null,
        wave3: null,
        ball: null,
        timer: null
    },

    // Animation parameters
    waveHeight: 80,

    /**
     * Easing function for smooth sine wave motion
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased value
     */
    easeInOutSine(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    },

    /**
     * Initialize animation elements
     */
    init() {
        this.elements.container = document.getElementById('waveAnimation');
        this.elements.wave1 = document.getElementById('wave1');
        this.elements.wave2 = document.getElementById('wave2');
        this.elements.wave3 = document.getElementById('wave3');
        this.elements.ball = document.getElementById('waveBall');
        this.elements.timer = document.getElementById('timerWave');
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
        if (this.elements.ball) {
            this.elements.ball.style.transform = 'translateY(0px)';
        }
    },

    /**
     * Update animation progress for a specific phase
     * @param {number} phaseIndex - Current phase (0=inhale, 1=exhale)
     * @param {number} progress - Progress (0-1)
     */
    update(phaseIndex, progress) {
        const normalizedProgress = progress > 1 ? progress / 100 : progress;
        const easedProgress = this.easeInOutSine(normalizedProgress);
        
        let yOffset, glowIntensity;

        if (phaseIndex === 0) {
            // INHALE - ball rises up (negative Y)
            yOffset = -this.waveHeight * easedProgress;
            glowIntensity = 0.4 + (0.4 * easedProgress);
        } else {
            // EXHALE - ball falls down (returns to center)
            yOffset = -this.waveHeight * (1 - easedProgress);
            glowIntensity = 0.8 - (0.4 * easedProgress);
        }

        // Update ball position
        if (this.elements.ball) {
            this.elements.ball.style.transform = `translateY(${yOffset}px)`;
            this.elements.ball.style.boxShadow = `
                0 0 ${30 + glowIntensity * 30}px rgba(121, 134, 203, ${glowIntensity}),
                0 0 ${60 + glowIntensity * 40}px rgba(121, 134, 203, ${glowIntensity * 0.5}),
                inset 0 0 20px rgba(255, 255, 255, ${glowIntensity * 0.3})
            `;
        }

        // Update wave phases for flowing effect
        if (this.elements.wave1) {
            const wave1Phase = (normalizedProgress + (phaseIndex === 1 ? 0.5 : 0)) * 360;
            this.elements.wave1.style.transform = `translateX(-50%) translateY(${Math.sin(wave1Phase * Math.PI / 180) * 10}px)`;
        }
        if (this.elements.wave2) {
            const wave2Phase = (normalizedProgress + (phaseIndex === 1 ? 0.5 : 0)) * 360 + 120;
            this.elements.wave2.style.transform = `translateX(-50%) translateY(${Math.sin(wave2Phase * Math.PI / 180) * 8}px)`;
        }
        if (this.elements.wave3) {
            const wave3Phase = (normalizedProgress + (phaseIndex === 1 ? 0.5 : 0)) * 360 + 240;
            this.elements.wave3.style.transform = `translateX(-50%) translateY(${Math.sin(wave3Phase * Math.PI / 180) * 6}px)`;
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
