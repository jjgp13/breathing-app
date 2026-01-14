/**
 * Arc Animation (4-7-8 Technique)
 * Creates a circular arc that fills with different colored segments
 */

const ArcAnimation = {
    elements: {
        container: null,
        arcInhale: null,
        arcHold: null,
        arcExhale: null,
        timer: null
    },
    
    // Circle circumference for r=42
    CIRCUMFERENCE: 2 * Math.PI * 42, // ~264

    /**
     * Initialize animation elements
     */
    init() {
        this.elements.container = document.getElementById('arcAnimation');
        this.elements.arcInhale = document.getElementById('arcInhale');
        this.elements.arcHold = document.getElementById('arcHold');
        this.elements.arcExhale = document.getElementById('arcExhale');
        this.elements.timer = document.getElementById('timerArc');
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
     * Reset all arcs to initial state
     */
    reset() {
        const arcs = [this.elements.arcInhale, this.elements.arcHold, this.elements.arcExhale];
        arcs.forEach(arc => {
            if (arc) {
                arc.setAttribute('stroke-dasharray', `0 ${this.CIRCUMFERENCE}`);
                arc.setAttribute('stroke-dashoffset', '0');
            }
        });
    },

    /**
     * Update animation progress for a specific phase
     * @param {number} phaseIndex - Current phase (0=inhale, 1=hold, 2=exhale)
     * @param {number} progress - Progress (0-1)
     * @param {Object} technique - The technique data containing phase durations
     */
    update(phaseIndex, progress, technique) {
        // Calculate total duration for proportional arc lengths
        const totalDuration = technique.phases.reduce((sum, p) => sum + p.duration, 0);
        
        // Get arc length for each phase proportionally
        const phaseLengths = technique.phases.map(p => 
            (p.duration / totalDuration) * this.CIRCUMFERENCE
        );
        
        // Calculate starting offset for current phase
        let offset = 0;
        for (let i = 0; i < phaseIndex; i++) {
            offset += phaseLengths[i];
        }
        
        // Get the current arc element
        const arcElements = [
            this.elements.arcInhale,
            this.elements.arcHold,
            this.elements.arcExhale
        ];
        const currentArc = arcElements[phaseIndex];
        
        if (currentArc) {
            const segmentLength = phaseLengths[phaseIndex] * progress;
            currentArc.setAttribute('stroke-dasharray', `${segmentLength} ${this.CIRCUMFERENCE}`);
            currentArc.setAttribute('stroke-dashoffset', `-${offset}`);
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
