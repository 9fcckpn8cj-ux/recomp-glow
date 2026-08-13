/* =========================================================
   Recomp Glow — app.js
   Flexible, cycle-aware training companion
   ========================================================= */

/* ---------- Global error safety net ---------- */
window.addEventListener('error', function () {
  try {
    var b = document.getElementById('errBanner');
    if (b) { b.style.display = 'block'; b.textContent = 'A small display glitch occurred, but your saved data is safe. Try reloading the page.'; }
  } catch (e) {}
});

/* ---------- Safe storage layer (works even if localStorage is blocked) ---------- */
var memoryStore = {};
var storageOK = true;
try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); } catch (e) { storageOK = false; }
var store = {
  get: function (k) {
    try { return storageOK ? localStorage.getItem(k) : (Object.prototype.hasOwnProperty.call(memoryStore, k) ? memoryStore[k] : null); }
    catch (e) { return Object.prototype.hasOwnProperty.call(memoryStore, k) ? memoryStore[k] : null; }
  },
  set: function (k, v) {
    try { if (storageOK) { localStorage.setItem(k, v); return; } } catch (e) {}
    memoryStore[k] = v;
  },
  remove: function (k) {
    try { if (storageOK) { localStorage.removeItem(k); return; } } catch (e) {}
    delete memoryStore[k];
  },
  clear: function () {
    try { if (storageOK) localStorage.clear(); } catch (e) {}
    memoryStore = {};
  },
  allKeys: function () {
    var keys = [];
    try { if (storageOK) { for (var i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i)); } } catch (e) {}
    for (var mk in memoryStore) if (keys.indexOf(mk) === -1) keys.push(mk);
    return keys;
  }
};

