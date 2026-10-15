# Breathe

A free-to-use English/Spanish breathing-practice app built with HTML, CSS, and JavaScript. Nine practices include potential benefits, evidence limitations, and study links. An optional feeling check-in suggests gentle practices with a reason, available time, and a preference for holds. No account is required.

## Run locally

From the repository directory:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Open <http://127.0.0.1:8765>. Swiper 11 and GSAP 3.12.5 load from CDNs, so those libraries need network access. There is no backend. Generated browser assets are committed, so serving a checkout needs no build step.

To edit and rebuild:

```powershell
npm ci
npm run build
npm run check
```

The build generates translations and bundles pinned Three.js locally. Commit the generated files with source changes. Tests use Node's built-in runner and cover session timing, recommendation constraints, guidance continuity, reduced motion, and renderer failures.

## Use on Android

Open the [live app](https://jjgp13.github.io/breathing-app/) in Chrome. To keep a shortcut, use the three-dot menu, then **Install and create shortcut → Create shortcut → Add**. Older Chrome versions may call this **Add to Home screen**; see [Google's instructions](https://support.google.com/chrome/answer/15085120?co=GENIE.Platform%3DAndroid&hl=en).

The published web app runs independently of a development computer. Pushes to `main` trigger the existing GitHub Pages deployment; refresh the phone after deployment to see new changes. A home-screen shortcut does not add offline support or native health-data access. A native Android integration is a separate planned step.

## Edit content

- `locales/en.json` and `locales/es.json` are the canonical user-facing content.
- Run `node scripts/sync-locales.cjs` after changing translations. Commit `js/locales.generated.js` alongside the JSON files so static hosting and local-file use need no translation fetches.
- Run `node scripts/sync-locales.cjs --check` to check language schemas and detect an outdated bundle.
- `js/techniques.js` holds phase timings, animation selection, cycle limits, citations, and evidence review dates. Research descriptions belong in the locale files.

## How it works

`js/app.js` coordinates the four screens. `js/session.js` owns one cancelable clock for preparation, phases, cues, and visuals. It preserves frame overshoot, pauses when hidden or interrupted, rejects stale callbacks, and counts actual practice time. Holds can end immediately with **Breathe now**. A screen wake lock is requested during active practice when supported.

`js/recommendations.js` uses transparent rules based on the selected feeling, time, and hold preference. These are wellness suggestions, not a validated clinical matching algorithm. Advanced hyperventilation/retention practices are never recommended automatically. Check-ins remain in memory; only language and visual preferences are saved locally. No health records, session history, account, or wearable connection are implemented.

`js/breath-guide.js` maps phase progress into words, a countdown, a phase strip, and either a simple SVG circle or the 3D bloom. The second inhale in cyclic sighing is shown as a small additional opening. The bloom stays still during holds. Reduced-motion mode uses a stable circle and text without loading WebGL. A failed 3D load falls back to the circle. `js/guide3d.mjs` lazy-loads the small GLB, caps pixel ratio, and seeks its animation from the session clock; it has no independent animation loop.

## Blender artwork

The original model and morph animation were generated in Blender 5.2 from `scripts/create-bloom.py`. Editable source: `assets/models/breathing-bloom.blend`; web export: `assets/models/breathing-bloom.glb` (about 133 KiB). It is a pacing metaphor, not anatomical or physiological feedback. To regenerate:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --python scripts/create-bloom.py
```

Three.js's MIT license is included at `assets/THREE-LICENSE.txt`. The repository's own distribution/contribution license still needs an owner decision.

## Research and next steps

- [Research and product direction](docs/research-and-direction.md): evidence for the existing techniques, additional candidates, Android/Fitbit integration, and animation options.
- [Code review and validation](docs/code-review.md): baseline findings, what changed in this iteration, and remaining engineering work.

The evidence labels are editorial summaries of cited research, not formal clinical grades. Studies of a technique do not establish that this app's particular timing or session length has the same effects.
