# Code review and validation

Repository: `jjgp13/breathing-app`. Reviewed baseline: `2d6aae0` on `main`. Local working branch: `codex/research-and-roadmap`. Date: October 14, 2026.

## Current architecture

Static HTML/CSS and global JavaScript modules, with six techniques and six corresponding DOM/SVG animation controllers. Swiper provides the coverflow selector; GSAP provides transitions. `App` coordinates four screens, phase/cycle state, animation frames, audio cues, and a screen wake lock. No backend, account system, health adapter, session persistence, recommender, service worker, dependency lockfile, or test runner was present.

The architecture is small enough to evolve incrementally. A framework rewrite is not required for either evidence content or a first optional 3D renderer.

## Changes made in this iteration

- Added potential benefits, technique-specific evidence summaries, evidence limitations, direct citations, review dates, and practice guidance to all six detail views.
- Removed broad immunity, nervous-system reset, uniquely optimal frequency, guaranteed cortisol, and general CO2-tolerance claims. Clinical-program evidence is identified as such.
- Corrected the mismatch between written session lengths and available cycles. Default diaphragmatic practice is 60 seconds of phases; maximum is 120. Default resonance practice is 110 seconds; maximum is 220. Preparation and transitions add time.
- Removed the contradictory instruction saying 4-7-8 could never exceed eight cycles while the existing slider allowed twenty. Retained the current limit and replaced the claim with comfort-based instructions; this is not a clinical dose recommendation.
- Made canonical English/Spanish JSON generate a static JavaScript bundle; removed repeated English prose from timing metadata. This avoids maintaining the same claim in three different places.
- Language changes refresh an open detail view and set the document language without resetting the chosen cycle count. Study titles remain in their original English.
- Fixed a language-switch carousel defect found during phone-width testing: translating cards now preserves the slide nodes and active state owned by Swiper, so Begin Practice continues to work after changing languages.
- Re-enabled browser zoom. Sources use semantic links and native disclosure controls.

## Remaining findings

### High priority: session lifecycle

`startExercise()` creates a countdown interval in a local variable. `stopExercise()` does not clear it. A mocked-clock reproduction of start -> stop -> immediate restart left **two countdown intervals** and caused **two phase starts for one active session**. Those callbacks share state and can create competing animation loops. Own countdowns and transitions in a session object, invalidate stale callbacks with a session identifier, and cancel them on stop, restart, and completion.

Pausing during preparation or the 500 ms inter-cycle transition also needs explicit state handling. Current pause logic assumes an active phase timestamp. The transition timeout is untracked and `startPhase()` does not check `isPaused` before changing the phase/timing. Test preparation, phase, transition, hidden-tab, and wake-lock paths as separate lifecycle states before extending the engine.

### High priority: user-controlled holds

The Wim Hof-style pattern has a fixed 60-second retention phase; the Buteyko-style pattern has a fixed 20-second pause. These are not measurements of individual comfort or a clinical program. This iteration makes that explicit and tells users to stop and breathe sooner. It does **not** replace those timed phases with adaptive controls. Add a prominent immediate “Breathe now / End hold” action and avoid maximum-duration targets before promoting these advanced patterns broadly. Do not use them as automatic responses to wearable readings.

For safety provenance, the [official Wim Hof guidance](https://www.wimhofmethod.com/breathing-exercises) acknowledges loss-of-consciousness risk and requires a safe seated/lying setting away from water/driving. The [FAQ](https://www.wimhofmethod.com/faq) advises against practice during pregnancy. Use independent research for efficacy claims, not vendor marketing.

### Medium priority: timing and continuity

`completePhase()` adds a 500 ms delay after every cycle. A continuous 11-second slow-breathing cycle therefore has an extra gap; the actual repeated cadence differs from the nominal phase rate. The engine also resets phase time at boundaries instead of consuming elapsed overshoot, and the completion duration includes preparation/transitions. Use one monotonic session timeline and explicitly distinguish practice, pause, and preparation time.

### Medium priority: access, resilience, and delivery

- Reduced motion is not handled; layered particle/wave/gradient effects run by default. Focus management and live phase announcements need an accessibility pass.
- CDNs are runtime dependencies; Swiper is pinned only to major version 11. Vendor or bundle dependencies before reliable offline delivery. This is not currently a complete installable/offline PWA.
- Rapid pagination followed immediately by starting a technique can leave the previous slide selected while Swiper is transitioning. Define selection readiness and test navigation around the coverflow animation; this occurred during browser verification of the existing carousel behavior.
- Screen visibility reacquires wake lock but does not define whether a hidden session pauses or catches up. Validate audio behavior and clock transitions on real Android hardware.
- Language storage access can throw in restricted storage contexts. Add graceful fallback when hardening the app.
- A larger evidence catalog will need content review/versioning and per-protocol dose metadata; citations alone do not validate app behavior.

## Verification record

- Baseline: parsed all 11 original JavaScript files successfully, inspected live carousel/detail screens, verified the two original locale JSON files matched their embedded runtime copies, calculated every configured session length, and reproduced the countdown/restart defect with mocked timing.
- Updated: parsed all 12 runtime JavaScript files; rendered and checked all six research views in both languages in a DOM stub (12 combinations); verified 10 unique study links and safe external-link attributes; checked preservation of chosen cycles and document language during language changes. The locale generator/schema check passed. Live browser checks confirmed English and Spanish slow-breathing details, expandable citations, and the language-switch navigation fix. At a 390-pixel viewport, the detail page had no horizontal overflow. Diff whitespace checks passed.
- This is a functional/content review, not clinical validation, a security audit, or a real-device Health Connect test. No health data was accessed or uploaded. Publication is through the existing GitHub Pages site, following verification.