/* ---------- Workout data model ---------- */
var WORKOUTS = {
  "Lower A": {
    hint: "Glutes & hamstrings",
    exercises: [
      { name: "Hip thrust", tier: "essential", type: "main",
        alts: ["Hip thrust", "Smith-machine hip thrust", "Barbell hip thrust", "Glute-drive machine", "Hip-thrust machine", "Glute bridge"] },
      { name: "Romanian deadlift", tier: "essential", type: "main",
        alts: ["Romanian deadlift (dumbbell)", "Romanian deadlift (barbell)", "Smith-machine RDL", "Cable pull-through", "45° glute-focused back extension"] },
      { name: "Leg press (glute-biased, high foot)", tier: "essential", type: "lower",
        alts: ["Leg press (high foot)", "Hack squat (glute-biased)", "Belt squat", "Pendulum squat"] },
      { name: "Seated leg curl", tier: "recommended", type: "secondary",
        alts: ["Seated leg curl", "Lying leg curl", "Standing leg curl"] },
      { name: "Cable glute kickback", tier: "recommended", type: "isolation3",
        alts: ["Cable glute kickback", "Glute kickback machine", "Banded kickback"] },
      { name: "Hip-abduction machine", tier: "recommended", type: "isolation3",
        alts: ["Hip-abduction machine", "Cable hip abduction", "Banded lateral walk"] },
      { name: "Cable crunch", tier: "optional", type: "abs",
        alts: ["Cable crunch", "Reverse crunch", "Supported knee raise", "Dead bug", "Plank"] }
    ]
  },
  "Upper": {
    hint: "Back, chest, shoulders, posture, arms",
    exercises: [
      { name: "Neutral-grip lat pulldown", tier: "essential", type: "main",
        alts: ["Neutral-grip lat pulldown", "Wide-grip pulldown", "Assisted pull-up", "Single-arm cable pulldown", "Pullover machine"] },
      { name: "Chest-supported row", tier: "essential", type: "main",
        alts: ["Chest-supported row", "Seated cable row", "Iso-lateral row machine", "Chest-supported dumbbell row"] },
      { name: "Machine chest press", tier: "essential", type: "secondary",
        alts: ["Machine chest press", "Incline machine press", "Smith-machine bench press", "Dumbbell press", "Cable press"] },
      { name: "Seated cable row (posture emphasis)", tier: "recommended", type: "secondary",
        alts: ["Seated cable row (wide grip)", "Chest-supported row (different grip)", "Iso-lateral row"] },
      { name: "Machine or cable lateral raise", tier: "recommended", type: "isolation3",
        alts: ["Cable lateral raise", "Machine lateral raise", "Dumbbell lateral raise"] },
      { name: "Reverse pec-deck", tier: "recommended", type: "rear",
        alts: ["Reverse pec-deck", "Face pull", "Band pull-apart"] },
      { name: "Cable biceps curl", tier: "optional", type: "isolation2",
        alts: ["Cable biceps curl", "Machine preacher curl", "Dumbbell curl"] },
      { name: "Triceps pressdown", tier: "optional", type: "isolation2",
        alts: ["Triceps pressdown", "Overhead cable extension", "Assisted dip machine"] },
      { name: "Stability abdominal exercise", tier: "optional", type: "abs",
        alts: ["Dead bug", "Plank", "Pallof press"] }
    ]
  },
  "Lower B": {
    hint: "Glutes & quadriceps",
    exercises: [
      { name: "Smith-machine squat", tier: "essential", type: "lower",
        alts: ["Smith-machine squat", "Leg press", "Hack squat", "Belt squat", "Pendulum squat"] },
      { name: "Hip thrust (variation)", tier: "essential", type: "main",
        alts: ["Glute-drive machine", "Hip-thrust machine", "Barbell hip thrust", "Smith-machine hip thrust"] },
      { name: "Leg press (quad-biased)", tier: "essential", type: "lower",
        alts: ["Leg press (low foot)", "Hack squat", "Pendulum squat"] },
      { name: "Leg extension", tier: "recommended", type: "isolation3",
        alts: ["Leg extension"] },
      { name: "Lying leg curl", tier: "recommended", type: "secondary",
        alts: ["Lying leg curl", "Seated leg curl", "Standing leg curl"] },
      { name: "Hip-abduction machine", tier: "recommended", type: "isolation3",
        alts: ["Hip-abduction machine", "Cable hip abduction", "Banded lateral walk"] },
      { name: "Reverse crunch or supported leg raise", tier: "optional", type: "abs",
        alts: ["Reverse crunch", "Supported leg raise", "Cable crunch"] }
    ]
  },
  "Optional": {
    hint: "Upper accessories, glutes & abs",
    exercises: [
      { name: "Lat pulldown (variation)", tier: "recommended", type: "secondary",
        alts: ["Wide-grip pulldown", "Neutral-grip pulldown", "Assisted pull-up"] },
      { name: "Incline machine chest press", tier: "recommended", type: "secondary",
        alts: ["Incline machine press", "Machine chest press", "Cable press"] },
      { name: "Cable or machine row", tier: "recommended", type: "secondary",
        alts: ["Seated cable row", "Chest-supported row", "Iso-lateral row"] },
      { name: "Machine or cable lateral raise", tier: "recommended", type: "isolation3",
        alts: ["Cable lateral raise", "Machine lateral raise"] },
      { name: "Face pull or reverse pec-deck", tier: "recommended", type: "rear",
        alts: ["Face pull", "Reverse pec-deck", "Band pull-apart"] },
      { name: "Cable glute kickback", tier: "optional", type: "isolation3",
        alts: ["Cable glute kickback", "Glute kickback machine"] },
      { name: "Hip-abduction machine", tier: "optional", type: "isolation3",
        alts: ["Hip-abduction machine", "Cable hip abduction"] },
      { name: "Biceps curl", tier: "optional", type: "isolation2",
        alts: ["Cable biceps curl", "Machine preacher curl"] },
      { name: "Triceps pressdown", tier: "optional", type: "isolation2",
        alts: ["Triceps pressdown", "Overhead cable extension"] },
      { name: "Short ab circuit", tier: "optional", type: "abs",
        alts: ["Plank", "Dead bug", "Reverse crunch"] }
    ]
  }
};

var REQUIRED_ORDER = ["Lower A", "Upper", "Lower B"];
var ALL_WORKOUT_NAMES = REQUIRED_ORDER.concat(["Optional"]);
var PHASES = [
  { name: "Adaptation", tag: "Easy", sets: { main: 2, secondary: 2, lower: 2, isolation3: 2, isolation2: 2, rear: 2, abs: 2 }, reps: "10–15", rir: "3–4" },
  { name: "Progression", tag: "Building", sets: { main: 3, secondary: 3, lower: 3, isolation3: 3, isolation2: 2, rear: 3, abs: 3 }, reps: "8–12", rir: "2–3" },
  { name: "Productive", tag: "Heavy", sets: { main: 3, secondary: 3, lower: 3, isolation3: 3, isolation2: 2, rear: 3, abs: 3 }, reps: "6–10 main / 10–15 isolation", rir: "1–2" },
  { name: "Recovery", tag: "Easy", sets: { main: 2, secondary: 2, lower: 2, isolation3: 2, isolation2: 2, rear: 2, abs: 2 }, reps: "10–15, ~10–15% lighter", rir: "3–4" }
];

var DURATION_MODES = ["Express", "Standard", "Complete"];
function tiersAllowedForMode(mode) {
  if (mode === "Express") return ["essential"];
  if (mode === "Standard") return ["essential", "recommended"];
  return ["essential", "recommended", "optional"];
}

var CYCLE_LENGTH = 28;
var PERIOD_DURATION = 3;

