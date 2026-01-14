/**
 * Main Application Module
 * Coordinates all components and manages the breathing exercise flow
 */

const App = {
    // Application state
    state: {
        currentScreen: 'menu',
        selectedTechnique: null,
        isRunning: false,
        isPaused: false,
        currentCycle: 1,
        totalCycles: 4,
        currentPhase: 0,
        timeRemaining: 4,
        phaseElapsed: 0,
        animationFrame: null,
        lastTimestamp: null,
        startTime: null,
        pauseStartTime: null,
        totalPausedTime: 0,
        // Carousel state
        carouselIndex: 0,
        carouselDragging: false,
        carouselStartX: 0,
        carouselCurrentX: 0
    },

    // DOM element references
    elements: {},

    /**
     * Initialize the application
     */
    async init() {
        this.cacheElements();
        await I18n.init(); // Initialize translations first
        this.initModules();
        this.bindEvents();
        this.generateTechniqueCards();
        BackgroundManager.setAnimation('particles');
    },

    /**
     * Cache DOM element references
     */
    cacheElements() {
        this.elements = {
            // Screens
            menuScreen: document.getElementById('menu-screen'),
            detailScreen: document.getElementById('detail-screen'),
            breathingScreen: document.getElementById('breathing-screen'),
            congratsScreen: document.getElementById('congrats-screen'),
            
            // Navigation
            backBtn: document.getElementById('backBtn'),
            soundToggle: document.getElementById('soundToggle'),
            langSelector: document.getElementById('langSelector'),
            
            // Carousel
            carouselTrack: document.getElementById('carouselTrack'),
            carouselPrev: document.getElementById('carouselPrev'),
            carouselNext: document.getElementById('carouselNext'),
            carouselDots: document.getElementById('carouselDots'),
            startFromCarousel: document.getElementById('startFromCarousel'),
            bgAnimationSelect: document.getElementById('bgAnimation'),
            
            // Detail screen
            detailIcon: document.getElementById('detailIcon'),
            detailName: document.getElementById('detailName'),
            detailTagline: document.getElementById('detailTagline'),
            detailScience: document.getElementById('detailScience'),
            detailMechanism: document.getElementById('detailMechanism'),
            detailSteps: document.getElementById('detailSteps'),
            repetitionsSlider: document.getElementById('repetitions'),
            repValue: document.getElementById('repValue'),
            startPracticeBtn: document.getElementById('startPracticeBtn'),
            
            // Breathing screen
            breathingTitle: document.getElementById('breathingTitle'),
            instruction: document.getElementById('instruction'),
            currentCycleEl: document.getElementById('currentCycle'),
            totalCyclesEl: document.getElementById('totalCycles'),
            pauseBtn: document.getElementById('pauseBtn'),
            stopBtn: document.getElementById('stopBtn'),
            phaseIndicator: document.getElementById('phaseIndicator'),
            
            // Congrats screen
            statTechnique: document.getElementById('statTechnique'),
            statCycles: document.getElementById('statCycles'),
            statTime: document.getElementById('statTime'),
            practiceAgainBtn: document.getElementById('practiceAgainBtn'),
            mainMenuBtn: document.getElementById('mainMenuBtn')
        };
    },

    /**
     * Initialize sub-modules
     */
    initModules() {
        BackgroundManager.init(document.getElementById('background-animation'));
        BoxAnimation.init();
        ArcAnimation.init();
        BellyAnimation.init();
        WaveAnimation.init();
        PowerAnimation.init();
        GaugeAnimation.init();
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Language selector
        this.elements.langSelector.addEventListener('change', (e) => {
            I18n.setLanguage(e.target.value);
        });

        // Background animation selector
        this.elements.bgAnimationSelect.addEventListener('change', (e) => {
            BackgroundManager.setAnimation(e.target.value);
        });

        // Sound toggle
        this.elements.soundToggle.addEventListener('click', () => {
            const enabled = AudioManager.toggle();
            this.elements.soundToggle.textContent = enabled ? '🔊' : '🔇';
        });

        // Navigation
        this.elements.backBtn.addEventListener('click', () => this.goBack());

        // Carousel navigation
        this.elements.carouselPrev.addEventListener('click', () => this.carouselPrev());
        this.elements.carouselNext.addEventListener('click', () => this.carouselNext());
        
        // Carousel touch/mouse events
        this.elements.carouselTrack.addEventListener('mousedown', (e) => this.carouselDragStart(e));
        this.elements.carouselTrack.addEventListener('mousemove', (e) => this.carouselDragMove(e));
        this.elements.carouselTrack.addEventListener('mouseup', () => this.carouselDragEnd());
        this.elements.carouselTrack.addEventListener('mouseleave', () => this.carouselDragEnd());
        
        this.elements.carouselTrack.addEventListener('touchstart', (e) => this.carouselDragStart(e), { passive: true });
        this.elements.carouselTrack.addEventListener('touchmove', (e) => this.carouselDragMove(e), { passive: true });
        this.elements.carouselTrack.addEventListener('touchend', () => this.carouselDragEnd());
        
        // Start from carousel
        this.elements.startFromCarousel.addEventListener('click', () => {
            const techIds = Object.keys(techniques);
            const selectedId = techIds[this.state.carouselIndex];
            this.showTechniqueDetail(selectedId);
        });

        // Repetitions slider
        this.elements.repetitionsSlider.addEventListener('input', (e) => {
            this.elements.repValue.textContent = e.target.value;
        });

        // Start practice
        this.elements.startPracticeBtn.addEventListener('click', () => this.startExercise());

        // Pause/Stop
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.stopBtn.addEventListener('click', () => this.stopExercise());

        // Congrats screen buttons
        this.elements.practiceAgainBtn.addEventListener('click', () => {
            this.showScreen('detail-screen');
        });
        this.elements.mainMenuBtn.addEventListener('click', () => {
            this.showScreen('menu-screen');
        });
    },

    /**
     * Generate carousel cards for technique selection
     */
    generateTechniqueCards() {
        this.elements.carouselTrack.innerHTML = '';
        this.elements.carouselDots.innerHTML = '';
        
        const techArray = Object.values(techniques);
        
        techArray.forEach((tech, index) => {
            // Create carousel card
            const card = document.createElement('div');
            card.className = 'carousel-card';
            card.dataset.id = tech.id;
            card.dataset.index = index;
            
            const totalTime = tech.phases.reduce((sum, p) => sum + p.duration, 0);
            const timingText = tech.phases.map(p => p.duration).join('-');
            
            // Get translated content
            const name = I18n.getTechnique(tech.id, 'name');
            const tagline = I18n.getTechnique(tech.id, 'tagline');
            const perCycle = I18n.t('detail.perCycle') || 'per cycle';
            const pattern = I18n.t('detail.pattern') || 'pattern';
            
            card.innerHTML = `
                <div class="icon">${tech.icon}</div>
                <div class="name">${name}</div>
                <div class="tagline">${tagline}</div>
                <div class="timing">${timingText} ${pattern} • ${Math.round(totalTime)}s ${perCycle}</div>
            `;
            
            this.elements.carouselTrack.appendChild(card);
            
            // Create dot indicator
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
            dot.dataset.index = index;
            dot.addEventListener('click', () => this.carouselGoTo(index));
            this.elements.carouselDots.appendChild(dot);
        });
        
        this.updateCarouselPosition();
    },

    /**
     * Navigate carousel to previous item
     */
    carouselPrev() {
        const totalItems = Object.keys(techniques).length;
        this.state.carouselIndex = (this.state.carouselIndex - 1 + totalItems) % totalItems;
        this.updateCarouselPosition();
    },

    /**
     * Navigate carousel to next item
     */
    carouselNext() {
        const totalItems = Object.keys(techniques).length;
        this.state.carouselIndex = (this.state.carouselIndex + 1) % totalItems;
        this.updateCarouselPosition();
    },

    /**
     * Navigate carousel to specific index
     */
    carouselGoTo(index) {
        this.state.carouselIndex = index;
        this.updateCarouselPosition();
    },

    /**
     * Update carousel visual position
     */
    updateCarouselPosition() {
        const offset = -this.state.carouselIndex * 100;
        this.elements.carouselTrack.style.transform = `translateX(${offset}%)`;
        
        // Update dots
        const dots = this.elements.carouselDots.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.state.carouselIndex);
        });
    },

    /**
     * Handle carousel drag start
     */
    carouselDragStart(e) {
        this.state.carouselDragging = true;
        this.state.carouselStartX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        this.elements.carouselTrack.style.transition = 'none';
    },

    /**
     * Handle carousel drag move
     */
    carouselDragMove(e) {
        if (!this.state.carouselDragging) return;
        
        const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const diff = currentX - this.state.carouselStartX;
        const trackWidth = this.elements.carouselTrack.offsetWidth / Object.keys(techniques).length;
        const percentMove = (diff / trackWidth) * 100;
        const baseOffset = -this.state.carouselIndex * 100;
        
        this.elements.carouselTrack.style.transform = `translateX(${baseOffset + percentMove}%)`;
        this.state.carouselCurrentX = currentX;
    },

    /**
     * Handle carousel drag end
     */
    carouselDragEnd() {
        if (!this.state.carouselDragging) return;
        
        this.state.carouselDragging = false;
        this.elements.carouselTrack.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        const diff = this.state.carouselCurrentX - this.state.carouselStartX;
        const threshold = 50;
        
        if (diff > threshold) {
            this.carouselPrev();
        } else if (diff < -threshold) {
            this.carouselNext();
        } else {
            this.updateCarouselPosition();
        }
    },

    /**
     * Show a specific screen
     * @param {string} screenId - The screen element ID
     */
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        this.state.currentScreen = screenId.replace('-screen', '');
        
        // Show/hide back button
        this.elements.backBtn.classList.toggle('visible', screenId !== 'menu-screen');
    },

    /**
     * Navigate back based on current screen
     */
    goBack() {
        if (this.state.isRunning) {
            this.stopExercise();
            return;
        }
        
        switch (this.state.currentScreen) {
            case 'detail':
            case 'congrats':
                this.showScreen('menu-screen');
                break;
            case 'breathing':
                this.stopExercise();
                break;
            default:
                this.showScreen('menu-screen');
        }
    },

    /**
     * Show technique detail screen
     * @param {string} techId - Technique identifier
     */
    showTechniqueDetail(techId) {
        const tech = techniques[techId];
        if (!tech) return;
        
        this.state.selectedTechnique = tech;
        
        // Get translated content
        const name = I18n.getTechnique(techId, 'name');
        const tagline = I18n.getTechnique(techId, 'tagline');
        const science = I18n.getTechnique(techId, 'science');
        const mechanism = I18n.getTechnique(techId, 'mechanism');
        const steps = I18n.getTechnique(techId, 'steps');
        
        this.elements.detailIcon.textContent = tech.icon;
        this.elements.detailName.textContent = name;
        this.elements.detailTagline.textContent = tagline;
        this.elements.detailScience.textContent = science;
        this.elements.detailMechanism.textContent = mechanism;
        
        // Generate steps list
        this.elements.detailSteps.innerHTML = '';
        (Array.isArray(steps) ? steps : tech.steps).forEach((step, index) => {
            const li = document.createElement('li');
            li.dataset.step = `${index + 1}.`;
            li.textContent = step;
            this.elements.detailSteps.appendChild(li);
        });
        
        // Set slider limits
        this.elements.repetitionsSlider.max = tech.maxCycles;
        this.elements.repetitionsSlider.value = tech.defaultCycles;
        this.elements.repValue.textContent = tech.defaultCycles;
        
        this.showScreen('detail-screen');
    },

    /**
     * Start the breathing exercise
     */
    startExercise() {
        if (!this.state.selectedTechnique) return;
        
        AudioManager.init();
        
        const tech = this.state.selectedTechnique;
        this.state.totalCycles = parseInt(this.elements.repetitionsSlider.value);
        this.state.currentCycle = 1;
        this.state.currentPhase = 0;
        this.state.isRunning = true;
        this.state.isPaused = false;
        this.state.startTime = Date.now();
        this.state.totalPausedTime = 0;
        this.state.phaseElapsed = 0;
        
        // Setup UI with translated name
        this.elements.breathingTitle.textContent = I18n.getTechnique(tech.id, 'name');
        this.elements.totalCyclesEl.textContent = this.state.totalCycles;
        this.elements.currentCycleEl.textContent = this.state.currentCycle;
        this.elements.pauseBtn.textContent = I18n.t('breathing.pause');
        
        // Setup animation
        this.setupAnimation(tech.animation);
        
        // Show phase indicator for arc animation
        this.elements.phaseIndicator.style.display = tech.animation === 'arc' ? 'flex' : 'none';
        
        this.showScreen('breathing-screen');
        
        // Countdown
        this.elements.instruction.textContent = I18n.t('breathing.getReady');
        this.getActiveAnimation().updateTimer('3');
        
        let countdown = 3;
        const countdownInterval = setInterval(() => {
            countdown--;
            this.getActiveAnimation().updateTimer(countdown);
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                this.startPhase();
            }
        }, 1000);
    },

    /**
     * Setup the appropriate animation for the technique
     * @param {string} animationType - 'box', 'arc', 'belly', 'wave', 'power', or 'gauge'
     */
    setupAnimation(animationType) {
        // Hide all animations
        BoxAnimation.hide();
        ArcAnimation.hide();
        BellyAnimation.hide();
        WaveAnimation.hide();
        PowerAnimation.hide();
        GaugeAnimation.hide();
        
        // Show and reset the appropriate one
        switch (animationType) {
            case 'box':
                BoxAnimation.show();
                BoxAnimation.reset();
                break;
            case 'arc':
                ArcAnimation.show();
                ArcAnimation.reset();
                break;
            case 'belly':
                BellyAnimation.show();
                BellyAnimation.reset();
                break;
            case 'wave':
                WaveAnimation.show();
                WaveAnimation.reset();
                break;
            case 'power':
                PowerAnimation.show();
                PowerAnimation.reset();
                break;
            case 'gauge':
                GaugeAnimation.show();
                GaugeAnimation.reset();
                break;
        }
    },

    /**
     * Get the currently active animation module
     * @returns {Object} Animation module
     */
    getActiveAnimation() {
        const tech = this.state.selectedTechnique;
        if (!tech) return BoxAnimation;
        
        switch (tech.animation) {
            case 'arc': return ArcAnimation;
            case 'belly': return BellyAnimation;
            case 'wave': return WaveAnimation;
            case 'power': return PowerAnimation;
            case 'gauge': return GaugeAnimation;
            default: return BoxAnimation;
        }
    },

    /**
     * Start a new phase
     */
    startPhase() {
        if (!this.state.isRunning) return;
        
        const tech = this.state.selectedTechnique;
        const phase = tech.phases[this.state.currentPhase];
        
        // Use translated phase name
        this.elements.instruction.textContent = I18n.getPhase(phase.type);
        this.state.timeRemaining = phase.duration;
        this.state.phaseElapsed = 0;
        
        this.getActiveAnimation().updateTimer(phase.duration);
        
        // Update phase indicator
        this.updatePhaseIndicator(phase.type);
        
        // Play sound
        AudioManager.playPhaseSound(phase.type);
        
        this.state.lastTimestamp = performance.now();
        this.animatePhase();
    },

    /**
     * Update the phase indicator dots
     * @param {string} phaseType - Current phase type
     */
    updatePhaseIndicator(phaseType) {
        document.querySelectorAll('.phase-dot').forEach(dot => {
            dot.classList.remove('active');
            if (dot.dataset.phase === phaseType) {
                dot.classList.add('active');
            }
        });
    },

    /**
     * Animate the current phase
     */
    animatePhase() {
        if (!this.state.isRunning || this.state.isPaused) return;
        
        const tech = this.state.selectedTechnique;
        const phase = tech.phases[this.state.currentPhase];
        const phaseDuration = phase.duration * 1000;
        
        const now = performance.now();
        const elapsed = now - this.state.lastTimestamp + this.state.phaseElapsed;
        
        // Update timer
        const newTimeRemaining = Math.ceil(phase.duration - (elapsed / 1000));
        if (newTimeRemaining !== this.state.timeRemaining && newTimeRemaining > 0) {
            this.state.timeRemaining = newTimeRemaining;
            this.getActiveAnimation().updateTimer(this.state.timeRemaining);
            AudioManager.playTick();
        }
        
        // Calculate progress
        const progress = Math.min(elapsed / phaseDuration, 1);
        
        // Update animation
        const animation = this.getActiveAnimation();
        if (tech.animation === 'box') {
            animation.update(this.state.currentPhase, progress * 100);
        } else {
            animation.update(this.state.currentPhase, progress, tech);
        }
        
        if (elapsed < phaseDuration) {
            this.state.animationFrame = requestAnimationFrame(() => this.animatePhase());
        } else {
            this.completePhase();
        }
    },

    /**
     * Complete the current phase
     */
    completePhase() {
        const tech = this.state.selectedTechnique;
        
        // Ensure animation shows complete
        const animation = this.getActiveAnimation();
        if (tech.animation === 'box') {
            animation.update(this.state.currentPhase, 100);
        } else {
            animation.update(this.state.currentPhase, 1, tech);
        }
        
        this.state.currentPhase++;
        
        if (this.state.currentPhase >= tech.phases.length) {
            // Cycle complete
            this.state.currentPhase = 0;
            this.state.currentCycle++;
            
            if (this.state.currentCycle > this.state.totalCycles) {
                this.completeExercise();
                return;
            }
            
            this.elements.currentCycleEl.textContent = this.state.currentCycle;
            
            // Reset animation for next cycle
            setTimeout(() => {
                this.getActiveAnimation().reset();
                this.startPhase();
            }, 500);
        } else {
            this.startPhase();
        }
    },

    /**
     * Toggle pause state
     */
    togglePause() {
        this.state.isPaused = !this.state.isPaused;
        this.elements.pauseBtn.textContent = this.state.isPaused ? I18n.t('breathing.resume') : I18n.t('breathing.pause');
        
        if (this.state.isPaused) {
            this.state.pauseStartTime = performance.now();
            this.state.phaseElapsed += performance.now() - this.state.lastTimestamp;
        } else {
            this.state.totalPausedTime += performance.now() - this.state.pauseStartTime;
            this.state.lastTimestamp = performance.now();
            this.animatePhase();
        }
    },

    /**
     * Stop the exercise
     */
    stopExercise() {
        this.state.isRunning = false;
        this.state.isPaused = false;
        
        if (this.state.animationFrame) {
            cancelAnimationFrame(this.state.animationFrame);
        }
        
        this.getActiveAnimation().reset();
        this.showScreen('detail-screen');
    },

    /**
     * Complete the exercise and show results
     */
    completeExercise() {
        this.state.isRunning = false;
        AudioManager.playComplete();
        
        const totalTime = Math.round((Date.now() - this.state.startTime - this.state.totalPausedTime) / 1000);
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        
        // Use translated technique name
        this.elements.statTechnique.textContent = I18n.getTechnique(this.state.selectedTechnique.id, 'name');
        this.elements.statCycles.textContent = this.state.totalCycles;
        this.elements.statTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        this.showScreen('congrats-screen');
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
