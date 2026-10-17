# Breathe

A free-to-use English/Spanish breathing-practice app built with HTML, CSS, and JavaScript. Nine practices include evidence limitations and study links. Optional tools include feeling check-ins, saved routines, private reflections, comfortable pacing, unpaced breathing, sensory/accessibility settings, and offline use. No account or paid backend is required. An Android preview adds on-demand Health Connect context and local reminders.

## Run locally

From the repository directory:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Open <http://127.0.0.1:8765>. All runtime dependencies are vendored locally. There is no backend. Generated browser assets are committed, so serving a checkout needs no build step. Service workers require localhost or HTTPS; after changing code, use **Install & offline → Update ready** when offered. Core practices cache automatically; recorded sounds are separate opt-in downloads.

To edit and rebuild:

```powershell
npm ci
npm run build
npm run check
```

The build generates translations, vendors pinned Swiper/GSAP, bundles Three.js, versions assets, and generates the offline shell. Commit generated files with source changes. `npm run check` detects stale translations, versions, or service-worker content. Tests use Node's built-in runner and cover timing, recommendations, personal-data consent and bounds, calendar output, offline navigation, guidance, and renderer lifecycles. The former Swiper 11 runtime was upgraded to patched 12.1.2; dependency audit reports no vulnerabilities at this release.

## Use on Android