/* ---------- State ---------- */
var state = {
  requiredIndex: parseInt(store.get('requiredIndex') || '0', 10),
  rotationCount: parseInt(store.get('rotationCount') || '0', 10),
  selectedWorkout: store.get('selectedWorkout') || REQUIRED_ORDER[0],
  mode: store.get('mode') || 'Standard'
};

function currentPhase() {
  var idx = state.rotationCount % PHASES.length;
  return PHASES[idx];
}

/* ---------- Cycle tracking ---------- */
function getCycleLog() {
  try { return JSON.parse(store.get('cycleLog') || '[]'); } catch (e) { return []; }
}
function daysBetween(a, b) { return Math.round((b - a) / 86400000); }
function isMenstruatingToday() {
  var log = getCycleLog();
  if (!log.length) return false;
  var last = new Date(log[log.length - 1].date + 'T00:00:00');
  var today = new Date(new Date().toDateString());
  var d = daysBetween(last, today);
  return d >= 0 && d < PERIOD_DURATION;
}
function currentCycleDay() {
  var log = getCycleLog();
  if (!log.length) return null;
  var last = new Date(log[log.length - 1].date + 'T00:00:00');
  var today = new Date(new Date().toDateString());
  return daysBetween(last, today) + 1;
}
function nextPredictedPeriod() {
  var log = getCycleLog();
  if (!log.length) return null;
  var last = new Date(log[log.length - 1].date + 'T00:00:00');
  return new Date(last.getTime() + CYCLE_LENGTH * 86400000);
}
function startPeriod() {
  var log = getCycleLog();
  var today = new Date().toISOString().slice(0, 10);
  if (log.length && log[log.length - 1].date === today) {
    var s = document.getElementById('saveStatus'); if (s) s.textContent = 'Period already logged for today.';
  } else {
    log.push({ date: today });
    store.set('cycleLog', JSON.stringify(log));
  }
  renderCycle();
  renderHeader();
  renderWorkout();
  renderRecommendation();
}
function openCycleHistory() {
  var log = getCycleLog();
  var el = document.getElementById('history');
  if (!el) return;
  if (!log.length) { el.innerHTML = '<p style="color:var(--sub);font-size:.85rem">No cycle entries yet.</p>'; }
  else {
    var rows = log.slice(-6).reverse().map(function (e) {
      return '<div class="exercise"><b>' + e.date + '</b><div class="ex-note">Logged period start</div></div>';
    }).join('');
    el.innerHTML = '<h3 style="margin-top:18px">Recent cycle entries</h3>' + rows;
  }
  try { window.location.hash = '#progress'; } catch (e) {}
}

/* Render the Apple-Health-style ring + dot timeline */
function renderCycle() {
  var headline = document.getElementById('cycleHeadline');
  var sub = document.getElementById('cycleSub');
  var dayNum = document.getElementById('cycleDayNum');
  var dayLabel = document.getElementById('cycleDayLabel');
  var ringFg = document.getElementById('cycleRingFg');
  var dotsWrap = document.getElementById('cycleDots');
  if (!headline || !sub || !dayNum || !ringFg) return;

  var day = currentCycleDay();
  var circumference = 2 * Math.PI * 44; // r=44

  if (day === null) {
    dayNum.textContent = '—';
    if (dayLabel) dayLabel.textContent = 'Day';
    headline.textContent = 'No entries yet';
    sub.textContent = 'Log your period start to begin tracking.';
    ringFg.setAttribute('stroke-dasharray', String(circumference));
    ringFg.setAttribute('stroke-dashoffset', String(circumference));
    if (dotsWrap) dotsWrap.innerHTML = '';
    return;
  }

  var clampedDay = ((day - 1) % CYCLE_LENGTH) + 1;
  var menstruating = isMenstruatingToday();
  var progress = clampedDay / CYCLE_LENGTH;
  var offset = circumference * (1 - progress);

  dayNum.textContent = String(clampedDay);
  if (dayLabel) dayLabel.textContent = 'of ' + CYCLE_LENGTH;
  ringFg.setAttribute('stroke-dasharray', String(circumference));
  ringFg.setAttribute('stroke-dashoffset', String(offset));

  headline.textContent = menstruating ? 'Menstruation · Day ' + clampedDay : 'Day ' + clampedDay + ' of cycle';
  var next = nextPredictedPeriod();
  var daysUntil = next ? daysBetween(new Date(new Date().toDateString()), next) : null;
  if (menstruating) {
    sub.textContent = 'Easy training recommended today.';
  } else if (daysUntil !== null && daysUntil >= 0) {
    sub.textContent = daysUntil === 0 ? 'Period likely today.' : ('Period likely in ' + daysUntil + ' day' + (daysUntil === 1 ? '' : 's') + '.');
  } else {
    sub.textContent = 'Tracking in progress.';
  }

  if (dotsWrap) {
    var html = '';
    for (var i = 1; i <= CYCLE_LENGTH; i++) {
      var isPeriod = i <= PERIOD_DURATION;
      var isToday = i === clampedDay;
      html += '<div class="cycle-dot' + (isPeriod ? ' period' : '') + (isToday ? ' today' : '') + '"></div>';
    }
    dotsWrap.innerHTML = html;
  }
}

