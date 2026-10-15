# Breathing research and product direction

Reviewed October 14, 2026. Initial scope: understand the existing app, investigate breathing techniques, evaluate Android/Fitbit data access, and consider richer visual guidance. The first implementation focuses on a clear priority: explain the potential benefits and scientific support for each existing technique.

## Research approach

This is a broad, targeted evidence scan, not a new systematic review or clinical validation. Searches covered stress/anxiety, HRV biofeedback, each of the six existing techniques, additional breathing practices, sleep, exercise recovery, respiratory care, and immersive guidance. Sources below are original studies, research reviews, clinical organizations, and official platform documentation. Some assessments rely on published abstracts; full text was examined where accessible. No pooled results were recalculated.

Interpret effects by outcome, population, protocol, and follow-up. A short-term physiological change is different from symptom relief or a lasting health benefit. A clinical training program is different from a timer. The app's evidence labels express these distinctions and are not a formal GRADE assessment. Do not manufacture a positive benefit when the answer is uncertain.

An overall starting point: [Fincham et al., 2023](https://www.nature.com/articles/s41598-022-27247-y) pooled 12 randomized trials with 785 adults for stress, finding a small-to-moderate average reduction (g = -0.35). Many studies had moderate risk of bias. This supports investigating accessible breathing tools, not assigning the same effect to every named technique.

## Existing techniques: justified benefits and limits

| Technique | Reasonable benefit to communicate | Evidence and important boundary |
| --- | --- | --- |
| Box breathing | May help people feel calmer with regular practice; provides a counting structure. | [Balban et al., 2023](https://pubmed.ncbi.nlm.nih.gov/36630953/) compared daily five-minute practices over a month. Its findings do not establish superior performance under pressure or a unique nervous-system effect from the 4-4-4-4 ratio. |
| 4-7-8 | A structured wind-down practice; possible immediate heart-rate changes in healthy adults. | [Vierra et al., 2022](https://pubmed.ncbi.nlm.nih.gov/35822447/) studied 43 young adults and immediate physiological responses. It did not establish an insomnia treatment or a nervous-system reset. |
| Diaphragmatic breathing | Promising support for perceived stress; preliminary attention findings. | [Ma et al., 2017](https://pubmed.ncbi.nlm.nih.gov/28626434/) used 20 training sessions over eight weeks in 40 participants. [Hopper et al., 2019](https://pubmed.ncbi.nlm.nih.gov/31436595/) found only three eligible studies. Neither establishes an immediate cortisol effect from this app's short session. |
| Slow / resonance breathing | Better supported for increasing HRV during practice; a useful foundation for relaxation. | [Shao et al., 2024](https://doi.org/10.1007/s12671-023-02294-2) reviewed 31 studies with 1,133 participants. Short-term cardiovascular results were clearer than emotional and long-term effects. Actual resonance assessment is individualized. |
| Wim Hof-style breathing | Research interest in inflammatory responses; everyday health benefits remain uncertain. | [Almahayni & Hammond, 2024](https://doi.org/10.1371/journal.pone.0286933) reviewed eight trials reported in nine papers. Small samples, bias, and mixed interventions limit confidence. Do not label the app an immunity booster. |
| Buteyko-style breathing | Some breathing-retraining programs may improve quality of life in adults with asthma. | [Santino et al., Cochrane 2020](https://www.cochrane.org/evidence/CD001277_breathing-exercises-asthma) included 22 studies and several methods, not only Buteyko. This is not validation of a fixed 20-second pause or a reason to alter inhalers. |

Two findings help avoid overselling precise ratios. [Marchant et al., 2025](https://pubmed.ncbi.nlm.nih.gov/39864026/) compared square, 4-7-8, and two six-breaths-per-minute patterns in 84 students. Slow breathing increased HRV more; none produced meaningful immediate mood or blood-pressure differences, and mild over-breathing occurred with slow breathing. [Shaffer et al., 2024](https://pubmed.ncbi.nlm.nih.gov/38507210/) found no HRV advantage of a 1:2 versus 1:1 inhale/exhale ratio in two small studies. Comfort should guide choices; a longer exhale is not universally better.

The app previously described 5.5 seconds in plus 5.5 seconds out as if it were an individually optimal setting. That pattern is nominally about 5.45 breaths per minute. [Shaffer & Meehan, 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7578229/) describe adult resonance assessment across roughly 4.5-6.5 breaths per minute using physiological signals. Until those signals are measured and assessed, call this slow paced breathing rather than personalized resonance biofeedback.

## What to investigate next

These are candidates, not newly validated app protocols. Several are variations within the same family; we should avoid presenting every ratio as a separate scientific discovery.

| Candidate | Why consider it | Evidence / decision |
| --- | --- | --- |
| Cyclic sighing | A gentle two-part inhale followed by a long, comfortable exhale could provide another stress practice. | [Balban et al., 2023](https://pubmed.ncbi.nlm.nih.gov/36630953/) found promising mood and respiratory-rate results with five minutes daily. Best next addition to evaluate; do not translate that into a proven one-breath anxiety cure. |
| Comfortable slow breathing, with or without a longer exhale | Lets beginners select a tolerable pace rather than struggle to follow a fixed pattern. | [The 2024 ratio comparison](https://pubmed.ncbi.nlm.nih.gov/38507210/) supports avoiding superiority claims. Treat exact beginner presets as design choices requiring usability testing. |
| Humming / Bhramari | Adds a tactile and auditory cue that some users may enjoy. | [Woo & Kim, 2025](https://pubmed.ncbi.nlm.nih.gov/40482984/) studied 16 healthy adults; humming and slow breathing produced similar HRV/affect findings. Small pilot, not established superiority or broad health protection. |
| Alternate-nostril breathing | Offers a traditional, attention-focused practice. | [A 2021 review](https://pubmed.ncbi.nlm.nih.gov/33461386/) found promising results but limited population diversity. [A 2026 crossover trial](https://pubmed.ncbi.nlm.nih.gov/41765327/) explored immediate autonomic responses. More complex instruction; optional later. |
| Natural breath awareness | An alternative for people who find counting or paced breathing uncomfortable. | Mindfulness was the active comparison in [the 2023 breathing trial](https://pubmed.ncbi.nlm.nih.gov/36630953/). Position as an attention practice, not an interchangeable physiological prescription. |
| Pursed-lip breathing | Could become a separate education track for users already taught this in respiratory care. | The [American Lung Association](https://www.lung.org/lung-health-diseases/wellness/breathing-exercises) teaches it in an asthma/COPD context. Do not route unexplained breathlessness into a generic wellness exercise. |
| Measured HRV biofeedback | A future differentiator with actual beat-interval input and feedback. | [Goessl et al., 2017](https://pubmed.ncbi.nlm.nih.gov/28478782/) found promising stress/anxiety effects across 24 studies. That evidence belongs to measured training, not to a decorative simulated heart waveform. |
| Papworth / clinical retraining | Potential clinician-led educational partnership. | Included among methods in [the Cochrane asthma review](https://www.cochrane.org/evidence/CD001277_breathing-exercises-asthma); keep separate from unsupervised wellness recommendations. |
| Capnometry-assisted respiratory training | A possible long-term clinical collaboration, requiring a CO2 sensor and trained care. | [Meuret et al., 2008](https://pubmed.ncbi.nlm.nih.gov/17681544/) studied 37 people with panic disorder. [Kim et al., 2012](https://pubmed.ncbi.nlm.nih.gov/22901344/) found improvement with opposing CO2 training approaches, cautioning against simplistic mechanisms. Not a consumer timer feature. |
| Ujjayi | A later optional practice for interested users. | [Mason et al., 2013](https://pubmed.ncbi.nlm.nih.gov/23710236/) studied 17 yoga beginners and found no clear advantage over simpler slow breathing. Low implementation priority. |

For sleep, use language such as “wind down” rather than “treat insomnia.” A [20-person presleep pilot](https://pubmed.ncbi.nlm.nih.gov/32366866/) is exploratory. [NCCIH's review of relaxation](https://www.nccih.nih.gov/health/relaxation-techniques-what-you-need-to-know) describes limited sleep evidence and occasional negative experiences. Allow stopping, natural breathing, or eyes-open guidance without penalties.

For exercise, changes in next-day HRV after a breathing session are a hypothesis to investigate, not an established recovery claim. A [2026 randomized trial with 34 participants](https://pubmed.ncbi.nlm.nih.gov/41569822/) found no additional performance or physiological recovery benefit from daily slow breathing alongside sprint interval training. A [2023 American-football study](https://pubmed.ncbi.nlm.nih.gov/38090041/) reported acute autonomic changes after either mindfulness or rest; its mixed intervention and design do not isolate a specific breathing effect. This should motivate careful personal tracking, not a promise to restore next-day HRV.

## Android, Fitbit, and Google Health

Yes: a technically feasible route exists. Android Health Connect and the Google Health cloud API are different interfaces. The current browser-only app implements neither.

| Route | What it offers | Implication |
| --- | --- | --- |
| Android Health Connect | On-device records shared by other apps, with per-type permissions. | Preferred first integration for this Android use case. Requires a native Android layer; a normal web page cannot simply read the health store. See [architecture](https://developer.android.com/health-and-fitness/health-connect/architecture) and [setup](https://developer.android.com/health-and-fitness/health-connect/get-started). |
| Google Health API | Fitbit/Google-device health records through OAuth and REST. | Alternative for direct cloud access. [Vitals documentation](https://developers.google.com/health/data-types/vitals) includes RMSSD HRV and daily resting HR; [data types](https://developers.google.com/health/data-types) also cover sleep and activity. These are synced records, not a guaranteed live beat-interval stream. |
| Manual entry / import | A check-in and optionally user-entered metrics. | Keep the app useful without devices, accounts, platform approval, or a cloud connection. Label imported and manual values clearly. |

Crucially, [Google's current Health Connect sharing table](https://support.google.com/googlehealth/answer/14506680?hl=en) lists HRV, heart rate, resting heart rate, respiratory rate, sleep, and exercise among supported writes. This is promising for Android/Fitbit integration. We still need to verify actual records, units, timestamps, device provenance, and history on real phones; an advertised capability does not prove complete data for every device or account. Health Connect's [HRV record](https://developer.android.com/reference/androidx/health/connect/client/records/HeartRateVariabilityRmssdRecord) is RMSSD.

Google's [partner migration notice](https://support.google.com/googlehealth/answer/14236613?hl=en) identifies October 30, 2026 as the legacy Fitbit API transition deadline. Do not build a new integration on the old Fitbit endpoints. [Current cloud setup instructions](https://developers.google.com/health/setup) describe test users, a 100-user unverified limit, and third-party security review for wider access. Some indexed Google documentation still carries a new-project onboarding restriction that is absent from the opened setup page: confirm actual project access before committing to cloud delivery. No cloud project, credentials, or health-data access were created in this iteration.

For cost and privacy, first evaluate a small native wrapper around the existing web app, such as [Capacitor](https://capacitorjs.com/docs), with a reviewed or custom native Health Connect bridge. Keep recommendation logic on-device. A wrapper does not supply a reliable health integration automatically; native permission handling, plugin maintenance, secure storage, and real-device tests remain necessary. Additional [history/background read permissions](https://developer.android.com/codelabs/health-connect) are separate from metric permissions; start with foreground reads and minimal data.

If iOS is added later, [HealthKit requires native authorization](https://developer.apple.com/documentation/healthkit/authorizing-access-to-health-data). Its standard [HRV quantity is SDNN](https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifier/heartratevariabilitysdnn), not RMSSD. Google's [Apple Health sharing table](https://support.google.com/googlehealth/answer/17037331?hl=en) currently lists HRV as a read, not a write. Do not promise identical Fitbit HRV availability on both platforms or combine unlike HRV metrics into one baseline.

## Recommendation direction

Proposed rules below are product hypotheses, not validated prescriptions:

1. Ask what the person wants: feel calmer, wind down, or practice a comfortable routine. Ask about comfort with holds and available time.
2. Optionally add recent same-source trends in HRV, resting HR, sleep, and exercise. Preserve the original metric type, units, local dates, collection windows, and freshness. Separate nocturnal HRV from in-session measurements.
3. Use a personal baseline, initially around 2-4 weeks of comparable records. This window and any thresholds are engineering starting points, not clinical cutoffs. Missing or stale data must reduce reliance on metrics; never convert missing values into zero or a stress diagnosis.
4. Offer one or two gentle options with a plain-language reason: “You said you feel tense. Try a short, comfortable slow-breathing practice.” Low HRV alone must not diagnose stress or select a special treatment.
5. Let users change, skip, or stop. Do not automatically recommend hyperventilation or prolonged holds from wearable values.
6. Ask how the session felt and record optional pre/post self-ratings. Over time, show personal associations and uncertainty. A better score after a session does not establish causality; natural recovery, sleep, activity, and expectations can explain changes.

The free core should remain useful without a wearable or account: all gentle practices, basic explanations and sources, local history, and accessible guidance. Avoid paid AI calls for basic selection. Hosting, maintenance, native distribution, and any cloud/security review still require a sustainability plan. The repository has no license file; decide distribution and contribution terms explicitly before describing it as licensed open-source software.

## Animation direction

[Three.js](https://threejs.org/manual/pages/installation.html) fits the existing JavaScript app and can add a genuinely three-dimensional breathing orb without requiring a React rewrite. Start with one small scene, driven by the exact same phase state as text and audio. Use expansion for inhale, contraction for exhale, and stillness for a hold. No camera drift, extra inhale-like pulses, or fabricated live physiology.

Retain SVG/CSS as the default fallback, lazy-load optional 3D, cap pixel ratio, dispose scenes, suspend rendering while hidden, and honor [reduced-motion preferences](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion). Audio cues and a minimal text view may help more than extra visual effects for some people.

A [72-person VR respiratory-biofeedback study](https://pubmed.ncbi.nlm.nih.gov/32361963/) supports investigating feedback and breath awareness. It does not establish that an attractive phone-based 3D animation produces better health outcomes than clear 2D guidance. Evaluate comfort, pacing comprehension, completion, battery use, and motion sensitivity before treating 3D as an improvement.

## Development sequence

1. **This iteration:** source-linked benefits, evidence limits, corrected instructions and claims, consistent English/Spanish content. Complete.
2. **Reliable sessions:** fix countdown/restart and pause handling, remove unintended gaps, support ending a hold immediately, and introduce comfortable duration-based sessions. See the code review.
3. **A small useful expansion:** evaluate cyclic sighing, goal selection, optional before/after check-ins, and local session history. Maintain provenance and evidence boundaries for every technique.
4. **Android feasibility:** read a small set of real Health Connect records with the user's permission, compare them with Google Health, and handle missing data before designing any metric-based recommendation.
5. **Richer guidance:** trial one optional 3D visual with an accessible 2D/minimal alternative. Keep the shared session clock independent of the renderer.

Success should mean people can find a comfortable practice, understand why it may help, and report whether it helped them. Avoid optimizing for longest holds, highest apparent HRV, or streak pressure.
