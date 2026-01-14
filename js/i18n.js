/**
 * Internationalization (i18n) Module
 * Handles loading and applying translations
 * Translations are embedded to work with file:// protocol
 */

const I18n = {
    currentLang: 'en',
    translations: {},
    supportedLangs: ['en', 'es'],

    // Embedded translations for local file access
    locales: {
        en: {
            app: {
                title: "Breathe",
                subtitle: "Swipe or use arrows to choose a technique",
                beginPractice: "Begin Practice",
                backgroundAnimation: "Background Animation"
            },
            backgrounds: {
                particles: "Floating Particles",
                waves: "Ocean Waves",
                gradient: "Shifting Gradient",
                combined: "Combined (All Effects)",
                none: "None (Minimal)"
            },
            detail: {
                science: "Scientific Support",
                mechanism: "How It Works",
                steps: "Steps",
                cycles: "Number of Cycles",
                cyclesUnit: "cycles",
                pattern: "pattern",
                perCycle: "per cycle"
            },
            breathing: {
                getReady: "Get Ready...",
                cycle: "Cycle",
                of: "of",
                pause: "Pause",
                resume: "Resume",
                stop: "Stop"
            },
            animations: {
                belly: "Belly",
                flow: "Flow",
                power: "Power",
                control: "Control"
            },
            phases: {
                inhale: "Inhale",
                exhale: "Exhale",
                hold: "Hold",
                power: "Power Breaths",
                retention: "Retention Hold",
                recovery: "Recovery Breath",
                shallow: "Shallow Breathing",
                lightInhale: "Light Inhale",
                lightExhale: "Light Exhale",
                controlPause: "Control Pause"
            },
            congrats: {
                title: "Well Done!",
                message: "You've completed your breathing exercise.<br>Take a moment to notice how you feel.",
                technique: "Technique",
                completedCycles: "Cycles Completed",
                totalTime: "Total Time",
                minutes: "minutes",
                practiceAgain: "Practice Again",
                mainMenu: "Main Menu"
            },
            techniques: {
                box: {
                    name: "Box Breathing",
                    tagline: "Square Breathing - Used by Navy SEALs",
                    science: "Utilized by Navy SEALs for \"arousal control.\" A 2023 study indicated it effectively balances the Autonomic Nervous System (ANS) and improves performance under stress.",
                    mechanism: "The symmetrical \"box\" shape creates a steady rhythm that prevents the heart from spiking during high-pressure transitions. The equal duration phases help synchronize breath with heart rate variability.",
                    steps: [
                        "Inhale through the nose for 4 seconds",
                        "Hold the air in for 4 seconds",
                        "Exhale through the mouth for 4 seconds",
                        "Hold with empty lungs for 4 seconds",
                        "Repeat for 4 to 10 cycles"
                    ]
                },
                fourSevenEight: {
                    name: "4-7-8 Technique",
                    tagline: "The \"Nervous System Reset\"",
                    science: "A 2022 study in Physiological Reports suggests that the 4-7-8 ratio specifically increases High-Frequency Power in Heart Rate Variability (HRV), indicating a sharp rise in parasympathetic (rest-and-digest) activity.",
                    mechanism: "The 7-second hold allows for a temporary increase in CO₂ in the blood, which dilates the blood vessels and lowers blood pressure. The 8-second exhale stimulates the Vagus nerve to slow the heart rate.",
                    steps: [
                        "Place tongue tip against ridge behind upper front teeth",
                        "Inhale quietly through the nose for 4 seconds",
                        "Hold breath for 7 seconds",
                        "Exhale forcefully through mouth (make a \"whoosh\" sound) for 8 seconds",
                        "Repeat for 4 breaths initially; never exceed 8 cycles per session"
                    ]
                },
                diaphragmatic: {
                    name: "Diaphragmatic Breathing",
                    tagline: "Belly Breathing - Reduce Stress & Cortisol",
                    science: "Research published by The Cleveland Clinic and Johns Hopkins confirms this technique reduces cortisol levels and improves core stability. Studies show it activates the parasympathetic nervous system effectively.",
                    mechanism: "By engaging the diaphragm rather than the chest, you optimize oxygen exchange and reduce the \"work of breathing,\" signaling to the brain that the body is safe. This triggers the relaxation response.",
                    steps: [
                        "Lie on your back or sit with a straight spine",
                        "Place one hand on your chest and the other on your belly",
                        "Inhale through the nose, making your belly rise while chest stays still",
                        "Exhale through pursed lips as if blowing through a straw",
                        "Feel the belly sink as you exhale completely",
                        "Practice for 5-10 minutes (6-12 cycles)"
                    ]
                },
                resonance: {
                    name: "Resonance Frequency",
                    tagline: "Coherent Breathing - Maximize HRV",
                    science: "Systematic reviews in Scientific Reports show this is the optimal rate to maximize Heart Rate Variability (HRV) and synchronize the heart and lungs for peak autonomic balance.",
                    mechanism: "Most adults have a \"resonant frequency\" at approximately 5.5 to 6 breaths per minute. This timing maximizes the efficiency of the baroreflex (the body's blood pressure control system), creating coherence between cardiovascular and respiratory rhythms.",
                    steps: [
                        "Sit or lie in a comfortable position",
                        "Inhale smoothly through the nose for 5.5 seconds",
                        "Exhale smoothly through the nose or mouth for 5.5 seconds",
                        "Maintain a continuous flow with no pauses at top or bottom",
                        "Keep the breath gentle and effortless",
                        "Practice for 10-20 minutes for optimal HRV benefits"
                    ]
                },
                wimHof: {
                    name: "Wim Hof Method",
                    tagline: "Cyclic Hyperventilation - Boost Immunity",
                    science: "A 2024 systematic review in PLOS ONE confirmed that this method significantly increases epinephrine (adrenaline) and Interleukin-10 (an anti-inflammatory cytokine), while reducing pro-inflammatory markers.",
                    mechanism: "Controlled hyperventilation followed by a hold creates a \"hormetic\" (beneficial) stress response that \"trains\" the immune system. This activates the sympathetic nervous system and releases endogenous opioids.",
                    steps: [
                        "Take 30 deep, rhythmic breaths (fully in, naturally out)",
                        "After the last exhale, hold your breath as long as comfortable",
                        "When you feel the urge to breathe, take a deep inhale",
                        "Hold that recovery breath for 15 seconds",
                        "This completes one round - repeat for 3 rounds",
                        "⚠️ Never practice in water or while driving!"
                    ]
                },
                buteyko: {
                    name: "Buteyko Control Pause",
                    tagline: "CO₂ Tolerance - Respiratory Efficiency",
                    science: "Extensively studied for asthma and respiratory efficiency. Clinical trials show it reduces reliance on rescue inhalers and improves CO₂ tolerance, with significant improvements in quality of life for respiratory conditions.",
                    mechanism: "Increases the \"Control Pause\" (CP)—the time you can comfortably hold your breath—which reflects your body's sensitivity to CO₂. By practicing light, nasal breathing, you retrain your breathing pattern to be more efficient.",
                    steps: [
                        "Take a small, gentle breath in through your nose",
                        "Release a small, gentle breath out",
                        "Pinch your nose and hold until you feel the first urge to breathe",
                        "This measures your Control Pause (CP) baseline",
                        "Then breathe lightly through the nose with a \"slight air hunger\"",
                        "Maintain shallow breathing for 30 seconds to build CO₂ tolerance"
                    ]
                }
            }
        },
        es: {
            app: {
                title: "Respira",
                subtitle: "Desliza o usa las flechas para elegir una técnica",
                beginPractice: "Comenzar Práctica",
                backgroundAnimation: "Animación de Fondo"
            },
            backgrounds: {
                particles: "Partículas Flotantes",
                waves: "Olas del Océano",
                gradient: "Gradiente Cambiante",
                combined: "Combinado (Todos los Efectos)",
                none: "Ninguno (Mínimo)"
            },
            detail: {
                science: "Respaldo Científico",
                mechanism: "Cómo Funciona",
                steps: "Pasos",
                cycles: "Número de Ciclos",
                cyclesUnit: "ciclos",
                pattern: "patrón",
                perCycle: "por ciclo"
            },
            breathing: {
                getReady: "Prepárate...",
                cycle: "Ciclo",
                of: "de",
                pause: "Pausar",
                resume: "Continuar",
                stop: "Detener"
            },
            animations: {
                belly: "Abdomen",
                flow: "Flujo",
                power: "Poder",
                control: "Control"
            },
            phases: {
                inhale: "Inhala",
                exhale: "Exhala",
                hold: "Mantén",
                power: "Respiraciones Potentes",
                retention: "Retención",
                recovery: "Respiración de Recuperación",
                shallow: "Respiración Superficial",
                lightInhale: "Inhala Suave",
                lightExhale: "Exhala Suave",
                controlPause: "Pausa de Control"
            },
            congrats: {
                title: "¡Bien Hecho!",
                message: "Has completado tu ejercicio de respiración.<br>Tómate un momento para notar cómo te sientes.",
                technique: "Técnica",
                completedCycles: "Ciclos Completados",
                totalTime: "Tiempo Total",
                minutes: "minutos",
                practiceAgain: "Practicar de Nuevo",
                mainMenu: "Menú Principal"
            },
            techniques: {
                box: {
                    name: "Respiración Cuadrada",
                    tagline: "Respiración de Caja - Usada por Navy SEALs",
                    science: "Utilizada por los Navy SEALs para el \"control de la activación\". Un estudio de 2023 indicó que equilibra eficazmente el Sistema Nervioso Autónomo (SNA) y mejora el rendimiento bajo estrés.",
                    mechanism: "La forma simétrica de \"caja\" crea un ritmo constante que evita que el corazón se acelere durante transiciones de alta presión. Las fases de igual duración ayudan a sincronizar la respiración con la variabilidad del ritmo cardíaco.",
                    steps: [
                        "Inhala por la nariz durante 4 segundos",
                        "Mantén el aire durante 4 segundos",
                        "Exhala por la boca durante 4 segundos",
                        "Mantén con los pulmones vacíos durante 4 segundos",
                        "Repite de 4 a 10 ciclos"
                    ]
                },
                fourSevenEight: {
                    name: "Técnica 4-7-8",
                    tagline: "El \"Reinicio del Sistema Nervioso\"",
                    science: "Un estudio de 2022 en Physiological Reports sugiere que la proporción 4-7-8 aumenta específicamente la Potencia de Alta Frecuencia en la Variabilidad del Ritmo Cardíaco (VRC), indicando un aumento agudo en la actividad parasimpática (descanso y digestión).",
                    mechanism: "La retención de 7 segundos permite un aumento temporal de CO₂ en la sangre, lo que dilata los vasos sanguíneos y reduce la presión arterial. La exhalación de 8 segundos estimula el nervio Vago para reducir el ritmo cardíaco.",
                    steps: [
                        "Coloca la punta de la lengua contra el paladar detrás de los dientes frontales",
                        "Inhala silenciosamente por la nariz durante 4 segundos",
                        "Mantén la respiración durante 7 segundos",
                        "Exhala con fuerza por la boca (haz un sonido \"whoosh\") durante 8 segundos",
                        "Repite 4 respiraciones inicialmente; nunca excedas 8 ciclos por sesión"
                    ]
                },
                diaphragmatic: {
                    name: "Respiración Diafragmática",
                    tagline: "Respiración Abdominal - Reduce Estrés y Cortisol",
                    science: "Investigaciones publicadas por la Clínica Cleveland y Johns Hopkins confirman que esta técnica reduce los niveles de cortisol y mejora la estabilidad del core. Los estudios muestran que activa eficazmente el sistema nervioso parasimpático.",
                    mechanism: "Al usar el diafragma en lugar del pecho, optimizas el intercambio de oxígeno y reduces el \"trabajo de respirar\", señalando al cerebro que el cuerpo está seguro. Esto activa la respuesta de relajación.",
                    steps: [
                        "Acuéstate boca arriba o siéntate con la espalda recta",
                        "Coloca una mano en el pecho y la otra en el abdomen",
                        "Inhala por la nariz, haciendo que el abdomen suba mientras el pecho permanece quieto",
                        "Exhala con los labios fruncidos como si soplaras por una pajita",
                        "Siente cómo el abdomen baja al exhalar completamente",
                        "Practica de 5 a 10 minutos (6-12 ciclos)"
                    ]
                },
                resonance: {
                    name: "Frecuencia de Resonancia",
                    tagline: "Respiración Coherente - Maximiza la VRC",
                    science: "Revisiones sistemáticas en Scientific Reports muestran que esta es la tasa óptima para maximizar la Variabilidad del Ritmo Cardíaco (VRC) y sincronizar el corazón y los pulmones para un equilibrio autonómico óptimo.",
                    mechanism: "La mayoría de los adultos tienen una \"frecuencia de resonancia\" de aproximadamente 5.5 a 6 respiraciones por minuto. Este ritmo maximiza la eficiencia del barorreflejo (el sistema de control de presión arterial del cuerpo), creando coherencia entre los ritmos cardiovascular y respiratorio.",
                    steps: [
                        "Siéntate o acuéstate en una posición cómoda",
                        "Inhala suavemente por la nariz durante 5.5 segundos",
                        "Exhala suavemente por la nariz o boca durante 5.5 segundos",
                        "Mantén un flujo continuo sin pausas arriba o abajo",
                        "Mantén la respiración suave y sin esfuerzo",
                        "Practica de 10 a 20 minutos para beneficios óptimos de VRC"
                    ]
                },
                wimHof: {
                    name: "Método Wim Hof",
                    tagline: "Hiperventilación Cíclica - Fortalece la Inmunidad",
                    science: "Una revisión sistemática de 2024 en PLOS ONE confirmó que este método aumenta significativamente la epinefrina (adrenalina) e Interleucina-10 (una citocina antiinflamatoria), mientras reduce los marcadores proinflamatorios.",
                    mechanism: "La hiperventilación controlada seguida de una retención crea una respuesta de estrés \"hormético\" (beneficioso) que \"entrena\" el sistema inmunológico. Esto activa el sistema nervioso simpático y libera opioides endógenos.",
                    steps: [
                        "Toma 30 respiraciones profundas y rítmicas (inhala completamente, exhala naturalmente)",
                        "Después de la última exhalación, mantén la respiración lo más que puedas cómodamente",
                        "Cuando sientas la necesidad de respirar, toma una inhalación profunda",
                        "Mantén esa respiración de recuperación durante 15 segundos",
                        "Esto completa una ronda - repite 3 rondas",
                        "⚠️ ¡Nunca practiques en el agua o mientras conduces!"
                    ]
                },
                buteyko: {
                    name: "Pausa de Control Buteyko",
                    tagline: "Tolerancia al CO₂ - Eficiencia Respiratoria",
                    science: "Ampliamente estudiada para el asma y la eficiencia respiratoria. Los ensayos clínicos muestran que reduce la dependencia de inhaladores de rescate y mejora la tolerancia al CO₂, con mejoras significativas en la calidad de vida para condiciones respiratorias.",
                    mechanism: "Aumenta la \"Pausa de Control\" (PC)—el tiempo que puedes mantener cómodamente la respiración—que refleja la sensibilidad de tu cuerpo al CO₂. Al practicar respiración nasal ligera, reentrenar tu patrón respiratorio para ser más eficiente.",
                    steps: [
                        "Toma una respiración pequeña y suave por la nariz",
                        "Suelta una respiración pequeña y suave",
                        "Tapa tu nariz y mantén hasta sentir la primera necesidad de respirar",
                        "Esto mide tu Pausa de Control (PC) base",
                        "Luego respira ligeramente por la nariz con una \"ligera hambre de aire\"",
                        "Mantén la respiración superficial durante 30 segundos para aumentar la tolerancia al CO₂"
                    ]
                }
            }
        }
    },

    /**
     * Initialize i18n with user's preferred language
     */
    init() {
        // Check saved preference or browser language
        const savedLang = localStorage.getItem('breathe-lang');
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
        localStorage.setItem('breathe-lang', lang);
        this.translations = this.locales[lang];
        this.applyTranslations();
        this.updateLangSelector();
        
        // Re-generate dynamic content
        if (typeof App !== 'undefined' && App.generateTechniqueCards) {
            App.generateTechniqueCards();
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
        return this.t(`techniques.${techId}.${field}`);
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