/* ---------- Readiness engine (segmented controls) ---------- */
function initSegmentedControls() {
  var groups = document.querySelectorAll('.segmented');
  groups.forEach(function (group) {
    var buttons = group.querySelectorAll('.seg-btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        group.setAttribute('data-value', btn.getAttribute('data-val'));
        persistReadinessFromDOM();
        renderRecommendation();
      });
    });
  });
}
function readSegmentedValue(fieldName) {
  var group = document.querySelector('.segmented[data-field="' + fieldName + '"]');
  return group ? group.getAttribute('data-value') : null;
}
function setSegmentedValue(fieldName, value) {
  var group = document.querySelector('.segmented[data-field="' + fieldName + '"]');
  if (!group) return;
  group.setAttribute('data-value', value);
  var buttons = group.querySelectorAll('.seg-btn');
  buttons.forEach(function (b) {
    if (b.getAttribute('data-val') === String(value)) b.classList.add('active');
    else b.classList.remove('active');
  });
}
function persistReadinessFromDOM() {
  var r = {
    date: new Date().toISOString().slice(0, 10),
    energy: readSegmentedValue('rEnergy'),
    cramps: readSegmentedValue('rCramps'),
    soreness: readSegmentedValue('rSoreness'),
    sleep: readSegmentedValue('rSleep'),
    motivation: readSegmentedValue('rMotivation')
  };
  store.set('readinessToday', JSON.stringify(r));
  return r;
}
function getReadiness() {
  try { return JSON.parse(store.get('readinessToday') || '{}'); } catch (e) { return {}; }
}
function restoreReadinessToDOM() {
  var r = getReadiness();
  if (!r || !r.date) return;
  if (r.energy) setSegmentedValue('rEnergy', r.energy);
  if (r.cramps) setSegmentedValue('rCramps', r.cramps);
  if (r.soreness) setSegmentedValue('rSoreness', r.soreness);
  if (r.sleep) setSegmentedValue('rSleep', r.sleep);
  if (r.motivation) setSegmentedValue('rMotivation', r.motivation);
}
function computeRecommendation() {
  var r = getReadiness();
  var menstruating = isMenstruatingToday();
  var score = 0;
  var energy = parseInt(r.energy || '4', 10);
  var soreness = parseInt(r.soreness || '2', 10);
  var motivation = parseInt(r.motivation || '4', 10);
  var cramps = r.cramps || 'none';

  if (menstruating) score += 2;
  if (cramps === 'moderate') score += 2;
  if (cramps === 'severe') score += 3;
  if (energy <= 2) score += 2;
  if (soreness >= 4) score += 1;
  if (motivation <= 2) score += 1;

  if (score >= 4) return { level: 'rose', label: 'Take it easy', text: 'Consider Express mode, lighter loads, or a walk/mobility day instead.' };
  if (score >= 2) return { level: 'amber', label: 'Moderate', text: 'Standard mode with one fewer set is a good balance today.' };
  return { level: 'green', label: 'Good to go', text: 'Train as planned for the current phase.' };
}
function renderRecommendation() {
  var out = document.getElementById('recommendOut');
  if (!out) return;
  var rec = computeRecommendation();
  out.innerHTML = '<div class="recommend-pill ' + rec.level + '"><span class="dot"></span>' + rec.label + ' — ' + rec.text + '</div>';
}

/* =========================================================
   Stable picker rendering
   These controls are built ONCE and then only updated
   (class/text changes) on every subsequent render. This
   avoids destroying and recreating button elements every
   time the user taps something — which on iOS Safari can
   make a button feel unresponsive if it gets replaced out
   from under an in-progress tap.
   ========================================================= */
var workoutChipEls = {};   // name -> button element
var modeTabEls = {};       // mode -> button element

