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

The build generates translations, bundles pinned Three.js locally, and versions scripts, stylesheets, and model URLs by content hash. Commit generated files with source changes. `npm run check` detects stale generated content or asset versions. Tests use Node's built-in runner and cover session timing, recommendation constraints, guidance continuity, reduced motion, and renderer failures.

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

`js/breath-guide.js` maps phase progress into words, a countdown, a phase strip, and a technique-specific 2D or 3D guide. `js/guide-patterns.js` creates one shared pose for both renderers; `js/guide2d.js` draws the nine SVG guides, and `js/guide-poses.mjs` poses the named Blender parts. A failed 3D load falls back to the matching 2D guide. Reduced motion keeps that technique's static illustration and text without loading WebGL. The 3D renderer caps pixel ratio and frame rate, has no independent animation clock, and disposes the previous model when the technique changes. [The visual guide map](docs/visual-guides.md) explains all nine pairs.

## Sound and music

Open **♫ Sound & music** from the header or practice settings. Choose no background, soft rain, a flowing stream, or original synthesized ambient tones. Background and breathing-cue volumes are independent; the speaker button mutes everything. Background sound is off by default. A 15-second preview is available before practice; closing settings stops the preview. Changing settings during practice applies immediately.

`js/audio.js` owns one Web Audio graph, cached decoded recordings, gentle fades, normalized crossfaded loops, and cancellable cues. Pause, hidden-tab interruptions, stop, and track changes invalidate pending loads so a late download cannot restart audio. Preferences are saved locally. Recordings are downloaded only when selected for playback; the app hosts them itself and uses no music-streaming account. Session audio is paused when the page is hidden, so this does not provide background playback with the phone locked.

The rain recording is dedicated to the public domain; the stream is CC0. Creator links and permissions appear in the sound panel and [the asset record](assets/audio/README.md). These permissions apply independently of whether the app is monetized. Ambient tones and softer phase chimes contain no external music samples. Choosing an ambient background is a comfort preference, without an added health-effect claim.

## Blender artwork

Nine original models and preview animations were authored in Blender 5.2 using `scripts/create-technique-models.py`. Editable source: `assets/models/techniques/technique-guides.blend`; individual web exports are in the same directory. The saved scene arranges all nine designs together. The app poses their named parts directly from breathing phases, rather than playing their preview clips at a fixed speed. To regenerate:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --python scripts/create-technique-models.py
npm run build
```

The earlier bloom source and generator remain as an archived art study; the practice screen uses the nine new guides. These visuals explain pacing and movement; they do not measure respiration or HRV. Three.js's MIT license is included at `assets/THREE-LICENSE.txt`. The repository's own distribution/contribution license still needs an owner decision.

## Research and next steps

- [Research and product direction](docs/research-and-direction.md): evidence for the existing techniques, additional candidates, Android/Fitbit integration, and animation options.
- [Code review and validation](docs/code-review.md): baseline findings, what changed in this iteration, and remaining engineering work.

The evidence labels are editorial summaries of cited research, not formal clinical grades. Studies of a technique do not establish that this app's particular timing or session length has the same effects.
