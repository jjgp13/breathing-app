# Breathe

A small English/Spanish breathing-practice app built with HTML, CSS, and JavaScript. The current six techniques have descriptions of potential benefits, evidence limitations, and links to the underlying research.

## Run locally

From the repository directory:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Open <http://127.0.0.1:8765>. Swiper 11 and GSAP 3.12.5 currently load from CDNs, so the app needs network access for those libraries. There is no build step or backend.

## Use on Android

Open the [live app](https://jjgp13.github.io/breathing-app/) in Chrome. To keep a shortcut, use the three-dot menu, then **Install and create shortcut → Create shortcut → Add**. Older Chrome versions may call this **Add to Home screen**; see [Google's instructions](https://support.google.com/chrome/answer/15085120?co=GENIE.Platform%3DAndroid&hl=en).

The published web app runs independently of a development computer. Pushes to `main` trigger the existing GitHub Pages deployment; refresh the phone after deployment to see new changes. A home-screen shortcut does not add offline support or native health-data access. A native Android integration is a separate planned step.

## Edit content

- `locales/en.json` and `locales/es.json` are the canonical user-facing content.
- Run `node scripts/sync-locales.cjs` after changing translations. Commit `js/locales.generated.js` alongside the JSON files so static hosting and local-file use need no translation fetches.
- Run `node scripts/sync-locales.cjs --check` to check language schemas and detect an outdated bundle.
- `js/techniques.js` holds phase timings, animation selection, cycle limits, citations, and evidence review dates. Research descriptions belong in the locale files.

## How it works

`js/app.js` coordinates the carousel, detail, practice, and completion screens. A `requestAnimationFrame` loop advances phase timers and feeds progress into the six animation modules. `js/audio.js` synthesizes sound cues with Web Audio. `js/backgrounds.js` manages decorative CSS effects. A screen wake lock is requested during practice. Only the language preference is persisted; there is currently no session history, account, wearable connection, or recommendation engine.

## Research and next steps

- [Research and product direction](docs/research-and-direction.md): evidence for the existing techniques, additional candidates, Android/Fitbit integration, and animation options.
- [Code review and validation](docs/code-review.md): baseline findings, what changed in this iteration, and remaining engineering work.

The evidence labels are editorial summaries of cited research, not formal clinical grades. Studies of a technique do not establish that this app's particular timing or session length has the same effects.