function buildWorkoutPickerOnce() {
  var wrap = document.getElementById('workoutPicker');
  if (!wrap || wrap.dataset.built === '1') return;
  ALL_WORKOUT_NAMES.forEach(function (name) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'wk-chip';
    b.textContent = name;
    b.addEventListener('click', function () {
      state.selectedWorkout = name;
      store.set('selectedWorkout', name);
      updateWorkoutPickerUI();
      renderHeader();
      renderWorkout();
    });
    wrap.appendChild(b);
    workoutChipEls[name] = b;
  });
  wrap.dataset.built = '1';
}
function updateWorkoutPickerUI() {
  ALL_WORKOUT_NAMES.forEach(function (name) {
    var b = workoutChipEls[name];
    if (!b) return;
    var isNextRequired = (name === REQUIRED_ORDER[state.requiredIndex]);
    b.textContent = name + (isNextRequired ? ' •' : '');
    if (name === state.selectedWorkout) b.classList.add('active'); else b.classList.remove('active');
  });
}

function buildModeTabsOnce() {
  var wrap = document.getElementById('modeTabs');
  if (!wrap || wrap.dataset.built === '1') return;
  DURATION_MODES.forEach(function (m) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'mode-tab';
    b.textContent = m;
    b.addEventListener('click', function () {
      state.mode = m;
      store.set('mode', m);
      updateModeTabsUI();
      renderWorkout();
    });
    wrap.appendChild(b);
    modeTabEls[m] = b;
  });
  wrap.dataset.built = '1';
}
function updateModeTabsUI() {
  DURATION_MODES.forEach(function (m) {
    var b = modeTabEls[m];
    if (!b) return;
    if (m === state.mode) b.classList.add('active'); else b.classList.remove('active');
  });
}

function renderHeader() {
  var phase = currentPhase();
  var menstruating = isMenstruatingToday();
  var label = document.getElementById('phaseLabel');
  var name = document.getElementById('nextWorkoutName');
  var hint = document.getElementById('nextWorkoutHint');
  var nextRequired = REQUIRED_ORDER[state.requiredIndex];
  if (label) label.textContent = menstruating ? 'Easy (Cycle)' : ('Phase ' + ((state.rotationCount % PHASES.length) + 1) + ' · ' + phase.name);
  if (name) name.textContent = state.selectedWorkout;
  if (hint) hint.textContent = WORKOUTS[state.selectedWorkout].hint + (state.selectedWorkout === nextRequired ? ' · next required' : '');
}

/* ---------- Prescription ---------- */
function prescriptionFor(type) {
  var phase = currentPhase();
  var menstruating = isMenstruatingToday();
  var effective = menstruating ? PHASES[0] : phase; // easy override
  var sets = effective.sets[type] != null ? effective.sets[type] : 2;
  return sets + ' × ' + effective.reps + ' · RIR ' + effective.rir;
}

/* ---------- Exercise store keys ---------- */
function exKey(workout, idx, suffix) { return 'ex-' + workout + '-' + idx + '-' + suffix; }

function renderWorkout() {
  var panel = document.getElementById('workoutPanel');
  if (!panel) return;
  var workoutName = state.selectedWorkout;
  var data = WORKOUTS[workoutName];
  var allowedTiers = tiersAllowedForMode(state.mode);
  var visible = data.exercises.filter(function (e) { return allowedTiers.indexOf(e.tier) !== -1; });

  var doneCount = visible.filter(function (e) {
    var realIdx = data.exercises.indexOf(e);
    return store.get(exKey(workoutName, realIdx, 'done')) === '1';
  }).length;
  var pct = visible.length ? Math.round((doneCount / visible.length) * 100) : 0;
  var ring = document.getElementById('ringToday');
  var ringPct = document.getElementById('ringPct');
  if (ring) ring.style.background = 'conic-gradient(var(--pink) ' + (pct * 3.6) + 'deg, #f3e3e9 0)';
  if (ringPct) ringPct.textContent = pct + '%';

  var html = '';
  visible.forEach(function (e) {
    var idx = data.exercises.indexOf(e);
    var done = store.get(exKey(workoutName, idx, 'done')) === '1';
    var load = store.get(exKey(workoutName, idx, 'load')) || '';
    var reps = store.get(exKey(workoutName, idx, 'reps')) || '';
    var rir = store.get(exKey(workoutName, idx, 'rir')) || '';
    var chosenAlt = store.get(exKey(workoutName, idx, 'alt'));
    var altIndex = chosenAlt ? e.alts.indexOf(chosenAlt) : 0;
    if (altIndex < 0) altIndex = 0;
    var altOptions = e.alts.map(function (a, ai) {
      return '<option value="' + ai + '"' + (ai === altIndex ? ' selected' : '') + '>' + a + '</option>';
    }).join('');
    html += '<div class="exercise">' +
      '<div class="ex-top">' +
        '<input aria-label="Complete ' + e.name + '" class="check" type="checkbox" ' + (done ? 'checked' : '') + ' onchange="saveExercise(\'' + workoutName + '\',' + idx + ',\'done\',this.checked?\'1\':\'0\')">' +
        '<div><div class="ex-name">' + e.name + '</div><span class="badge ' + e.tier + '">' + e.tier + '</span></div>' +
        '<div class="prescription">' + prescriptionFor(e.type) + '</div>' +
      '</div>' +
      '<div class="alt-row"><label style="font-size:.75rem;color:var(--sub)">Variation:</label><select onchange="saveExercise(\'' + workoutName + '\',' + idx + ',\'alt\',this.options[this.selectedIndex].text)">' + altOptions + '</select></div>' +
      '<div class="log-row">' +
        '<label>Load<input inputmode="decimal" placeholder="kg" value="' + load + '" oninput="saveExercise(\'' + workoutName + '\',' + idx + ',\'load\',this.value)"></label>' +
        '<label>Reps<input inputmode="numeric" placeholder="e.g. 10/9/8" value="' + reps + '" oninput="saveExercise(\'' + workoutName + '\',' + idx + ',\'reps\',this.value)"></label>' +
        '<label>RIR<input inputmode="numeric" placeholder="RIR" value="' + rir + '" oninput="saveExercise(\'' + workoutName + '\',' + idx + ',\'rir\',this.value)"></label>' +
      '</div>' +
    '</div>';
  });
  html += '<div class="actions"><button type="button" class="primary" id="btnCompleteWorkout">Complete workout</button><button type="button" class="secondary" id="btnClearChecks">Clear checks</button></div>';
  panel.innerHTML = html;

  var completeBtn = document.getElementById('btnCompleteWorkout');
  var clearBtn = document.getElementById('btnClearChecks');
  if (completeBtn) completeBtn.addEventListener('click', completeWorkout);
  if (clearBtn) clearBtn.addEventListener('click', uncheckWorkout);
}