Open the [live app](https://jjgp13.github.io/breathing-app/) in Chrome. To keep a shortcut, use the three-dot menu, then **Install and create shortcut → Create shortcut → Add**. Older Chrome versions may call this **Add to Home screen**; see [Google's instructions](https://support.google.com/chrome/answer/15085120?co=GENIE.Platform%3DAndroid&hl=en).

The published web app runs independently of a development computer. Pushes to `main` update GitHub Pages. The installed web app caches the core after an online visit; rain/stream recordings can be saved in **Install & offline**. Updates wait for user activation outside practice. The optional 3D lesson needs a connection on the website; if unavailable, its 2D comparison remains usable. Device voices vary in offline availability. This web installation does not add Health Connect access.

## Everyday practice tools

- **Your comfortable pace** changes gentle phase lengths to 60/80/100/120/140% of the reference duration. The diagram labels, phase strip, captions and timer follow the adaptation. Advanced patterns retain their timing. A no-hold alternative and the immediate **Breathe now** action remain available.
- **Breathe at my own pace** provides a still illustration and a 1/3/5/10-minute session clock with no inhale/exhale targets. Stopping early is fine. Adaptations are explicitly distinguished from the studied reference protocols.
- **Comfort & access** offers spoken instructions, vibration, dim practice display, larger text, higher contrast and quiet mode. Cues stop on pause/background/stop; quiet mode suppresses all practice sounds, speech and vibration. Browser speech/vibration depend on the device. Website sessions pause in the background rather than continuing with a locked phone.
- Favorite a setup or save a named routine with duration, pace and ambient sound. Optional weekday/time reminders export as calendar files on the website, with an in-app notice while open. Import and manage the event in a compatible calendar; removing a routine does not remove an imported event. Android uses local notifications, subject to permission and system scheduling delays.
- After completion or an early stop, an optional reflection asks whether you feel more settled, about the same or less comfortable. Saving is off by default. Opted-in reflections stay on this device, with no upload. Recent positive feedback can reorder the existing eligible gentle suggestions for the same feeling; it never promotes advanced patterns or establishes causation.
- **My practice** lets you remove routines, delete saved reflections, or export the local JSON. Turning off saved reflections there deletes them. Skipping saving an individual reflection leaves previous saved reflections intact. Data is per browser/device, without cross-device synchronization. Unavailable storage falls back to the current visit.

[Implementation, privacy and verification details](docs/everyday-practice.md).

## Android companion

The [Android preview release](https://github.com/jjgp13/breathing-app/releases/tag/v0.3.0-preview) provides `breathe-android-preview.apk` for trying these features on your phone. It is a debug-signed development preview, separate from a Play Store release. Install it yourself, open **Today’s context**, select record types, and approve Android's Health Connect permissions. Fitbit must separately write the desired records into Health Connect; an empty record is shown as unavailable, never as zero. Actual Fitbit data availability needs verification on your phone.

The app supports Android 9+; Health Connect availability depends on Android/provider support. Android packages do not update themselves from GitHub Pages; install a newer APK for later native releases. It reads only selected sleep, exercise, HRV (RMSSD) and resting-heart-rate records, on demand, up to seven days. Latest values include their timestamps and source. Exercise intervals are clipped to today and merged to avoid double-counting overlaps. Sleep means the latest recorded session's duration, including any awake time in that session; it is not a quality score. No record-based diagnosis or breathing-treatment matching is implemented.

Health context remains in the screen's memory, outside saved reflections and routines. The packaged WebView serves local assets only, has no `INTERNET` permission, and blocks external resources; study links open the external browser. Backup and device-transfer exclusions protect the app's local data. The bridge is restricted to the bundled asset origin. No write, background, historical-access, location or medical-record permissions are requested. **Revoke access & clear this view** revokes this app's Health Connect permissions.

Native speech chooses an available local voice. Selected-day reminders use inexact local alarms, survive reboot/time changes, and require notification permission. Exports use Android's file picker. Both the lesson and sounds are included offline. Sessions stop cues and pause when the Activity leaves the foreground.

Build with Android SDK 36 and JDK 17+:

```powershell
npm ci
npm run build
npm run android:assets
.\android\gradlew.bat -p android assembleDebug testDebugUnitTest lintDebug
```

Set `ANDROID_HOME` or an ignored `android/local.properties` for your SDK. The APK is at `android/app/build/outputs/apk/debug/app-debug.apk`. GitHub Actions also builds an APK artifact. Debug signing identities can differ between your local build and CI; switching identities may require export/uninstall/reinstall. No signing keys are committed. Android unit tests and lint do not replace physical-device checks for permissions, Fitbit availability, speech, haptics, reminders, and battery behavior.

## Edit content

- `locales/en.json` and `locales/es.json` are the canonical user-facing content.
- Run `node scripts/sync-locales.cjs` after changing translations. Commit `js/locales.generated.js` alongside the JSON files so static hosting and local-file use need no translation fetches.
- Run `node scripts/sync-locales.cjs --check` to check language schemas and detect an outdated bundle.
- `js/techniques.js` holds phase timings, animation selection, cycle limits, citations, and evidence review dates. Research descriptions belong in the locale files.

## How it works

`js/app.js` coordinates the four screens. `js/session.js` owns one cancelable clock for preparation, phases, cues, and visuals. It preserves frame overshoot, pauses when hidden or interrupted, rejects stale callbacks, and counts actual practice time. Holds can end immediately with **Breathe now**. A screen wake lock is requested during active practice when supported.

`js/recommendations.js` uses transparent rules based on feeling, time and hold preference. These are wellness suggestions, not a validated clinical matching algorithm. Advanced patterns are never recommended automatically. Check-ins remain in memory unless explicitly included in a saved reflection. `practice-store.js` validates the bounded local store; `everyday.js` owns personal tools. Native health context and manual context are memory-only and do not change technique matching.

`js/breath-guide.js` maps phase progress into words, a countdown, a phase strip, and a technique-specific **2D guide** for every practice. `js/guide-patterns.js` derives each pose from the session state; `js/guide2d.js` draws the nine SVG guides. Phase-specific captions explain the movement, and a small progress bar shows time within the current phase. Reduced motion keeps a still illustration and the text/countdown. Old saved 3D preferences are ignored; timed practice never loads WebGL.

Only diaphragmatic breathing offers an optional **Explore the movement in 3D** lesson in its detail screen. `js/movement-lesson.js` loads the renderer on demand, compares inhale/exhale positions, and switches between front and side views to show the diaphragm dome and abdominal movement. There is no autoplay, breathing timer, or audio in this lesson. Reduced motion and WebGL failures retain a usable 2D comparison. Closing it releases GPU resources and invalidates pending loads. [The visual guide map](docs/visual-guides.md) explains the purpose and limits.

## Sound and music

Open **♫ Sound & music** from the header or practice settings. Choose no background, soft rain, a flowing stream, or original synthesized ambient tones. Background and breathing-cue volumes are independent; the speaker button mutes everything. Background sound is off by default. A 15-second preview is available before practice; closing settings stops the preview. Changing settings during practice applies immediately.

`js/audio.js` owns one Web Audio graph, cached decoded recordings, gentle fades, normalized crossfaded loops, and cancellable cues. Pause, hidden-tab interruptions, stop, and track changes invalidate pending loads so a late download cannot restart audio. Preferences are saved locally. On the website, recordings are downloaded only when selected for playback or saved offline; the app hosts them itself and uses no music-streaming account. Session audio is paused when the page is hidden, so this does not provide background playback with the phone locked.

The rain recording is dedicated to the public domain; the stream is CC0. Creator links and permissions appear in the sound panel and [the asset record](assets/audio/README.md). These permissions apply independently of whether the app is monetized. Ambient tones and softer phase chimes contain no external music samples. Choosing an ambient background is a comfort preference, without an added health-effect claim.

## Blender artwork

The active 3D lesson is an original Blender 5.2 schematic with a domed diaphragm surface, chest references, and an abdominal shape. Editable source: `assets/models/techniques/diaphragm-lesson.blend`. To regenerate:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --python scripts/create-diaphragm-lesson.py
npm run build
```

The earlier bloom and nine-model gallery remain as archived art studies. Their decorative 3D guides are no longer exposed or loaded by the app. The old `create-technique-models.py` generator recreates the gallery; run the diaphragm lesson generator afterward to restore the active lesson export. These visuals do not measure respiration or HRV. Three.js's MIT license is included at `assets/THREE-LICENSE.txt`. The repository's own distribution/contribution license still needs an owner decision.

## Research and next steps

- [Research and product direction](docs/research-and-direction.md): evidence for the existing techniques, additional candidates, Android/Fitbit integration, and animation options.
- [Code review and validation](docs/code-review.md): baseline findings, what changed in this iteration, and remaining engineering work.

The evidence labels are editorial summaries of cited research, not formal clinical grades. Studies of a technique do not establish that this app's particular timing or session length has the same effects.
