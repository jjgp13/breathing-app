# A guide for each breathing practice

Each practice has its own 2D SVG and original Blender 3D model. Both receive the same phase-derived pose, so changing visual modes preserves timing. Captions in English and Spanish explain how to read each guide. The forms are pacing metaphors or simplified movement cues, without physiological measurements or claims of additional health benefits.

| Practice | Matched 2D / 3D design | How it explains the technique |
| --- | --- | --- |
| Box | Four-sided path / beveled frame with pearl marker | One side per phase: inhale, pause, exhale, pause. The marker counts time during holds; it does not indicate another breath. |
| 4–7–8 | Segmented ring and central lantern | Segment lengths represent 4, 7, and 8 seconds. The center opens during inhale, remains still during the hold, and closes during exhale. |
| Diaphragmatic | Torso, lower-belly shape, gold diaphragm curve | The belly widens as the diaphragm curve lowers and flattens during inhale; the movement reverses during exhale. This is schematic, not a complete anatomical model or a demand to take a larger breath. |
| Slow / resonance | Rising and falling tide with a floating pearl | The tide rises on inhale and falls on exhale, continuously without holds. It represents the breathing pace, not a live HRV waveform. |
| Wim Hof-style | Thirty breath-count beads and a central breathing shape | One bead corresponds to each configured power breath. The center becomes still during retention; recovery inhale and hold follow their own phases. No hold score, record, or target is shown. |
| Buteyko-style | Feather and resting support | Small movements accompany gentle inhale/exhale. The feather rests during the optional pause and the unpaced natural-breathing interval. |
| Gentle cyclic sighing | Larger first chamber, smaller second chamber | The first inhale opens the larger chamber, the top-up opens the smaller one, and both release on the same exhale. These are visual stages, not measured lung volumes. |
| Longer exhale | Hourglass with two colored bowls | The upper bowl fills over four seconds and releases over six. The lower bowl fills as the upper empties, making the longer exhale visible without adding a hold. |
| Humming | Resonating bowl, breathing pearl, vibration arcs | The pearl opens on inhale and settles on exhale. Vibration arcs appear only during humming, and represent sound rather than extra breaths. |

The diaphragm direction follows [NHLBI's description of breathing mechanics](https://www.nhlbi.nih.gov/health/lungs/breathing-benefits): contraction lowers the diaphragm on inhalation. The app retains its existing gentle pacing and comfort guidance; it does not copy a clinical training program or imply that this schematic is an anatomical measurement.

## Source and playback

- `scripts/create-technique-models.py` creates all nine models and preview animations in Blender 5.2.
- `assets/models/techniques/technique-guides.blend` is the editable source; each corresponding `.glb` contains only that guide and its preview animation.
- `js/guide-patterns.js` translates the session state into poses. `js/guide2d.js` and `js/guide-poses.mjs` implement the paired renderers.
- The web renderer does not play Blender's preview clips autonomously. All visible changes derive from phase progress; pause freezes the pose.
- Reduced motion uses a stable, technique-specific 2D illustration. A 3D failure keeps that same 2D illustration available, and another technique can try its own model.
- Model changes invalidate pending loads, dispose GPU resources, and release the old WebGL context. Only the current practice's GLB loads in the app.
- `npm run build` generates model versions and content-hashed browser URLs. `npm run check` checks those versions and the translation bundle before running tests.

## Verification

31 tests cover the existing app behavior plus all nine GLB models, required animated parts, geometry bounds, phase endpoints, finite transforms, static reduced-motion poses, continuous sighing stages, proportional 4–7–8 timing, square corners, humming-only ripples, unpaced feather rest, thirty-breath counting, and diaphragm direction. All nine SVG artworks also passed XML parsing. Browser review rendered all eighteen designs together, then checked technique and mode switching in the app, translated captions, and 320/390-pixel layouts. A phone-sized desktop browser does not replace real-device usability and battery checks.