function saveExercise(workout, idx, key, value) {
  store.set(exKey(workout, idx, key), value);
  if (key === 'done') renderWorkout();
}

function visibleIndices(workoutName) {
  var data = WORKOUTS[workoutName];
  var allowedTiers = tiersAllowedForMode(state.mode);
  var indices = [];
  data.exercises.forEach(function (e, i) { if (allowedTiers.indexOf(e.tier) !== -1) indices.push(i); });
  return indices;
}

function completeWorkout() {
  var workoutName = state.selectedWorkout;
  visibleIndices(workoutName).forEach(function (i) { store.set(exKey(workoutName, i, 'done'), '1'); });

  if (REQUIRED_ORDER.indexOf(workoutName) !== -1 && workoutName === REQUIRED_ORDER[state.requiredIndex]) {
    state.requiredIndex = (state.requiredIndex + 1) % REQUIRED_ORDER.length;
    store.set('requiredIndex', String(state.requiredIndex));
    if (state.requiredIndex === 0) {
      state.rotationCount = state.rotationCount + 1;
      store.set('rotationCount', String(state.rotationCount));
    }
    state.selectedWorkout = REQUIRED_ORDER[state.requiredIndex];
    store.set('selectedWorkout', state.selectedWorkout);
  }
  var s = document.getElementById('saveStatus'); if (s) s.textContent = 'Workout completed and stored on this device.';
  updateWorkoutPickerUI();
  renderHeader();
  renderWorkout();
}
function uncheckWorkout() {
  var workoutName = state.selectedWorkout;
  visibleIndices(workoutName).forEach(function (i) { store.remove(exKey(workoutName, i, 'done')); });
  renderWorkout();
}

/* ---------- Rest timer (absolute end-time based, resilient to backgrounding) ---------- */
var timerSeconds = 90, timerLeft = 90, timerId = null, timerEnd = 0;
function formatTime(s) { return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.max(0, s % 60)).padStart(2, '0'); }
function setTimer(s) {
  clearInterval(timerId); timerId = null; timerSeconds = s; timerLeft = s; timerEnd = 0;
  var b = document.getElementById('timerToggle'); if (b) b.textContent = 'Start';
  updateTimer();
}
function updateTimer() { var d = document.getElementById('timerDisplay'); if (d) d.textContent = formatTime(timerLeft); }
function timerTick() {
  timerLeft = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
  updateTimer();
  if (timerLeft <= 0) {
    clearInterval(timerId); timerId = null; timerEnd = 0;
    var b = document.getElementById('timerToggle'); if (b) b.textContent = 'Restart';
    try { if (navigator.vibrate) navigator.vibrate([150, 100, 150]); } catch (e) {}
  }
}
function toggleTimer() {
  var b = document.getElementById('timerToggle');
  if (timerId) {
    clearInterval(timerId); timerId = null;
    timerLeft = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
    timerEnd = 0;
    if (b) b.textContent = 'Resume';
    updateTimer();
  } else {
    if (timerLeft <= 0) timerLeft = timerSeconds;
    timerEnd = Date.now() + timerLeft * 1000;
    timerId = setInterval(timerTick, 250);
    if (b) b.textContent = 'Pause';
    timerTick();
  }
}
function resetTimer() { setTimer(timerSeconds); }
document.addEventListener('visibilitychange', function () { if (!document.hidden && timerId) timerTick(); });

