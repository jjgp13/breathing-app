/**
 * Background Animations Module
 * Handles creation and management of background visual effects
 */

const BackgroundManager = {
    container: null,

    /**
     * Initialize with the container element
     * @param {HTMLElement} container - The background animation container
     */
    init(container) {
        this.container = container;
    },

    /**
     * Clear all existing animations
     */
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    },

    /**
     * Create floating particle elements
     * @param {number} count - Number of particles to create
     */
    createParticles(count = 30) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 20 + 5;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDuration = `${Math.random() * 15 + 10}s`;
            particle.style.animationDelay = `${Math.random() * 10}s`;
            this.container.appendChild(particle);
        }
    },

    /**
     * Create wave elements
     * @param {number} count - Number of wave layers
     */
    createWaves(count = 3) {
        for (let i = 0; i < count; i++) {
            const wave = document.createElement('div');
            wave.className = 'wave';
            this.container.appendChild(wave);
        }
    },

    /**
     * Create gradient background element
     */
    createGradient() {
        const gradient = document.createElement('div');
        gradient.className = 'gradient-bg';
        this.container.appendChild(gradient);
    },

    /**
     * Set the background animation type
     * @param {string} type - Animation type: 'particles', 'waves', 'gradient', 'combined', 'none'
     */
    setAnimation(type) {
        this.clear();
        
        switch (type) {
            case 'particles':
                this.createParticles();
                break;
            case 'waves':
                this.createWaves();
                break;
            case 'gradient':
                this.createGradient();
                break;
            case 'combined':
                this.createGradient();
                this.createParticles();
                this.createWaves();
                break;
            case 'none':
            default:
                // No animation
                break;
        }
    }
};
