# Everyday practice tools · October 2026

The website remains free, static, account-free and without analytics or a health backend. The Android companion packages the same UI for offline use and adds device services. Suggestions are transparent wellness choices. Feedback, custom pacing and wearable context do not validate a treatment algorithm.

## Data boundaries

`breathe-personal` stores versioned preferences, up to 30 routines and, only after opt-in, the latest 200 reflections. Validation strips unknown fields and rejects unknown techniques, invalid outcomes, invalid reminders and unbounded numeric values. Reflection fields are technique ID, unpaced flag, selected feeling, actual practice seconds, completion flag, outcome and timestamp. Health records never enter this store. Routine names render as text; calendar fields escape delimiters/newlines and fold UTF-8 lines to the iCalendar limit.

Skipping feedback has no write. An unchecked per-session save option skips that session without deleting past reflections. Turning off saved reflections in **My practice**, or confirming deletion there, clears the saved history. Routines remain independently removable. Export writes JSON locally or through Android's document picker. No import/synchronization or server account is implemented. Browser eviction, another browser profile and uninstalling an Android preview can affect local availability.

`Everyday.health` and manual context exist only in page memory. The Android bridge reads chosen Health Connect categories in the foreground, with the OS permission UI. The seven-day window needs no additional history or background scope. Latest records retain their dates and source packages; missing/unshared states remain distinct. Activity intervals are merged across sources rather than summed twice. Session duration is not sleep quality. Metrics do not change recommendation ranking.

## Comfort and guidance

`PracticeProfile.build` clones the reference phases. A common scale preserves relative timing on gentle protocols; the displayed phase durations and numeric SVG labels reflect that scale. Advanced timing is fixed. Selecting a no-hold alternative opens diaphragmatic practice rather than silently changing the identity of box breathing or another hold-based protocol. Users can still end any hold immediately.

Unpaced practice uses a single session-duration clock, a still generic illustration and no phase targets. The natural breath is never inferred from a microphone, camera or wearable. There is no scored hold, breath-size target or streak penalty.

`Guidance` speaks generic instructions once per phase transition and supports optional vibration. Pause, stop, mute and background transitions cancel cues. Quiet mode also prevents audio oscillators/ambience. Voice/vibration availability depends on the browser/device; web speech may use the platform's default service when a local voice is unavailable, but utterances contain no personal records or routine names. Android explicitly selects a local voice. Dim display, larger text and contrast are independent preferences. Existing system reduced-motion handling is retained.

## Routines and reminders

A saved setup includes reference technique, number of cycles or unpaced minutes, comfort settings and ambient/cue volumes. Opening a routine restores settings and opens its detail view, without autoplay. Recent positive reflections can move one of the already eligible suggestions first for the same feeling. Advanced and incompatible hold choices remain excluded.

Website reminders have two parts: a notice while the page is open, and an explicit calendar download for closed-app reminders. No background web notification is promised. The file contains the user-entered name and schedule; the user chooses whether/where to import it. Calendar support differs by app, and events must be managed in the calendar after import. A routine link works in the browser where the routine is stored; elsewhere it opens the normal app.

Android reminders request notification permission only when requested during a save. Inexact alarms are scheduled for chosen weekdays in local time. Receivers reschedule after reboot and time-zone/clock changes. Revoking notifications stops delivery; reminders are not exact alarms or a guarantee of timing. Removing a routine cancels its scheduled notification.

## Offline delivery

Swiper 12.1.2 and GSAP 3.15.0 are pinned and vendored, with original notices. The build hashes all local scripts/styles, then generates a versioned service worker. Text normalization keeps hashes stable across Windows/Linux checkouts. Installation caches the complete core or fails as a whole. Navigation uses the network with a short timeout, then the cached shell. Requests outside the app scope and non-GET traffic are ignored. Existing caches belonging to another app are untouched.

Recorded sound packs have separate content-versioned caches and download only on request. Synthesized tones need no download. Updates wait for user activation outside a running practice. The optional 3D website lesson can fall back to its 2D comparison offline; the Android package contains the 3D assets too. Native mode skips service-worker registration and contains all core resources and recordings.

## Android boundary

`WebViewAssetLoader` serves `https://appassets.androidplatform.net/assets/site/` from packaged assets. External requests are blocked, external links open the browser, and a CSP prevents remote scripts/frames. The JavaScript bridge accepts bounded, whitelisted messages from this local document. The app has no internet permission and disables cloud backup/device transfer for its local data. It requests no health writes, background reads, location, medical records or broad history scope.

Health Connect uses stable Jetpack 1.1.0, per [Android's release notes](https://developer.android.com/jetpack/androidx/releases/health-connect). The read flow follows [foreground read and pagination guidance](https://developer.android.com/health-and-fitness/health-connect/read-data). App data types and permission requirements are described in [Health Connect data types](https://developer.android.com/health-and-fitness/health-connect/data-types). Fitbit's actual exported records must be checked on a real paired phone; supporting a record type does not establish that the provider supplies it.

## Verification

JavaScript tests exercise consent/retention, schema bounds, blocked storage, candidate restrictions, escaped calendar output, profile cloning, unpaced clock behavior, offline scope/fallback, speech transition deduplication, and existing timing/audio/rendering behavior. Android unit tests cover merging/clipping exercise intervals. Android lint and compilation check the native API paths. Browser checks include saved setup restoration, adapted labels, completion feedback, preference controls, offline caching and a real reload with the local server stopped. Physical Android/Fitbit, speech quality, accessibility technology, reminder delivery and battery behavior still require device checks.