/* ---------- Macro targets ---------- */
function loadMacros() {
  try { return JSON.parse(store.get('macros') || '{}'); } catch (e) { return {}; }
}
function renderMacros() {
  var m = loadMacros();
  var cal = m.cal || 1950, pro = m.pro || 105, fat = m.fat || 60, carb = m.carb || 245;
  var elC = document.getElementById('mCal'), elP = document.getElementById('mPro'), elF = document.getElementById('mFat'), elCb = document.getElementById('mCarb');
  if (elC) elC.textContent = cal;
  if (elP) elP.textContent = pro + 'g';
  if (elF) elF.textContent = fat + 'g';
  if (elCb) elCb.textContent = carb + 'g';
  var eCal = document.getElementById('eCal'), ePro = document.getElementById('ePro'), eFat = document.getElementById('eFat'), eCarb = document.getElementById('eCarb');
  if (eCal) eCal.value = cal; if (ePro) ePro.value = pro; if (eFat) eFat.value = fat; if (eCarb) eCarb.value = carb;
}
function toggleMacroEdit() {
  var el = document.getElementById('macroEdit');
  if (el) el.style.display = (el.style.display === 'none' || !el.style.display) ? 'block' : 'none';
}
function saveMacros() {
  var m = {
    cal: document.getElementById('eCal').value,
    pro: document.getElementById('ePro').value,
    fat: document.getElementById('eFat').value,
    carb: document.getElementById('eCarb').value
  };
  store.set('macros', JSON.stringify(m));
  renderMacros();
  var s = document.getElementById('saveStatus'); if (s) s.textContent = 'Nutrition targets updated.';
}

/* ---------- Weekly check-in ---------- */
function saveCheckin() {
  var arr;
  try { arr = JSON.parse(store.get('checkins') || '[]'); } catch (e) { arr = []; }
  arr.push({
    date: val('pDate'), weight: val('pWeight'), waist: val('pWaist'), hips: val('pHips'),
    steps: val('pSteps'), sleep: val('pSleep'), energy: val('pEnergy'), training: val('pTraining'), notes: val('pNotes')
  });
  store.set('checkins', JSON.stringify(arr));
  var s = document.getElementById('saveStatus'); if (s) s.textContent = 'Check-in saved locally.';
  renderHistory();
}
function val(id) { var el = document.getElementById(id); return el ? el.value : ''; }
function renderHistory() {
  var arr; try { arr = JSON.parse(store.get('checkins') || '[]'); } catch (e) { arr = []; }
  var el = document.getElementById('history');
  if (!el) return;
  if (!arr.length) { el.innerHTML = ''; return; }
  el.innerHTML = '<h3 style="margin-top:18px">Recent check-ins</h3>' + arr.slice(-5).reverse().map(function (x) {
    return '<div class="exercise"><b>' + (x.date || 'Undated') + ' · ' + (x.weight || '–') + ' kg</b>' +
      '<div class="ex-note">Waist ' + (x.waist || '–') + ' cm · Hips ' + (x.hips || '–') + ' cm · Steps ' + (x.steps || '–') +
      ' · Sleep ' + (x.sleep || '–') + ' h · Energy ' + x.energy + '/5 · Training ' + x.training + '/5' +
      (x.notes ? '<br>' + x.notes : '') + '</div></div>';
  }).join('');
}

