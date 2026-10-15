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
        totalCycles: 4,
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
        BackgroundManager.setAnimation('none');
        this.initCheckin();
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
            detailBenefits: document.getElementById('detailBenefits'),
            detailEvidence: document.getElementById('detailEvidence'),
            detailLimitations: document.getElementById('detailLimitations'),
            detailSources: document.getElementById('detailSources'),
            detailReviewed: document.getElementById('detailReviewed'),
            detailSafety: document.getElementById('detailSafety'),
            researchSources: document.getElementById('researchSources'),
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
            guideCue: document.getElementById('guideCue'),
            guideNext: document.getElementById('guideNext'),
            phaseTrack: document.getElementById('phaseTrack'),
            holdNote: document.getElementById('holdNote'),
            endHoldBtn: document.getElementById('endHoldBtn'),
            sessionDuration: document.getElementById('sessionDuration'),
            
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
        BreathGuide.init();
        AudioUI.init();
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
                transitionStart: () => { this.elements.startFromCarousel.disabled = true; },
                transitionEnd: () => { this.elements.startFromCarousel.disabled = false; },
                slideChange: () => {
                    // Add subtle animation on slide change
                    if (this.swiper && !BreathGuide.reduced) {
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
            AudioManager.toggle();
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
            this.updateDuration();
        });

        // Start practice
        this.elements.startPracticeBtn.addEventListener('click', () => this.startExercise());

        this.elements.endHoldBtn.addEventListener('click', () => this.session?.endHold());

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
        // Swiper owns and reorders these nodes in loop mode. Keep their identity
        // when translating so its active-slide references remain valid.
        const existingSlides = new Map(Array.from(this.elements.swiperWrapper.children)
            .map(slide => [slide.dataset.id, slide]));
        
        const techArray = Object.values(techniques);
        
        techArray.forEach((tech) => {
            // Create swiper slide
            const slide = existingSlides.get(tech.id) || document.createElement('div');
            slide.classList.add('swiper-slide');
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
                ${tech.advanced ? `<span class="advanced-tag">${I18n.t('checkin.advanced')}</span>` : ''}
                <div class="timing">${timingText} ${pattern} • ${Math.round(totalTime)}s ${perCycle}</div>
            `;
            
            if (!existingSlides.has(tech.id)) this.elements.swiperWrapper.appendChild(slide);
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
        const next = document.getElementById(screenId);
        document.querySelectorAll('.screen').forEach(screen => {
            gsap.killTweensOf(screen);
            screen.classList.toggle('active', screen === next);
            screen.style.opacity = '';
            screen.style.transform = '';
        });
        this.state.currentScreen = screenId.replace('-screen', '');
        document.body.classList.toggle('session-mode', screenId === 'breathing-screen');
        this.elements.backBtn.classList.toggle('visible', screenId !== 'menu-screen');
        if (screenId === 'menu-screen') this.swiper?.update();
        window.scrollTo({ top: 0, behavior: 'instant' });
        const heading = next.querySelector('h1, h2');
        heading?.setAttribute('tabindex', '-1');
        heading?.focus({ preventScroll: true });
        if (!BreathGuide.reduced) gsap.fromTo(next, { opacity: 0.5 }, { opacity: 1, duration: 0.18 });
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
    showTechniqueDetail(techId, cycles = null) {
        const tech = techniques[techId];
        if (!tech) return;
        
        this.state.selectedTechnique = tech;
        this.renderTechniqueDetail();
        this.elements.researchSources.open = false;

        this.elements.repetitionsSlider.max = tech.maxCycles;
        this.elements.repetitionsSlider.value = cycles ?? tech.defaultCycles;
        this.elements.repValue.textContent = this.elements.repetitionsSlider.value;
        this.updateDuration();
        this.showScreen('detail-screen');
    },

    /** Refresh localized detail content without resetting the chosen cycle count. */
    renderTechniqueDetail() {
        const tech = this.state.selectedTechnique;
        if (!tech) return;
        const techId = tech.id;
        
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
        
        this.elements.detailEvidence.textContent = I18n.getTechnique(techId, 'evidenceLabel');
        this.elements.detailLimitations.textContent = I18n.getTechnique(techId, 'limitations');
        this.elements.detailSafety.textContent = I18n.getTechnique(techId, 'safety');
        this.elements.detailBenefits.replaceChildren();
        I18n.getTechnique(techId, 'benefits').forEach(benefit => {
            const item = document.createElement('li');
            item.textContent = benefit;
            this.elements.detailBenefits.appendChild(item);
        });

        this.elements.detailSources.replaceChildren();
        tech.research.sources.forEach(source => {
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.href = source.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = `${source.title} (${source.year})`;
            item.appendChild(link);
            this.elements.detailSources.appendChild(item);
        });
        this.elements.detailReviewed.dateTime = tech.research.reviewed;
        this.elements.detailReviewed.textContent = tech.research.reviewed;

        // Render immediately so language changes are readable without an animation delay.
        this.elements.detailSteps.innerHTML = '';
        (Array.isArray(steps) ? steps : []).forEach((step, index) => {
            const li = document.createElement('li');
            li.dataset.step = `${index + 1}.`;
            li.textContent = step;
            this.elements.detailSteps.appendChild(li);
        });
    },


    checkin: { feeling: null, minutes: 3, holds: false },
    hasSuggestion: false,
    session: null,

    initCheckin() {
        const form = document.getElementById('checkinForm');
        document.querySelectorAll('[data-feeling]').forEach(button => {
            button.addEventListener('click', () => {
                this.checkin.feeling = button.dataset.feeling;
                document.querySelectorAll('[data-feeling]').forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
                document.getElementById('findPractice').disabled = false;
                if (this.hasSuggestion) this.renderRecommendation();
            });
        });
        form.addEventListener('change', () => {
            this.checkin.minutes = Number(document.getElementById('checkinMinutes').value);
            this.checkin.holds = document.getElementById('checkinHolds').checked;
            if (this.hasSuggestion) this.renderRecommendation();
        });
        form.addEventListener('submit', event => {
            event.preventDefault();
            this.hasSuggestion = true;
            this.renderRecommendation();
            document.getElementById('recommendation').focus({ preventScroll: true });
        });
        document.getElementById('browsePractices').addEventListener('click', () => document.getElementById('browseTitle').scrollIntoView({ behavior: BreathGuide.reduced ? 'instant' : 'smooth', block: 'start' }));
    },

    formatDuration(seconds) {
        const rounded = Math.round(seconds);
        return Math.floor(rounded / 60) + ':' + String(rounded % 60).padStart(2, '0');
    },

    renderRecommendation() {
        const result = Recommendations.suggest(this.checkin);
        if (!result || !this.hasSuggestion) return;
        document.getElementById('recommendation').hidden = false;
        document.getElementById('recommendationReason').textContent = I18n.t('checkin.reasons.' + result.reason);
        const list = document.getElementById('recommendationChoices');
        list.replaceChildren();
        result.choices.forEach((choice, index) => {
            const article = document.createElement('article');
            article.className = 'practice-suggestion';
            const label = document.createElement('p');
            label.className = 'suggestion-label';
            label.textContent = I18n.t(index ? 'checkin.alternative' : 'checkin.suggestion');
            const title = document.createElement('h3');
            title.textContent = I18n.getTechnique(choice.id, 'name');
            const description = document.createElement('p');
            description.textContent = I18n.getTechnique(choice.id, 'tagline');
            const duration = document.createElement('p');
            duration.className = 'suggestion-duration';
            duration.textContent = I18n.t('checkin.duration', { time: this.formatDuration(choice.seconds) });
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn ' + (index ? 'btn-secondary' : 'btn-start');
            button.textContent = I18n.t('checkin.view');
            button.addEventListener('click', () => this.showTechniqueDetail(choice.id, choice.cycles));
            article.append(label, title, description, duration, button);
            list.appendChild(article);
        });
    },

    updateDuration() {
        const tech = this.state.selectedTechnique;
        if (!tech) return;
        const seconds = tech.phases.reduce((sum, phase) => sum + phase.duration, 0) * Number(this.elements.repetitionsSlider.value);
        this.elements.sessionDuration.textContent = this.formatDuration(seconds);
    },

    refreshLanguage() {
        this.renderRecommendation();
        BreathGuide.refreshMode();
        AudioUI.refresh();
        if (this.state.isRunning && this.session) {
            this.renderPhaseTrack();
            this.lastPhaseKey = null;
            this.renderSession(this.session.snapshot());
        }
    },

    async requestWakeLock() {
        const epoch = this.wakeEpoch = (this.wakeEpoch || 0) + 1;
        if (!navigator.wakeLock || !this.state.isRunning || this.state.isPaused) return;
        try {
            const lock = await navigator.wakeLock.request('screen');
            if (epoch !== this.wakeEpoch || !this.state.isRunning || this.state.isPaused) { await lock.release(); return; }
            this.state.wakeLock = lock;
            lock.addEventListener('release', () => { if (this.state.wakeLock === lock) this.state.wakeLock = null; });
        } catch { /* Practice remains available when the device declines a wake lock. */ }
    },

    async releaseWakeLock() {
        this.wakeEpoch = (this.wakeEpoch || 0) + 1;
        const lock = this.state.wakeLock;
        this.state.wakeLock = null;
        try { await lock?.release(); } catch {}
    },

    startExercise() {
        const tech = this.state.selectedTechnique;
        if (!tech) return;
        this.session?.stop(false);
        AudioManager.startSession();
        this.state.isRunning = true;
        this.state.isPaused = false;
        this.state.totalCycles = Number(this.elements.repetitionsSlider.value);
        this.lastPhaseKey = null;
        this.renderPhaseTrack();
        this.showScreen('breathing-screen');
        this.session = new BreathingSession(tech, this.state.totalCycles, {
            onUpdate: snapshot => this.renderSession(snapshot),
            onCue: snapshot => AudioManager.playPhaseSound(snapshot.phase.type),
            onComplete: snapshot => this.completeExercise(snapshot)
        });
        this.session.start();
        this.requestWakeLock();
    },

    renderPhaseTrack() {
        this.elements.phaseTrack.replaceChildren();
        this.state.selectedTechnique.phases.forEach((phase, index) => {
            const item = document.createElement('li');
            item.dataset.index = index;
            const label = document.createElement('span');
            label.textContent = I18n.getPhase(phase.type);
            const duration = document.createElement('small');
            duration.textContent = ['hold', 'retention', 'recovery'].includes(phase.type)
                ? I18n.t('breathing.upTo', { seconds: phase.duration }) : phase.duration + ' s';
            item.append(label, duration);
            this.elements.phaseTrack.appendChild(item);
        });
    },

    renderSession(snapshot) {
        if (!this.state.isRunning) return;
        this.state.isPaused = snapshot.mode === 'paused';
        AudioManager.setPaused(this.state.isPaused);
        this.elements.breathingTitle.textContent = I18n.getTechnique(this.state.selectedTechnique.id, 'name');
        this.elements.currentCycleEl.textContent = snapshot.cycle;
        this.elements.totalCyclesEl.textContent = snapshot.cycles;
        this.elements.pauseBtn.textContent = I18n.t(this.state.isPaused ? 'breathing.resume' : 'breathing.pause');
        const hold = !snapshot.preparing && ['hold', 'retention', 'recovery'].includes(snapshot.phase.type);
        this.elements.endHoldBtn.hidden = !hold;
        this.elements.endHoldBtn.disabled = this.state.isPaused;
        this.elements.holdNote.hidden = !hold;
        const key = [snapshot.mode, snapshot.preparing, snapshot.phaseIndex, snapshot.cycle, I18n.currentLang].join(':');
        if (key !== this.lastPhaseKey) {
            this.lastPhaseKey = key;
            let cue = snapshot.phase.type;
            if (cue === 'hold') cue = GuideMath.volume(this.state.selectedTechnique, snapshot.phaseIndex, 0) ? 'holdFull' : 'holdEmpty';
            if (this.state.selectedTechnique.id === 'diaphragmatic' && ['inhale','exhale'].includes(cue)) cue = cue === 'inhale' ? 'bellyIn' : 'bellyOut';
            this.elements.instruction.textContent = snapshot.mode === 'paused' ? I18n.t('guide.paused')
                : snapshot.preparing ? I18n.t('guide.ready') : I18n.getPhase(snapshot.phase.type);
            this.elements.guideCue.textContent = snapshot.mode === 'paused'
                ? I18n.t(snapshot.pauseReason === 'user' ? 'guide.pauseCue' : 'guide.hiddenPause')
                : snapshot.preparing ? I18n.t('guide.readyCue') : I18n.t('guide.cue.' + cue);
            const nextIndex = (snapshot.phaseIndex + 1) % this.state.selectedTechnique.phases.length;
            this.elements.guideNext.textContent = snapshot.mode === 'paused' ? I18n.t('guide.pausedLabel')
                : I18n.t('guide.next') + ': ' + I18n.getPhase(this.state.selectedTechnique.phases[snapshot.preparing ? 0 : nextIndex].type);
            Array.from(this.elements.phaseTrack.children).forEach((item, index) => {
                item.classList.toggle('is-current', !snapshot.preparing && index === snapshot.phaseIndex);
                if (!snapshot.preparing && index === snapshot.phaseIndex) item.setAttribute('aria-current','step');
                else item.removeAttribute('aria-current');
            });
        }
        BreathGuide.update(snapshot, this.state.selectedTechnique);
    },

    togglePause() {
        if (!this.session || !this.state.isRunning) return;
        if (this.session.mode === 'paused') { this.session.resume(); this.requestWakeLock(); }
        else { this.session.pause(); this.releaseWakeLock(); }
    },

    stopExercise() {
        this.session?.stop(false);
        AudioManager.stop();
        this.state.isRunning = false;
        this.state.isPaused = false;
        this.releaseWakeLock();
        BreathGuide.clear();
        this.showScreen('detail-screen');
    },

    completeExercise(snapshot) {
        this.state.isRunning = false;
        this.state.isPaused = false;
        this.releaseWakeLock();
        AudioManager.stop();
        AudioManager.playComplete();
        this.elements.statTechnique.textContent = I18n.getTechnique(this.state.selectedTechnique.id, 'name');
        this.elements.statCycles.textContent = snapshot.cycles;
        this.elements.statTime.textContent = this.formatDuration(snapshot.practiceSeconds);
        BreathGuide.clear();
        this.showScreen('congrats-screen');
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
document.addEventListener('visibilitychange', () => {
    if (document.hidden && App.state.isRunning) { App.session?.pause('hidden'); App.releaseWakeLock(); }
});
