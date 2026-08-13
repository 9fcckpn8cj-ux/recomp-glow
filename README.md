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

## If you already published the earlier version
Just re-upload these same seven filenames to the existing repository (**Add file > Upload files**, then commit). Because the service worker cache name changed from `recomp-glow-v1` to `recomp-glow-v2`, her phone will automatically fetch the corrected files instead of reusing the old cached (dark/low-contrast) version the next time she opens the app online.

## Install on her iPhone
1. Open the GitHub Pages address in **Safari** (not the GitHub app or another preview).
2. Let the page load fully once while online.
3. Tap **Share → Add to Home Screen → Add**.
4. Open **Recomp Glow** from the new Home Screen icon for daily use.

## What changed in this update
- **Forced light theme.** The app no longer follows the phone's system dark-mode setting — it always renders the intended light, Apple Fitness–style look. This removes the automatic dark palette that was causing low-contrast (white-on-white-ish) buttons.
- **Corrected color palette.** Every text/background combination in the app (buttons, pills, badges, recommendation banners, secondary text) was checked against WCAG AA contrast standards and adjusted where needed. The core pink was deepened slightly (`#c2185b`) so white button text stays clearly readable.
- **Redesigned Cycle section**, closer to Apple Health's cycle tracking: a circular day-progress ring, a 28-day dot timeline (period days highlighted, today marked), a plain-language headline ("Day 3 of cycle · Period likely in 25 days"), and one primary action button instead of a form.
- **Redesigned daily readiness check-in** as tappable segmented pill buttons (Energy, Cramps, Soreness, Sleep, Motivation) instead of dropdown menus — closer to native iOS controls, and the choice is remembered across visits.

## What's inside
- Flexible, non-day-locked workout rotation (Lower A → Upper → Lower B → repeat), plus an optional 4th session
- Automatic 4-phase periodization (Adaptation → Progression → Productive → Recovery), with a same-day "Easy" override during her 3-day period window
- Daily readiness check-in with a traffic-light training recommendation
- Express / Standard / Complete duration modes that filter exercises by essential/recommended/optional tiers
- Exercise variation picker for every movement (Bulgarian split squats, lunges and free-weight squats intentionally excluded)
- Absolute-time rest timer that self-corrects after the phone locks or the app is backgrounded
- Editable nutrition target (starts at ~1,950 kcal / 105g protein / 60g fat / 245g carbs) plus a portion-based guide
- Weekly check-in: weight, waist, hips, steps, sleep, energy, training quality, notes
- **Export backup** and **Restore from backup**
- Offline support after the first successful online load
- Safe-storage fallback for browsers that restrict persistent storage

## Important data note
Workout, cycle and check-in data live on her specific phone/browser installation only — nothing is stored on GitHub. Use **Export backup** periodically, and especially before deleting the Home Screen app, clearing Safari data, or switching phones. Use **Restore from backup** afterward to bring the data back.

## Updating later
Upload replacement files using the same filenames. Bump the cache name in `service-worker.js` (e.g. `recomp-glow-v3`) whenever you push a future update, so her phone refreshes the cached app instead of reusing an older version.