/* ---------- Export / Restore ---------- */
function collectAllStoredData() {
  var all = {};
  store.allKeys().forEach(function (k) { all[k] = store.get(k); });
  return all;
}
function exportData() {
  var data = { exported: new Date().toISOString(), app: 'Recomp Glow', storage: collectAllStoredData() };
  var text = JSON.stringify(data, null, 2);
  var done = false;
  try {
    var blob = new Blob([text], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'recomp-glow-backup.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { try { URL.revokeObjectURL(url); } catch (e) {} }, 1000);
    done = true;
  } catch (e) {}
  if (!done) {
    try { var w = window.open('', '_blank'); if (w) { w.document.write('<pre style="white-space:pre-wrap;word-break:break-word;font-family:monospace;padding:16px;">' + text.replace(/</g, '&lt;') + '</pre>'); done = true; } } catch (e) {}
  }
  if (!done) { try { prompt('Copy your saved data below:', text); done = true; } catch (e) {} }
  var s = document.getElementById('saveStatus');
  if (s) s.textContent = done ? 'Backup exported.' : 'Export is not available in this viewer. Try opening the file directly in Safari.';
}
function restoreData(file) {
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function () {
    try {
      var data = JSON.parse(reader.result);
      var storage = data.storage || data;
      Object.keys(storage).forEach(function (k) { store.set(k, storage[k]); });
      var s = document.getElementById('saveStatus'); if (s) s.textContent = 'Backup restored. Reloading…';
      setTimeout(function () { location.reload(); }, 900);
    } catch (e) {
      var s2 = document.getElementById('saveStatus'); if (s2) s2.textContent = 'That file could not be read as a valid backup.';
    }
  };
  reader.readAsText(file);
}
function clearData() {
  var ok = true;
  try { ok = confirm('Delete all workout logs, cycle entries and check-ins stored in this browser?'); } catch (e) { ok = true; }
  if (ok) {
    store.clear();
    state.requiredIndex = 0; state.rotationCount = 0; state.selectedWorkout = REQUIRED_ORDER[0]; state.mode = 'Standard';
    try { updateWorkoutPickerUI(); updateModeTabsUI(); renderAll(); } catch (e) {}
    try { renderHistory(); } catch (e) {}
    var s = document.getElementById('saveStatus'); if (s) s.textContent = 'All local data was cleared.';
  }
}

/* ---------- Wire up static (non-regenerated) buttons once ---------- */
function wireStaticControls() {
  var byId = document.getElementById.bind(document);

  var startBtn = byId('btnStartPeriod'); if (startBtn) startBtn.addEventListener('click', startPeriod);
  var historyBtn = byId('btnCycleHistory'); if (historyBtn) historyBtn.addEventListener('click', openCycleHistory);

  var timerToggleBtn = byId('timerToggle'); if (timerToggleBtn) timerToggleBtn.addEventListener('click', toggleTimer);
  var timerResetBtn = byId('timerReset'); if (timerResetBtn) timerResetBtn.addEventListener('click', resetTimer);
  document.querySelectorAll('[data-secs]').forEach(function (b) {
    b.addEventListener('click', function () { setTimer(parseInt(b.getAttribute('data-secs'), 10)); });
  });

  var toggleMacroBtn = byId('btnToggleMacro'); if (toggleMacroBtn) toggleMacroBtn.addEventListener('click', toggleMacroEdit);
  var saveMacroBtn = byId('btnSaveMacros'); if (saveMacroBtn) saveMacroBtn.addEventListener('click', saveMacros);

  var saveCheckinBtn = byId('btnSaveCheckin'); if (saveCheckinBtn) saveCheckinBtn.addEventListener('click', saveCheckin);
  var exportBtn = byId('btnExport'); if (exportBtn) exportBtn.addEventListener('click', exportData);
  var clearBtn = byId('btnClearData'); if (clearBtn) clearBtn.addEventListener('click', clearData);

  var restoreInput = byId('restoreFile');
  if (restoreInput) restoreInput.addEventListener('change', function () { restoreData(this.files[0]); });
}

/* ---------- Init ---------- */
function renderAll() {
  renderCycle();
  renderRecommendation();
  updateWorkoutPickerUI();
  updateModeTabsUI();
  renderHeader();
  renderWorkout();
  renderMacros();
}
function registerOfflineApp() {
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('./service-worker.js').then(function () {
      var s = document.getElementById('saveStatus'); if (s && !s.textContent) s.textContent = 'Offline mode is ready.';
    }).catch(function (e) { console.warn('Offline registration unavailable', e); });
  }
}
function safeInit() {
  try { var d = document.getElementById('pDate'); if (d) { try { d.valueAsDate = new Date(); } catch (e) { d.value = new Date().toISOString().slice(0, 10); } } } catch (e) {}
  try { buildWorkoutPickerOnce(); } catch (e) { console.error('buildWorkoutPickerOnce failed', e); }
  try { buildModeTabsOnce(); } catch (e) { console.error('buildModeTabsOnce failed', e); }
  try { initSegmentedControls(); } catch (e) { console.error('initSegmentedControls failed', e); }
  try { restoreReadinessToDOM(); } catch (e) { console.error('restoreReadinessToDOM failed', e); }
  try { wireStaticControls(); } catch (e) { console.error('wireStaticControls failed', e); }
  try { renderAll(); } catch (e) { console.error('renderAll failed', e); }
  try { renderHistory(); } catch (e) { console.error('renderHistory failed', e); }
  try { updateTimer(); } catch (e) { console.error('updateTimer failed', e); }
  if (!storageOK) {
    var s = document.getElementById('saveStatus');
    if (s) s.textContent = 'Note: this browser is blocking local storage, so entries will only be kept for this session.';
  }
}
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', safeInit); } else { safeInit(); }
window.addEventListener('load', registerOfflineApp);
