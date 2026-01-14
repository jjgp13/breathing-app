/**
 * Box Breathing Animation
 * Creates a square animation where each side fills progressively
 */

const BoxAnimation = {
    elements: {
        container: null,
        sideTop: null,
        sideRight: null,
        sideBottom: null,
        sideLeft: null,
        timer: null
    },

    /**
     * Initialize animation elements
     */
    init() {
        this.elements.container = document.getElementById('boxAnimation');
        this.elements.sideTop = document.getElementById('sideTop');
        this.elements.sideRight = document.getElementById('sideRight');
        this.elements.sideBottom = document.getElementById('sideBottom');
        this.elements.sideLeft = document.getElementById('sideLeft');
        this.elements.timer = document.getElementById('timerBox');
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
     * Reset all sides to initial state
     */
    reset() {
        if (this.elements.sideTop) this.elements.sideTop.style.width = '0%';
        if (this.elements.sideRight) this.elements.sideRight.style.height = '0%';
        if (this.elements.sideBottom) this.elements.sideBottom.style.width = '0%';
        if (this.elements.sideLeft) this.elements.sideLeft.style.height = '0%';
    },

    /**
     * Update animation progress for a specific phase
     * @param {number} phaseIndex - Current phase (0-3)
     * @param {number} progress - Progress percentage (0-100)
     */
    update(phaseIndex, progress) {
        switch (phaseIndex) {
            case 0: // Inhale - Top side, left to right
                if (this.elements.sideTop) {
                    this.elements.sideTop.style.width = `${progress}%`;
                }
                break;
            case 1: // Hold - Right side, top to bottom
                if (this.elements.sideRight) {
                    this.elements.sideRight.style.height = `${progress}%`;
                }
                break;
            case 2: // Exhale - Bottom side, right to left
                if (this.elements.sideBottom) {
                    this.elements.sideBottom.style.width = `${progress}%`;
                }
                break;
            case 3: // Hold - Left side, bottom to top
                if (this.elements.sideLeft) {
                    this.elements.sideLeft.style.height = `${progress}%`;
                }
                break;
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
