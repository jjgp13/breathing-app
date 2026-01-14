/**
 * Belly/Diaphragmatic Breathing Animation
 * Creates a circle that expands (inhale) and contracts (exhale) to represent belly movement
 */

const BellyAnimation = {
    elements: {
        container: null,
        circle: null,
        innerCircle: null,
        timer: null
    },

    // Animation parameters
    minScale: 0.5,
    maxScale: 1.15,

    /**
     * Easing function for smooth, natural breathing motion
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
        this.elements.container = document.getElementById('bellyAnimation');
        this.elements.circle = document.getElementById('bellyCircle');
        this.elements.innerCircle = document.getElementById('bellyInnerCircle');
        this.elements.timer = document.getElementById('timerBelly');
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
     * Reset to initial state (contracted - belly at rest)
     */
    reset() {
        if (this.elements.circle) {
            this.elements.circle.style.transform = `scale(${this.minScale})`;
            this.elements.circle.style.opacity = '0.7';
        }
        if (this.elements.innerCircle) {
            this.elements.innerCircle.style.transform = `scale(${this.minScale})`;
            this.elements.innerCircle.style.opacity = '0.5';
        }
    },

    /**
     * Update animation progress for a specific phase
     * @param {number} phaseIndex - Current phase (0=inhale, 1=exhale)
     * @param {number} progress - Progress (0-1)
     */
    update(phaseIndex, progress) {
        // Normalize progress to 0-1 range
        const normalizedProgress = progress > 1 ? progress / 100 : progress;
        
        // Apply easing for natural breathing feel
        const easedProgress = this.easeInOutSine(normalizedProgress);
        
        let scale, opacity;

        if (phaseIndex === 0) {
            // INHALE - belly expands (circle grows)
            scale = this.minScale + (this.maxScale - this.minScale) * easedProgress;
            opacity = 0.7 + (0.3 * easedProgress); // Gets brighter as it expands
        } else {
            // EXHALE - belly contracts (circle shrinks)
            scale = this.maxScale - (this.maxScale - this.minScale) * easedProgress;
            opacity = 1.0 - (0.3 * easedProgress); // Gets dimmer as it contracts
        }

        // Apply to outer circle
        if (this.elements.circle) {
            this.elements.circle.style.transform = `scale(${scale})`;
            this.elements.circle.style.opacity = opacity;
        }
        
        // Inner circle follows with slight delay for organic, breathing feel
        if (this.elements.innerCircle) {
            const innerDelay = 0.08;
            const delayedProgress = Math.max(0, normalizedProgress - innerDelay);
            const easedDelayedProgress = this.easeInOutSine(delayedProgress / (1 - innerDelay));
            
            let innerScale;
            if (phaseIndex === 0) {
                innerScale = this.minScale + (this.maxScale - this.minScale) * easedDelayedProgress;
            } else {
                innerScale = this.maxScale - (this.maxScale - this.minScale) * easedDelayedProgress;
            }
            
            this.elements.innerCircle.style.transform = `scale(${innerScale * 0.85})`;
            this.elements.innerCircle.style.opacity = opacity * 0.7;
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
