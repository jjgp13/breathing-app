# Clear practice cues and an optional movement lesson

Every timed practice uses a technique-specific 2D SVG, with phase-specific captions, a countdown, and a small phase progress bar. There is no 3D preference or mode switch during practice, including for returning users with an older saved preference. The forms are pacing metaphors or simplified movement cues, without physiological measurements or claims of additional health benefits. Captions are available in English and Spanish.

| Practice | 2D guide | How it explains the technique |
| --- | --- | --- |
| Box | Four-sided path and marker | One side per phase: inhale, pause, exhale, pause. The marker counts time during holds; the center stays still. |
| 4–7–8 | Segmented ring and central lantern | Segment lengths represent 4, 7, and 8 seconds. The center opens during inhale, remains still during the hold, and closes during exhale. |
| Diaphragmatic | Torso, lower-belly shape, gold diaphragm curve | The belly widens as the diaphragm curve lowers and flattens during inhale; the movement reverses during exhale. This is schematic, not a complete anatomical model or a demand to take a larger breath. |
| Slow / resonance | Rising and falling tide with a floating pearl | The tide rises on inhale and falls on exhale, continuously without holds. It represents the breathing pace, not a live HRV waveform. |
| Wim Hof-style | Thirty breath-count beads and a central breathing shape | One bead corresponds to each configured power breath. The center becomes still during retention; recovery inhale and hold follow their own phases. No hold score, record, or target is shown. |
| Buteyko-style | Feather and resting support | Small movements accompany gentle inhale/exhale. The feather rests during the optional pause and the unpaced natural-breathing interval. |
| Gentle cyclic sighing | Larger first chamber, smaller second chamber | The first inhale opens the larger chamber, the top-up opens the smaller one, and both release on the same exhale. These are visual stages, not measured lung volumes. |
| Longer exhale | Hourglass with two colored bowls | The upper bowl fills over four seconds and releases over six. The lower bowl fills as the upper empties, making the longer exhale visible without adding a hold. |
| Humming | Resonating bowl, breathing pearl, vibration arcs | The pearl opens on inhale and settles on exhale. Vibration arcs appear only during humming, and represent sound rather than extra breaths. |

## Where 3D has a purpose

Only the diaphragmatic-breathing detail screen offers **Explore the movement in 3D**. It is a teaching comparison before practice, with front/side views and explicit inhale/exhale position buttons. The gold diaphragm is a domed surface; turning to the side shows its depth and flattening. A green abdominal shape shows gentle outward movement. Short transitions occur only after a position is selected; there is no autoplay, breathing timer, audio, or performance target.

The diaphragm direction follows [NHLBI's description of breathing mechanics](https://www.nhlbi.nih.gov/health/lungs/breathing-benefits): contraction lowers the diaphragm on inhalation, and relaxation reverses the movement. The simplified model exaggerates motion and omits organs. Its note explains that the lungs are above the diaphragm and that the green shape does not represent air entering the belly. This is a design rationale for using depth, not evidence that a 3D lesson improves learning or health. That needs usability feedback. The app retains its gentle pacing and comfort guidance without copying a clinical training program.

## Source and playback

- `js/guide-patterns.js` translates session state into poses for the nine SVGs in `js/guide2d.js`. Pause freezes practice poses and progress; phase captions clear while the pause instruction asks the user to breathe normally.
- Reduced-motion practice uses a still illustration with the normal text/countdown and no changing progress bar.
- `scripts/create-diaphragm-lesson.py` creates the active lesson model in Blender 5.2. Editable source: `assets/models/techniques/diaphragm-lesson.blend`; export: `diaphragmatic.glb`.
- `js/movement-lesson.js` downloads the Three.js bundle and diaphragm GLB only when the lesson is opened. `js/guide3d.mjs` rejects other technique IDs. `js/guide-poses.mjs` poses its named parts; camera views are fixed and user-selected.
- Reduced motion and WebGL/model failures retain a usable 2D position comparison; the camera controls are disabled. Changing to reduced motion releases the renderer immediately.
- Closing the lesson invalidates pending loads, disposes GPU resources, and releases the WebGL context. Late model arrivals are destroyed. Reopening starts in the resting/front position.
- The bloom and former nine-model gallery remain archived in the repository. `create-technique-models.py` and `technique-guides.blend` describe the older gallery. Regenerating it overwrites the diaphragm export, so run the active lesson generator afterward. Those decorative 3D models are not exposed or requested by the app.
- `npm run build` generates model versions and content-hashed browser URLs. `npm run check` checks those versions and the translation bundle before running tests.

## Verification

34 tests cover session timing, recommendations, audio lifecycle, complete translated phase cues, 2D practice despite old preferences, pause/reduced motion, lesson load failures and late arrivals, non-autoplay, renderer release, all nine archived/current GLBs, geometry bounds, phase endpoints, finite transforms, sighing continuity, proportional 4–7–8 timing, humming-only ripples, breath counts, and diaphragm direction. Phone-sized desktop checks do not replace real-device usability, accessibility, or battery testing.
