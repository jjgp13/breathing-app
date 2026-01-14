/**
 * Breathing Techniques Data
 * Each technique contains all the information needed for display and execution
 */

const techniques = {
    box: {
        id: 'box',
        name: 'Box Breathing',
        tagline: 'Square Breathing - Used by Navy SEALs',
        icon: '🔲',
        color: '#64b5f6',
        phases: [
            { name: 'Inhale', duration: 4, type: 'inhale' },
            { name: 'Hold', duration: 4, type: 'hold' },
            { name: 'Exhale', duration: 4, type: 'exhale' },
            { name: 'Hold', duration: 4, type: 'hold' }
        ],
        science: 'Utilized by Navy SEALs for "arousal control." A 2023 study indicated it effectively balances the Autonomic Nervous System (ANS) and improves performance under stress.',
        mechanism: 'The symmetrical "box" shape creates a steady rhythm that prevents the heart from spiking during high-pressure transitions. The equal duration phases help synchronize breath with heart rate variability.',
        steps: [
            'Inhale through the nose for 4 seconds',
            'Hold the air in for 4 seconds',
            'Exhale through the mouth for 4 seconds',
            'Hold with empty lungs for 4 seconds',
            'Repeat for 4 to 10 cycles'
        ],
        animation: 'box',
        maxCycles: 10,
        defaultCycles: 4
    },
    
    fourSevenEight: {
        id: 'fourSevenEight',
        name: '4-7-8 Technique',
        tagline: 'The "Nervous System Reset"',
        icon: '🌙',
        color: '#9c7cf4',
        phases: [
            { name: 'Inhale', duration: 4, type: 'inhale' },
            { name: 'Hold', duration: 7, type: 'hold' },
            { name: 'Exhale', duration: 8, type: 'exhale' }
        ],
        science: 'A 2022 study in Physiological Reports suggests that the 4-7-8 ratio specifically increases High-Frequency Power in Heart Rate Variability (HRV), indicating a sharp rise in parasympathetic (rest-and-digest) activity.',
        mechanism: 'The 7-second hold allows for a temporary increase in CO₂ in the blood, which dilates the blood vessels and lowers blood pressure. The 8-second exhale stimulates the Vagus nerve to slow the heart rate.',
        steps: [
            'Place tongue tip against ridge behind upper front teeth',
            'Inhale quietly through the nose for 4 seconds',
            'Hold breath for 7 seconds',
            'Exhale forcefully through mouth (make a "whoosh" sound) for 8 seconds',
            'Repeat for 4 breaths initially; never exceed 8 cycles per session'
        ],
        animation: 'arc',
        maxCycles: 8,
        defaultCycles: 4
    },

    diaphragmatic: {
        id: 'diaphragmatic',
        name: 'Diaphragmatic Breathing',
        tagline: 'Belly Breathing - Reduce Stress & Cortisol',
        icon: '🫁',
        color: '#4db6ac',
        phases: [
            { name: 'Inhale', duration: 5, type: 'inhale' },
            { name: 'Exhale', duration: 5, type: 'exhale' }
        ],
        science: 'Research published by The Cleveland Clinic and Johns Hopkins confirms this technique reduces cortisol levels and improves core stability. Studies show it activates the parasympathetic nervous system effectively.',
        mechanism: 'By engaging the diaphragm rather than the chest, you optimize oxygen exchange and reduce the "work of breathing," signaling to the brain that the body is safe. This triggers the relaxation response.',
        steps: [
            'Lie on your back or sit with a straight spine',
            'Place one hand on your chest and the other on your belly',
            'Inhale through the nose, making your belly rise while chest stays still',
            'Exhale through pursed lips as if blowing through a straw',
            'Feel the belly sink as you exhale completely',
            'Practice for 5-10 minutes (6-12 cycles)'
        ],
        animation: 'belly',
        maxCycles: 12,
        defaultCycles: 6
    },

    resonance: {
        id: 'resonance',
        name: 'Resonance Frequency',
        tagline: 'Coherent Breathing - Maximize HRV',
        icon: '🌊',
        color: '#7986cb',
        phases: [
            { name: 'Inhale', duration: 5.5, type: 'inhale' },
            { name: 'Exhale', duration: 5.5, type: 'exhale' }
        ],
        science: 'Systematic reviews in Scientific Reports show this is the optimal rate to maximize Heart Rate Variability (HRV) and synchronize the heart and lungs for peak autonomic balance.',
        mechanism: 'Most adults have a "resonant frequency" at approximately 5.5 to 6 breaths per minute. This timing maximizes the efficiency of the baroreflex (the body\'s blood pressure control system), creating coherence between cardiovascular and respiratory rhythms.',
        steps: [
            'Sit or lie in a comfortable position',
            'Inhale smoothly through the nose for 5.5 seconds',
            'Exhale smoothly through the nose or mouth for 5.5 seconds',
            'Maintain a continuous flow with no pauses at top or bottom',
            'Keep the breath gentle and effortless',
            'Practice for 10-20 minutes for optimal HRV benefits'
        ],
        animation: 'wave',
        maxCycles: 20,
        defaultCycles: 10
    },

    wimHof: {
        id: 'wimHof',
        name: 'Wim Hof Method',
        tagline: 'Cyclic Hyperventilation - Boost Immunity',
        icon: '🔥',
        color: '#ff7043',
        phases: [
            { name: 'Power Breaths (30x)', duration: 45, type: 'power', subBreaths: 30 },
            { name: 'Retention Hold', duration: 60, type: 'retention' },
            { name: 'Recovery Breath', duration: 15, type: 'recovery' }
        ],
        science: 'A 2024 systematic review in PLOS ONE confirmed that this method significantly increases epinephrine (adrenaline) and Interleukin-10 (an anti-inflammatory cytokine), while reducing pro-inflammatory markers.',
        mechanism: 'Controlled hyperventilation followed by a hold creates a "hormetic" (beneficial) stress response that "trains" the immune system. This activates the sympathetic nervous system and releases endogenous opioids.',
        steps: [
            'Take 30 deep, rhythmic breaths (fully in, naturally out)',
            'After the last exhale, hold your breath as long as comfortable',
            'When you feel the urge to breathe, take a deep inhale',
            'Hold that recovery breath for 15 seconds',
            'This completes one round - repeat for 3 rounds',
            '⚠️ Never practice in water or while driving!'
        ],
        animation: 'power',
        maxCycles: 4,
        defaultCycles: 3
    },

    buteyko: {
        id: 'buteyko',
        name: 'Buteyko Control Pause',
        tagline: 'CO₂ Tolerance - Respiratory Efficiency',
        icon: '🎯',
        color: '#26a69a',
        phases: [
            { name: 'Light Inhale', duration: 3, type: 'inhale' },
            { name: 'Light Exhale', duration: 3, type: 'exhale' },
            { name: 'Control Pause', duration: 20, type: 'hold' },
            { name: 'Shallow Breathing', duration: 30, type: 'shallow' }
        ],
        science: 'Extensively studied for asthma and respiratory efficiency. Clinical trials show it reduces reliance on rescue inhalers and improves CO₂ tolerance, with significant improvements in quality of life for respiratory conditions.',
        mechanism: 'Increases the "Control Pause" (CP)—the time you can comfortably hold your breath—which reflects your body\'s sensitivity to CO₂. By practicing light, nasal breathing, you retrain your breathing pattern to be more efficient.',
        steps: [
            'Take a small, gentle breath in through your nose',
            'Release a small, gentle breath out',
            'Pinch your nose and hold until you feel the first urge to breathe',
            'This measures your Control Pause (CP) baseline',
            'Then breathe lightly through the nose with a "slight air hunger"',
            'Maintain shallow breathing for 30 seconds to build CO₂ tolerance'
        ],
        animation: 'gauge',
        maxCycles: 6,
        defaultCycles: 4
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = techniques;
}
