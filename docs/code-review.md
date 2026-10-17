# Code review and validation

## October 16: everyday tools and Android preview

Added optional local reflections, favorites, named routines, weekday/time reminders, comfortable pacing, unpaced practice, sensory/accessibility controls, and installable offline delivery. Source protocols and their evidence limitations remain visible. New pace labels, SVG numbers and phase captions follow adapted timing. Advanced timings stay fixed; no-hold alternatives keep their own technique identity.

The local store validates bounded schemas, keeps history off by default and never stores Health Connect records. Saved feedback can reorder only existing gentle candidates for the same feeling. Web reminders explicitly use calendar export for closed-app delivery. The Android preview uses local notifications and on-demand selected Health Connect reads without network/background/write permissions. Its app assets are isolated from external content; health replies are invalidated after a newer request, clear/revoke or navigation.

Runtime libraries are pinned and local. Swiper was upgraded to 12.1.2 to remove its known prototype-pollution advisory; the dependency audit reports zero vulnerabilities. Versioned service-worker installation is atomic and respects app scope, while recorded sounds use separate optional caches. The app update waits for user activation outside practice. Native packaging includes all practice, audio and lesson assets and disables backup/device transfer.

Verification: 48 JavaScript tests pass. Browser checks covered adapted 3.2/4.8-second labels, restoring saved routine settings, completion and optional local feedback, preserving prior history when skipping another reflection, quiet/large/contrast controls, unpaced session time with no phase targets, Spanish and 320/390-pixel layouts, optional sound caching, and reloading the app with the local server stopped. Synthetic QA history/routines were removed afterward. Native compilation, three interval-merge unit tests, and Android lint pass; lint has no errors. APK permissions were inspected to confirm no internet, health-write, history, background-health or location access. Physical Fitbit/Android permission, TTS/haptic, reminder delivery and battery testing remain necessary on the user's phone.

## October 16: purposeful guidance

Timed practice now always uses the technique's 2D guide. Removed 3D mode selection and preference restoration from the session path, added phase-specific explanations and a phase progress bar, and retained still diagrams for reduced motion. Existing gentle pacing, audio, recommendations, and hold controls are preserved.

The only active 3D experience is an optional diaphragmatic-breathing lesson before practice. A new Blender dome surface supports front/side comparisons of the inhale/exhale positions. It has no autoplay, timer, or audio. The model is simplified and exaggerated, with an explanation that abdominal movement is not air filling the belly and a link to NHLBI mechanics. Teaching value remains a usability hypothesis.

The lesson handles load failures, close/reopen races, reduced-motion changes, and GPU cleanup. Its 2D comparison remains usable when WebGL is unavailable. Old decorative models remain archived without client requests. Content hashing now versions the bundle loader in `movement-lesson.js`.

Verification: all 34 tests pass, including old-preference migration to 2D, every phase caption in both languages, paused/reduced-motion guidance, non-autoplay, failure fallback, late-model disposal, and renderer release. Browser checks covered front/side and inhale/exhale comparisons, close/reopen cleanup, zero canvases during practice, English/Spanish labels, diaphragmatic and sighing sessions, and 320/390-pixel layouts without horizontal overflow. No warning/error logs appeared in those flows. Real-device and assistive-technology checks remain follow-ups. The following sections record earlier releases and baseline findings.

## Technique-specific visual guides update

Replaced the shared bloom/circle on the practice screen with nine pairs of technique-specific Blender/SVG guides. [The guide map](visual-guides.md) records the design rationale and source files. Both modes use the same pose data and session clock. The original bloom assets are retained as an archived art study.

Added model lifecycle handling for technique changes, matching 2D fallback, localized visual names and explanatory captions, static reduced-motion poses, and GLB part validation. The renderer releases the previous WebGL context. A cache issue found in the local browser also led to content-hashed script, CSS, bundle, and model URLs; build/check commands maintain those versions automatically.

Verification: 31 tests pass, all nine SVGs parse as XML, and all nine GLBs load with required parts and bounded geometry. Browser review rendered all eighteen visual variants. The app was checked for technique changes, 2D/3D switching, pause behavior, English/Spanish captions, and 320/390-pixel layouts without horizontal overflow. Real-device comfort, accessibility, and battery feedback remain useful follow-ups.

## Optional soundscapes update

Added local public-domain rain, a CC0 stream recording, and original synthesized ambient tones with separate background/cue volume controls, a global mute, a 15-second preview, and in-app credits. No sound or recording download starts on page load. Files and permission provenance are recorded under `assets/audio/`. Background audio is off by default; sound choices are preference settings rather than additional health claims.

The audio graph uses quieter envelopes and ramps instead of delayed JavaScript chimes. Session pauses clear scheduled cues and fade out the ambience; stop/restart, previews, track changes, and hidden-page pauses invalidate pending playback. Recorded loops blend their endpoints and use bounded RMS/peak levels. The app does not request microphone access or use an external streaming service.

