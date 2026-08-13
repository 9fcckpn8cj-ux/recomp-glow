# Recomp Glow — publish through GitHub Pages

## Publish once
1. Sign in to GitHub.
2. Create a new **public** repository, for example named `recomp-glow`.
3. Open the repository and select **Add file > Upload files**.
4. Extract this ZIP first, then upload all seven files from the extracted folder:
   - `index.html`
   - `app.js`
   - `manifest.webmanifest`
   - `service-worker.js`
   - `icon-192.png`
   - `icon-512.png`
   - `apple-touch-icon.png`
   Do not upload the ZIP itself.
5. Select **Commit changes**.
6. Open **Settings > Pages**.
7. Under **Build and deployment**, choose **Deploy from a branch**.
8. Select branch **main** and folder **/(root)**, then **Save**.
9. Wait about 1–3 minutes, then refresh — GitHub will show the live HTTPS address.

## If you already published an earlier version
Just re-upload these same seven filenames to the existing repository (**Add file > Upload files**, then commit changes, confirming the overwrite). The service worker cache name changed to `recomp-glow-v3`, so her phone will automatically fetch the corrected files the next time she opens the installed app while online.

## Install on her iPhone
1. Open the GitHub Pages address in **Safari** (not the GitHub app or another preview).
2. Let the page load fully once while online.
3. Tap **Share → Add to Home Screen → Add**.
4. Open **Recomp Glow** from the new Home Screen icon for daily use.

## What changed in this update
- **Fixed unresponsive buttons when switching workouts.** Previously, tapping a workout day (Lower A / Upper / Lower B / Optional) completely rebuilt the Express/Standard/Complete buttons as brand-new elements. On iPhone, replacing a button out from under an in-progress tap can make it feel unresponsive. The picker and mode buttons are now created once and only their appearance (active/inactive) is updated afterward — they're never destroyed and recreated.
- All interactive controls (timer, cycle, macros, check-in, export/restore) now use stable, explicitly-wired event listeners instead of inline handlers, for the same reliability reason.
- Verified: switching workouts and modes in rapid succession, in any order, no longer causes missed taps or a mode/workout reset.
- (Carried over from the previous fix) Forced light theme — the app no longer follows the phone's system dark-mode setting.
- (Carried over from the previous fix) Every text/background color combination re-verified against WCAG AA contrast standards.

## What's inside
- Flexible, non-day-locked workout rotation (Lower A → Upper → Lower B → repeat), plus an optional 4th session
- Automatic 4-phase periodization (Adaptation → Progression → Productive → Recovery), with a same-day "Easy" override during her 3-day period window
- Daily readiness check-in (segmented pill buttons) with a traffic-light training recommendation
- Express / Standard / Complete duration modes that filter exercises by essential/recommended/optional tiers — now fully stable when combined with workout switching
- Exercise variation picker for every movement (Bulgarian split squats, lunges and free-weight squats intentionally excluded)
- Apple Health–style cycle ring and 28-day dot timeline
- Absolute-time rest timer that self-corrects after the phone locks or the app is backgrounded
- Editable nutrition target (starts at ~1,950 kcal / 105g protein / 60g fat / 245g carbs) plus a portion-based guide
- Weekly check-in: weight, waist, hips, steps, sleep, energy, training quality, notes
- **Export backup** and **Restore from backup**
- Offline support after the first successful online load
- Safe-storage fallback for browsers that restrict persistent storage

## Important data note
Workout, cycle and check-in data live on her specific phone/browser installation only — nothing is stored on GitHub. Use **Export backup** periodically, and especially before deleting the Home Screen app, clearing Safari data, or switching phones. Use **Restore from backup** afterward to bring the data back.

## Updating later
Upload replacement files using the same filenames. Bump the cache name in `service-worker.js` (e.g. `recomp-glow-v4`) whenever you push a future update, so her phone refreshes the cached app instead of reusing an older version.
