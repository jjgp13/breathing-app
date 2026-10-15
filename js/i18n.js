/**
 * Internationalization (i18n) Module
 * Handles loading and applying translations
 * Translations are embedded to work with file:// protocol
 */

const I18n = {
    currentLang: 'en',
    translations: {},
    supportedLangs: ['en', 'es'],

    // Generated from locales/*.json; works without runtime fetches.
    locales: BreatheLocales,

    /**
     * Initialize i18n with user's preferred language
     */
    init() {
        // Check saved preference or browser language
        let savedLang;
        try { savedLang = localStorage.getItem('breathe-lang'); } catch {}
        const browserLang = navigator.language.split('-')[0];
        
        if (savedLang && this.supportedLangs.includes(savedLang)) {
            this.currentLang = savedLang;
        } else if (this.supportedLangs.includes(browserLang)) {
            this.currentLang = browserLang;
        }
        
        this.translations = this.locales[this.currentLang];
        this.applyTranslations();
        this.updateLangSelector();
    },

    /**
     * Change language
     * @param {string} lang - Language code
     */
    setLanguage(lang) {
        if (!this.supportedLangs.includes(lang)) return;
        
        this.currentLang = lang;
        try { localStorage.setItem('breathe-lang', lang); } catch {}
        this.translations = this.locales[lang];
        this.applyTranslations();
        this.updateLangSelector();
        
        // Re-generate dynamic content
        if (typeof App !== 'undefined' && App.generateTechniqueCards) {
            App.generateTechniqueCards();
            if (App.state.selectedTechnique) App.renderTechniqueDetail();
            App.refreshLanguage();
        }
    },

    /**
     * Get a translation by key path (e.g., "app.title")
     * @param {string} key - Dot-notation key path
     * @param {Object} params - Optional parameters for interpolation
     * @returns {string} Translated text
     */
    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }
        
        // Handle interpolation (e.g., "Hello {{name}}")
        if (typeof value === 'string' && params) {
            Object.keys(params).forEach(param => {
                value = value.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
            });
        }
        
        return value;
    },

    /**
     * Apply translations to all elements with data-i18n attribute
     */
    applyTranslations() {
        document.documentElement.lang = this.currentLang;
        // Translate text content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });
        
        // Translate HTML content (for elements that need HTML like <br>)
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            el.innerHTML = this.t(key);
        });
        
        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
        
        // Translate select options
        document.querySelectorAll('[data-i18n-options]').forEach(select => {
            const optionsKey = select.getAttribute('data-i18n-options');
            const options = this.t(optionsKey);
            if (typeof options === 'object') {
                Array.from(select.options).forEach(option => {
                    if (options[option.value]) {
                        option.textContent = options[option.value];
                    }
                });
            }
        });
    },

    /**
     * Update language selector to show current language
     */
    updateLangSelector() {
        const selector = document.getElementById('langSelector');
        if (selector) {
            selector.value = this.currentLang;
        }
    },

    /**
     * Get technique translation
     * @param {string} techId - Technique ID
     * @param {string} field - Field name (name, tagline, science, mechanism, steps)
     * @returns {string|Array} Translated content
     */
    getTechnique(techId, field) {
        return this.locales[this.currentLang].techniques[techId]?.[field]
            ?? this.locales.en.techniques[techId]?.[field]
            ?? '';
    },

    /**
     * Get phase name translation
     * @param {string} phaseType - Phase type
     * @returns {string} Translated phase name
     */
    getPhase(phaseType) {
        const phaseMap = {
            'inhale': 'phases.inhale',
            'exhale': 'phases.exhale',
            'hold': 'phases.hold',
            'power': 'phases.power',
            'retention': 'phases.retention',
            'recovery': 'phases.recovery',
            'shallow': 'phases.shallow'
        };
        return this.t(phaseMap[phaseType] || `phases.${phaseType}`);
    }
};
