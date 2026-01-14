/**
 * Gauge/Buteyko Animation
 * Creates a circular gauge that measures the Control Pause
 * and shows subtle breathing for the shallow breathing phase
 */

const GaugeAnimation = {
    elements: {
        container: null,
        gaugeBg: null,
        gaugeFill: null,
        centerCircle: null,
        cpLabel: null,
        timer: null
    },

    // Animation parameters
    maxGaugeAngle: 270, // degrees

    /**
     * Easing function for smooth motion
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased value
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    },

    /**
     * Initialize animation elements
     */
    init() {
        this.elements.container = document.getElementById('gaugeAnimation');
        this.elements.gaugeBg = document.getElementById('gaugeBg');
        this.elements.gaugeFill = document.getElementById('gaugeFill');
        this.elements.centerCircle = document.getElementById('gaugeCenter');
        this.elements.cpLabel = document.getElementById('cpLabel');
        this.elements.timer = document.getElementById('timerGauge');
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
        if (this.elements.gaugeFill) {
            this.elements.gaugeFill.style.strokeDasharray = '0 283';
        }
        if (this.elements.centerCircle) {
            this.elements.centerCircle.style.transform = 'scale(1)';
            this.elements.centerCircle.style.opacity = '0.8';
        }
        if (this.elements.cpLabel) {
            this.elements.cpLabel.textContent = 'CP';
            this.elements.cpLabel.style.opacity = '0.7';
        }
    },

    /**
     * Update animation progress for a specific phase
     * @param {number} phaseIndex - Current phase (0=inhale, 1=exhale, 2=hold/CP, 3=shallow)
     * @param {number} progress - Progress (0-1)
     */
    update(phaseIndex, progress) {
        const normalizedProgress = progress > 1 ? progress / 100 : progress;
        
        switch (phaseIndex) {
            case 0:
                this.animateLightInhale(normalizedProgress);
                break;
            case 1:
                this.animateLightExhale(normalizedProgress);
                break;
            case 2:
                this.animateControlPause(normalizedProgress);
                break;
            case 3:
                this.animateShallowBreathing(normalizedProgress);
                break;
        }
    },

    /**
     * Animate light inhale - subtle expansion
     */
    animateLightInhale(progress) {
        const easedProgress = this.easeOutCubic(progress);
        
        if (this.elements.cpLabel) {
            this.elements.cpLabel.textContent = 'IN';
            this.elements.cpLabel.style.opacity = '0.8';
        }
        
        if (this.elements.centerCircle) {
            const scale = 0.9 + (0.15 * easedProgress);
            this.elements.centerCircle.style.transform = `scale(${scale})`;
            this.elements.centerCircle.style.opacity = 0.7 + (0.2 * easedProgress);
        }
        
        // Reset gauge
        if (this.elements.gaugeFill) {
            this.elements.gaugeFill.style.strokeDasharray = '0 283';
        }
    },

    /**
     * Animate light exhale - subtle contraction
     */
    animateLightExhale(progress) {
        const easedProgress = this.easeOutCubic(progress);
        
        if (this.elements.cpLabel) {
            this.elements.cpLabel.textContent = 'OUT';
            this.elements.cpLabel.style.opacity = '0.8';
        }
        
        if (this.elements.centerCircle) {
            const scale = 1.05 - (0.15 * easedProgress);
            this.elements.centerCircle.style.transform = `scale(${scale})`;
            this.elements.centerCircle.style.opacity = 0.9 - (0.2 * easedProgress);
        }
    },

    /**
     * Animate Control Pause - gauge fills as you hold
     */
    animateControlPause(progress) {
        const easedProgress = this.easeOutCubic(progress);
        
        if (this.elements.cpLabel) {
            this.elements.cpLabel.textContent = 'HOLD';
            this.elements.cpLabel.style.opacity = '1';
        }
        
        // Fill the gauge based on progress
        // Full circle circumference = 2 * PI * r = 2 * 3.14159 * 45 ≈ 283
        const circumference = 283;
        const fillAmount = circumference * 0.75 * easedProgress; // 75% of circle (270 degrees)
        
        if (this.elements.gaugeFill) {
            this.elements.gaugeFill.style.strokeDasharray = `${fillAmount} ${circumference}`;
            
            // Change color based on progress (green = good CP)
            const hue = 150 + (progress * 30); // Goes from teal to green
            const saturation = 60 + (progress * 20);
            this.elements.gaugeFill.style.stroke = `hsl(${hue}, ${saturation}%, 55%)`;
        }
        
        // Subtle pulse on center
        if (this.elements.centerCircle) {
            const pulse = Math.sin(progress * Math.PI * 4) * 0.05;
            this.elements.centerCircle.style.transform = `scale(${0.9 + pulse})`;
            this.elements.centerCircle.style.opacity = 0.7 + (progress * 0.3);
        }
    },

    /**
     * Animate shallow breathing - gentle, minimal movement
     */
    animateShallowBreathing(progress) {
        if (this.elements.cpLabel) {
            this.elements.cpLabel.textContent = 'LIGHT';
            this.elements.cpLabel.style.opacity = '0.7';
        }
        
        // Very subtle breathing pattern - multiple micro-breaths
        const breathCycles = 10; // 10 mini breaths in the shallow phase
        const breathProgress = (progress * breathCycles) % 1;
        const breathPhase = breathProgress < 0.5 
            ? breathProgress * 2 
            : (1 - breathProgress) * 2;
        
        // Very subtle scale change (0.92 to 0.98 - barely noticeable)
        if (this.elements.centerCircle) {
            const scale = 0.92 + (0.06 * breathPhase);
            this.elements.centerCircle.style.transform = `scale(${scale})`;
            this.elements.centerCircle.style.opacity = 0.6 + (0.15 * breathPhase);
        }
        
        // Gauge slowly fades during shallow breathing
        if (this.elements.gaugeFill) {
            const fadeOpacity = 1 - (progress * 0.5);
            this.elements.gaugeFill.style.opacity = fadeOpacity;
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
