/**
 * Main Application Module
 * Coordinates all components and manages the breathing exercise flow
 * Uses Swiper for 3D carousel and GSAP for smooth animations
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
        wakeLock: null
    },

    // Swiper instance
    swiper: null,

    // DOM element references
    elements: {},

    /**
     * Initialize the application
     */
    init() {
        this.cacheElements();
        I18n.init(); // Initialize translations first
        this.initModules();
        this.generateTechniqueCards();
        this.initSwiper();
        this.bindEvents();
        BackgroundManager.setAnimation('combined');
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
            
            // Swiper Carousel
            swiperWrapper: document.getElementById('swiperWrapper'),
            startFromCarousel: document.getElementById('startFromCarousel'),
            
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
     * Initialize Swiper 3D Coverflow Carousel
     */
    initSwiper() {
        this.swiper = new Swiper('#techniqueSwiper', {
            effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 3,
            initialSlide: 0,
            loop: true,
            speed: 600,
            coverflowEffect: {
                rotate: 15,
                stretch: 0,
                depth: 150,
                modifier: 1,
                slideShadows: false,
                scale: 0.8
            },
            breakpoints: {
                // On screens smaller than 480px, show 1.5 slides
                0: {
                    slidesPerView: 1.4,
                    coverflowEffect: {
                        rotate: 10,
                        depth: 100,
                        scale: 0.85
                    }
                },
                // On tablets, show 2.5 slides
                480: {
                    slidesPerView: 2.2,
                    coverflowEffect: {
                        rotate: 12,
                        depth: 120,
                        scale: 0.82
                    }
                },
                // On larger screens, show 3 slides
                768: {
                    slidesPerView: 3,
                    coverflowEffect: {
                        rotate: 15,
                        depth: 150,
                        scale: 0.8
                    }
                }
            },
            pagination: {
                el: '#swiperPagination',
                clickable: true
            },
            keyboard: {
                enabled: true
            },
            on: {
                slideChange: () => {
                    // Add subtle animation on slide change
                    if (this.swiper) {
                        const activeSlide = this.swiper.slides[this.swiper.activeIndex];
                        if (activeSlide) {
                            gsap.fromTo(activeSlide, 
                                { scale: 0.95, opacity: 0.8 },
                                { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' }
                            );
                        }
                    }
                }
            }
        });
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Language selector
        this.elements.langSelector.addEventListener('change', (e) => {
            I18n.setLanguage(e.target.value);
        });

        // Sound toggle
        this.elements.soundToggle.addEventListener('click', () => {
            const enabled = AudioManager.toggle();
            this.elements.soundToggle.textContent = enabled ? '🔊' : '🔇';
        });

        // Navigation
        this.elements.backBtn.addEventListener('click', () => this.goBack());

        // Start from carousel - get current technique
        this.elements.startFromCarousel.addEventListener('click', () => {
            const activeSlide = this.swiper.slides[this.swiper.activeIndex];
            if (activeSlide) {
                const techId = activeSlide.dataset.id;
                if (techId) {
                    this.showTechniqueDetail(techId);
                }
            }
        });

        // Double-click/tap on slide to start
        document.getElementById('techniqueSwiper').addEventListener('dblclick', (e) => {
            const slide = e.target.closest('.swiper-slide');
            if (slide && slide.dataset.id) {
                this.showTechniqueDetail(slide.dataset.id);
            }
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
        this.elements.swiperWrapper.innerHTML = '';
        
        const techArray = Object.values(techniques);
        
        techArray.forEach((tech) => {
            // Create swiper slide
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.dataset.id = tech.id;
            
            const totalTime = tech.phases.reduce((sum, p) => sum + p.duration, 0);
            const timingText = tech.phases.map(p => p.duration).join('-');
            
            // Get translated content
            const name = I18n.getTechnique(tech.id, 'name');
            const tagline = I18n.getTechnique(tech.id, 'tagline');
            const perCycle = I18n.t('detail.perCycle') || 'per cycle';
            const pattern = I18n.t('detail.pattern') || 'pattern';
            
            slide.innerHTML = `
                <div class="icon">${tech.icon}</div>
                <div class="name">${name}</div>
                <div class="tagline">${tagline}</div>
                <div class="timing">${timingText} ${pattern} • ${Math.round(totalTime)}s ${perCycle}</div>
            `;
            
            this.elements.swiperWrapper.appendChild(slide);
        });

        // Update swiper after adding slides
        if (this.swiper) {
            this.swiper.update();
        }
    },

    /**
     * Show a specific screen with GSAP animation
     * @param {string} screenId - The screen element ID
     */
    showScreen(screenId) {
        const currentScreen = document.querySelector('.screen.active');
        const nextScreen = document.getElementById(screenId);
        
        if (currentScreen === nextScreen) return;
        
        // Animate out current screen
        if (currentScreen) {
            gsap.to(currentScreen, {
                opacity: 0,
                y: -20,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    currentScreen.classList.remove('active');
                    currentScreen.style.opacity = '';
                    currentScreen.style.transform = '';
                }
            });
        }
        
        // Animate in new screen
        setTimeout(() => {
            nextScreen.classList.add('active');
            gsap.fromTo(nextScreen, 
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
            );
        }, currentScreen ? 300 : 0);
        
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
        
        // Generate steps list with GSAP stagger animation
        this.elements.detailSteps.innerHTML = '';
        (Array.isArray(steps) ? steps : tech.steps).forEach((step, index) => {
            const li = document.createElement('li');
            li.dataset.step = `${index + 1}.`;
            li.textContent = step;
            li.style.opacity = '0';
            this.elements.detailSteps.appendChild(li);
        });
        
        // Set slider limits
        this.elements.repetitionsSlider.max = tech.maxCycles;
        this.elements.repetitionsSlider.value = tech.defaultCycles;
        this.elements.repValue.textContent = tech.defaultCycles;
        
        this.showScreen('detail-screen');
        
        // Animate steps in with stagger
        setTimeout(() => {
            gsap.to(this.elements.detailSteps.querySelectorAll('li'), {
                opacity: 1,
                y: 0,
                duration: 0.4,
                stagger: 0.1,
                ease: 'power2.out',
                from: { y: 15 }
            });
        }, 400);
    },

    /**
     * Request a wake lock to keep the screen on during exercises
     */
    async requestWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                this.state.wakeLock = await navigator.wakeLock.request('screen');
                this.state.wakeLock.addEventListener('release', () => {
                    this.state.wakeLock = null;
                });
            } catch (e) {
                // Wake lock request failed (e.g., low battery)
            }
        }
    },

    /**
     * Release the wake lock
     */
    async releaseWakeLock() {
        if (this.state.wakeLock) {
            try {
                await this.state.wakeLock.release();
            } catch (e) {
                // Already released
            }
            this.state.wakeLock = null;
        }
    },

    /**
     * Start the breathing exercise
     */
    startExercise() {
        if (!this.state.selectedTechnique) return;
        
        AudioManager.init();
        this.requestWakeLock();
        
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
        
        // Countdown with GSAP
        this.elements.instruction.textContent = I18n.t('breathing.getReady');
        this.getActiveAnimation().updateTimer('3');
        
        let countdown = 3;
        
        // Animate countdown
        const countdownAnim = () => {
            gsap.fromTo(this.elements.instruction, 
                { scale: 1.2, opacity: 0.5 },
                { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
            );
        };
        
        countdownAnim();
        
        const countdownInterval = setInterval(() => {
            countdown--;
            this.getActiveAnimation().updateTimer(countdown);
            countdownAnim();
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
        
        // Use translated phase name with GSAP animation
        const phaseText = I18n.getPhase(phase.type);
        this.elements.instruction.textContent = phaseText;
        
        gsap.fromTo(this.elements.instruction,
            { scale: 1.3, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
        );
        
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
                gsap.fromTo(dot, 
                    { scale: 1.5 },
                    { scale: 1.2, duration: 0.3, ease: 'power2.out' }
                );
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
            
            // Animate cycle counter
            gsap.fromTo(this.elements.currentCycleEl,
                { scale: 1.5, color: '#64b5f6' },
                { scale: 1, color: '#e8f4f8', duration: 0.4, ease: 'power2.out' }
            );
            
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
        this.releaseWakeLock();
        
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
        this.releaseWakeLock();
        AudioManager.playComplete();
        
        const totalTime = Math.round((Date.now() - this.state.startTime - this.state.totalPausedTime) / 1000);
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        
        // Use translated technique name
        this.elements.statTechnique.textContent = I18n.getTechnique(this.state.selectedTechnique.id, 'name');
        this.elements.statCycles.textContent = this.state.totalCycles;
        this.elements.statTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        this.showScreen('congrats-screen');
        
        // Celebrate animation
        setTimeout(() => {
            gsap.fromTo('.congrats-icon',
                { scale: 0, rotation: -180 },
                { scale: 1, rotation: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' }
            );
            gsap.fromTo('.congrats-title',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, delay: 0.2, ease: 'power2.out' }
            );
            gsap.fromTo('.stats',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, delay: 0.4, ease: 'power2.out' }
            );
        }, 100);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());

// Re-acquire wake lock when returning to the app during an exercise
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && App.state.isRunning) {
        App.requestWakeLock();
    }
});
