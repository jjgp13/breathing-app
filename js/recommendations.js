/** Transparent wellness suggestions. Feelings stay in memory; no diagnosis or metric inference. */
const Recommendations = {
    feelings: ['tense', 'busy', 'sleep', 'low', 'curious'],

    suggest({ feeling, minutes = 3, holds = false }, catalog = techniques) {
        if (!this.feelings.includes(feeling)) return null;
        const choices = {
            tense: ['cyclicSighing', 'diaphragmatic'],
            busy: holds ? ['box', 'diaphragmatic'] : ['diaphragmatic', 'resonance'],
            sleep: ['extendedExhale', 'diaphragmatic'],
            low: ['diaphragmatic', 'humming'],
            curious: ['resonance', 'humming']
        };
        const duration = [1, 3, 5].includes(Number(minutes)) ? Number(minutes) : 3;
        return {
            feeling, reason: feeling === 'busy' && holds ? 'busyWithHolds' : feeling,
            choices: choices[feeling].map(id => {
                const technique = catalog[id];
                const seconds = technique.phases.reduce((sum, phase) => sum + phase.duration, 0);
                const cycles = Math.min(technique.maxCycles, Math.max(1, Math.floor(duration * 60 / seconds)));
                return { id, cycles, seconds: cycles * seconds };
            })
        };
    }
};

if (typeof module !== 'undefined') module.exports = Recommendations;