Eight additional tests cover silent initialization, bounded saved preferences, pause/resume and mute, canceling pending downloads, rapid track switches, preview expiry/cancellation, failed-load recovery, muted-to-cues-only playback, and loop amplitude/seams. Total: 22 tests. Browser verification includes actual OGG decoding/playback state, sound controls at phone width, translated labels, and session integration. Real-phone listening and battery evaluation remain useful follow-ups.

## October 15 update: check-in and shared breathing guide

The earlier review below records the original app and first content release. The current release adds nine practices, an optional feeling/time/hold check-in, and a Blender-authored 3D bloom with an SVG alternative. Check-in rules are transparent product choices, not a clinically validated matching system. No health data is read or transmitted.

- `BreathingSession` now owns preparation and phases with one cancelable animation-frame clock. Generation tokens reject stale callbacks. Stop/restart and pauses during preparation are covered by deterministic clock tests.
- Removed the 500 ms cycle gaps and carried frame overshoot across phase/cycle boundaries. Completion reports actual practice time, excluding preparation and pauses.
- Added **Breathe now** during every hold; duration labels say **up to**. The advanced recovery inhale is a separate phase, and the final Buteyko-style phase returns to natural breathing. Advanced practices are labeled and excluded from recommendations.
- Hidden tabs pause and require an explicit resume. Long frame stalls pause instead of skipping instructions. Wake-lock requests use an epoch so a late result cannot keep a stopped session awake.
- Text, countdown, sound cues, the SVG, and the Blender morph animation use the same phase state. The bloom opens on inhale, adds a smaller opening for the second inhale, closes on exhale/hum, and stays still during holds. The renderer has no independent animation loop.
- 3D loads on demand, caps device pixel ratio at 1.5 and rendering at about 30 fps, skips unchanged poses, and disposes scene resources. Failed WebGL/model loads keep the simple guide available. Reduced-motion preferences prevent WebGL loading and scaling; background decoration is disabled.
- Added focus handling, live phase announcements, visible focus styles, translated check-in/guidance in English and Spanish, and storage fallbacks. The carousel's start button waits for transitions to finish.
- The Blender source, export, reproducible generator, dependency lockfile, and Three.js license are committed with the generated browser bundle. Static hosting needs no server-side build.

Verification: 14 Node tests cover timing boundaries, stale frames, preparation/hidden pauses, early hold release, completion accounting, every feeling/time/hold combination, evidence/locale coverage, guide continuity, real GLB morph animation, reduced motion, and renderer failures. Browser checks at 390 px confirmed recommendations, opt-in box breathing, one-cycle completion with early hold release, pause during preparation, stop/restart, switching visual modes, and English/Spanish guidance. Console errors were absent during the tested flows. The phone-width menu had no horizontal overflow.

Remaining: physical Android testing (battery, audio, wake lock and real background behavior); deeper assistive-technology testing; offline/PWA delivery and fully local dependencies; optional session history; native Health Connect permissions/records; and validation of any future metric-based suggestions. The two older CDNs remain runtime dependencies. Automated tests and a desktop phone-size viewport do not establish clinical benefit or real-device compatibility.

## Original review record

Repository: `jjgp13/breathing-app`. Reviewed baseline: `2d6aae0` on `main`. Local working branch: `codex/research-and-roadmap`. Date: October 14, 2026.

## Baseline architecture

Static HTML/CSS and global JavaScript modules, with six techniques and six corresponding DOM/SVG animation controllers. Swiper provides the coverflow selector; GSAP provides transitions. `App` coordinates four screens, phase/cycle state, animation frames, audio cues, and a screen wake lock. No backend, account system, health adapter, session persistence, recommender, service worker, dependency lockfile, or test runner was present.

The architecture is small enough to evolve incrementally. A framework rewrite is not required for either evidence content or a first optional 3D renderer.

## First content release

- Added potential benefits, technique-specific evidence summaries, evidence limitations, direct citations, review dates, and practice guidance to all six detail views.
- Removed broad immunity, nervous-system reset, uniquely optimal frequency, guaranteed cortisol, and general CO2-tolerance claims. Clinical-program evidence is identified as such.
- Corrected the mismatch between written session lengths and available cycles. Default diaphragmatic practice is 60 seconds of phases; maximum is 120. Default resonance practice is 110 seconds; maximum is 220. Preparation and transitions add time.
- Removed the contradictory instruction saying 4-7-8 could never exceed eight cycles while the existing slider allowed twenty. Retained the current limit and replaced the claim with comfort-based instructions; this is not a clinical dose recommendation.
- Made canonical English/Spanish JSON generate a static JavaScript bundle; removed repeated English prose from timing metadata. This avoids maintaining the same claim in three different places.
- Language changes refresh an open detail view and set the document language without resetting the chosen cycle count. Study titles remain in their original English.
- Fixed a language-switch carousel defect found during phone-width testing: translating cards now preserves the slide nodes and active state owned by Swiper, so Begin Practice continues to work after changing languages.
- Re-enabled browser zoom. Sources use semantic links and native disclosure controls.

## Baseline findings (current status is described above)

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
