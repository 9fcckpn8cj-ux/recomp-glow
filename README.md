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

## Install on her iPhone
1. Open the GitHub Pages address in **Safari** (not the GitHub app or another preview).
2. Let the page load fully once while online.
3. Tap **Share → Add to Home Screen → Add**.
4. Open **Recomp Glow** from the new Home Screen icon for daily use.

## What's inside
- Flexible, non-day-locked workout rotation (Lower A → Upper → Lower B → repeat), plus an optional 4th session
- Automatic 4-phase periodization (Adaptation → Progression → Productive → Recovery), with a same-day "Easy" override on days 1–3 of her cycle
- Daily readiness check-in (energy, cramps, soreness, sleep, motivation) with a traffic-light training recommendation
- Express / Standard / Complete duration modes that filter exercises by essential/recommended/optional tiers
- Exercise variation picker for every movement (Bulgarian split squats, lunges and free-weight squats intentionally excluded)
- Absolute-time rest timer that self-corrects after the phone locks or the app is backgrounded
- Editable nutrition target (starts at ~1,950 kcal / 105g protein / 60g fat / 245g carbs) plus a portion-based guide
- Weekly check-in: weight, waist, hips, steps, sleep, energy, training quality, notes
- **Export backup** (downloads a JSON file) and **Restore from backup** (re-import on a new phone or after reinstalling)
- Offline support after the first successful online load
- Safe-storage fallback: the app keeps working even if the browser blocks persistent storage (data just won't survive a full reload in that rare case)

## Important data note
Workout, cycle and check-in data live on her specific phone/browser installation only — nothing is stored on GitHub. Use **Export backup** periodically, and especially before deleting the Home Screen app, clearing Safari data, or switching phones. Use **Restore from backup** afterward to bring the data back.

## Updating later
Upload replacement files using the same filenames. The service worker cache is named `recomp-glow-v1` — bump it to `recomp-glow-v2` (etc.) in `service-worker.js` whenever you push an update, so her phone refreshes the cached app instead of reusing the old version.
