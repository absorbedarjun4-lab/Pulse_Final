/* ===== RESCUE MISSION LEAD QUIZ — VANILLA JS ENGINE ===== */

// ─── DATA ────────────────────────────────────────────────────
const DIMENSIONS = [
  { key: 'leadership', label: 'Leadership', icon: '⚡' },
  { key: 'ethics', label: 'Ethics & Empathy', icon: '🤝' },
  { key: 'speed', label: 'Speed & Decisiveness', icon: '⏱️' },
  { key: 'awareness', label: 'Situational Awareness', icon: '🔍' },
  { key: 'resourcefulness', label: 'Resourcefulness', icon: '🛠️' },
];

const TIERS = [
  { min: 0, label: 'Trainee Dispatcher', color: '#EDA6A3', badge: '🔰' },
  { min: 40, label: 'Field Responder', color: '#d4a76a', badge: '🥉' },
  { min: 60, label: 'Operations Coordinator', color: '#C0C0C0', badge: '🥈' },
  { min: 78, label: 'Rescue Mission Lead', color: '#F7D794', badge: '🥇' },
  { min: 92, label: 'Supreme Commander', color: '#FFD700', badge: '🏆' },
];

const SCENARIOS = [
  {
    id: 1,
    timeLimit: 50,
    category: 'Flash Flood',
    briefing: 'SITUATION BRIEFING — SECTOR 7',
    scenario:
      'A flash flood has struck a riverside district. Water levels are rising at 15 cm/min. You have two rescue boats, each holding 8 people. There are 22 stranded civilians: 6 elderly residents on a collapsing rooftop, 9 children trapped in a school bus half-submerged in the current, and 7 adults on a bridge that engineers say has 20 minutes before structural failure.',
    question: 'How do you allocate your two rescue boats for the first run?',
    choices: [
      {
        id: 'a',
        text: 'Both boats to the school bus — children are the absolute priority.',
        weights: { leadership: 1, ethics: 4, speed: 2, awareness: 0, resourcefulness: 0 },
        impactText: 'All 9 children are rescued. But you sent 16 seats to save 9 people — 7 seats wasted. The elderly rooftop collapses 6 minutes later; 2 elderly residents drown. The bridge adults were lucky it held. Tunnel-vision on one group cost lives.',
      },
      {
        id: 'b',
        text: 'One boat to the children, one to the elderly — the rooftop is collapsing fastest.',
        weights: { leadership: 3, ethics: 3, speed: 2, awareness: 4, resourcefulness: 2 },
        impactText: 'Children and elderly are secured. The bridge held longer than expected — all adults were evacuated in the second run with only minor injuries. Solid but not optimal resource usage.',
      },
      {
        id: 'c',
        text: 'One boat to the bridge (most people at immediate structural risk), one to children.',
        weights: { leadership: 3, ethics: 2, speed: 3, awareness: 5, resourcefulness: 3 },
        impactText: 'Bridge adults are saved just before collapse. Children are secured. The elderly had to wait 12 minutes but were rescued by a civilian volunteer crew. Data-driven triage.',
      },
      {
        id: 'd',
        text: 'Split the team: send divers to the bus while both boats handle bridge and roof simultaneously.',
        weights: { leadership: 5, ethics: 3, speed: 1, awareness: 3, resourcefulness: 5 },
        impactText: 'Ambitious coordination pays off — all groups are contacted within 10 minutes, though the operation stretches your team dangerously thin. One diver sustains a minor injury. High-risk, high-reward command.',
      },
    ],
  },
  {
    id: 2,
    timeLimit: 50,
    category: 'Wildfire Evacuation',
    briefing: 'SITUATION BRIEFING — RIDGE VALLEY',
    scenario:
      'A wildfire is advancing toward Ridge Valley at 12 km/h with erratic wind shifts. The only evacuation route is a two-lane mountain road already gridlocked. You have 3 buses, 2 ambulances, and a police escort. 400+ residents need evacuation. A retirement home with 35 mobility-impaired residents is closest to the fire front, while the town center has 200 panicking civilians attempting to flee on foot.',
    question: 'What is your immediate evacuation priority?',
    choices: [
      {
        id: 'a',
        text: 'All buses to the retirement home first — they cannot self-evacuate.',
        weights: { leadership: 1, ethics: 4, speed: 0, awareness: 1, resourcefulness: 0 },
        impactText: 'The retirement home is evacuated. But the gridlock worsened catastrophically — panicked civilians blocked the road, delaying the second run by 40 minutes. 12 town-center residents suffered severe smoke inhalation. 3 died. Single-focus leadership failed the broader mission.',
      },
      {
        id: 'b',
        text: 'Use police escort to clear the road, then run concurrent bus loops for both locations.',
        weights: { leadership: 5, ethics: 3, speed: 3, awareness: 4, resourcefulness: 5 },
        impactText: 'Road is cleared in 15 minutes. Organized concurrent loops evacuate both groups efficiently. A slight wind shift buys extra time. Total evacuation completes with minimal injuries. Textbook multi-vector coordination.',
      },
      {
        id: 'c',
        text: 'Direct town-center civilians to walk to the secondary fire break while buses handle the retirement home.',
        weights: { leadership: 3, ethics: 1, speed: 4, awareness: 4, resourcefulness: 3 },
        impactText: 'The divided approach maximizes coverage. Able-bodied civilians reach the fire break safely, though 3 children became separated and required search-and-rescue follow-up. Effective but ethically costly.',
      },
      {
        id: 'd',
        text: 'Request aerial water-drop to slow the fire front, buying time for a single organized convoy.',
        weights: { leadership: 1, ethics: 2, speed: 0, awareness: 2, resourcefulness: 1 },
        impactText: 'Aerial support takes 25 minutes to arrive. While waiting, the fire advanced 5 km. Several homes destroyed. 5 elderly residents suffered burns. Passive, hope-based leadership is not leadership.',
      },
    ],
  },
  {
    id: 3,
    timeLimit: 45,
    category: 'Medical Triage',
    briefing: 'SITUATION BRIEFING — COLLAPSE ZONE ALPHA',
    scenario:
      'A 6-story parking structure has partially collapsed after an earthquake. Your team has extracted 14 casualties so far. You have 2 paramedics, 1 field surgeon, and limited medical supplies (4 tourniquets, 2 IV kits, 1 portable ventilator). Among the extracted: a child with a punctured lung, an elderly man with severe cranial bleeding, a pregnant woman showing signs of early labor and shock, and a construction worker with a crushed leg but stable vitals.',
    question: 'How do you prioritize your limited medical resources?',
    choices: [
      {
        id: 'a',
        text: 'Ventilator to the child, surgeon focuses on cranial bleeding, paramedics stabilize the pregnant woman.',
        weights: { leadership: 4, ethics: 4, speed: 3, awareness: 5, resourcefulness: 4 },
        impactText: 'The child is stabilized. Cranial surgery is partially successful — the man is medevac\'d in critical condition. The pregnant woman is calmed and labor is delayed until hospital arrival. The construction worker self-applies a belt tourniquet. Optimal resource allocation.',
      },
      {
        id: 'b',
        text: 'Triage strictly by survivability: construction worker first (stable, quick fix), then child, then pregnant woman. Elderly man receives comfort care only.',
        weights: { leadership: 3, ethics: 0, speed: 5, awareness: 3, resourcefulness: 4 },
        impactText: 'Maximum throughput — 3 of 4 critical patients are stabilized within 20 mins. The elderly man passes before airlift. Your team\'s morale collapses. Two paramedics request permanent transfer after the mission. Efficiency without humanity.',
      },
      {
        id: 'c',
        text: 'Pregnant woman gets full team attention — two lives at stake. Others receive basic first aid while awaiting backup.',
        weights: { leadership: 0, ethics: 3, speed: 0, awareness: 0, resourcefulness: 0 },
        impactText: 'Mother and baby are stabilized, but the child\'s punctured lung causes respiratory failure during the wait. The child dies at age 7. Backup arrives 18 minutes too late for the elderly man. Catastrophic resource misallocation driven by emotional reasoning.',
      },
      {
        id: 'd',
        text: 'Split resources evenly across all four critical patients — no one gets zero attention.',
        weights: { leadership: 1, ethics: 3, speed: 1, awareness: 1, resourcefulness: 1 },
        impactText: 'All four patients receive care, but none receive optimal treatment. Two die during transport. The egalitarian approach felt fair but was medically reckless. Post-mission review flags this as a critical leadership failure.',
      },
    ],
  },
  {
    id: 4,
    timeLimit: 55,
    category: 'Leadership Under Pressure',
    briefing: 'SITUATION BRIEFING — FORWARD COMMAND',
    scenario:
      'During an active search-and-rescue in a collapsed hotel, your two team leads disagree violently. Lead Alpha insists on breaching the unstable east wing where sonar detected faint signs of life. Lead Bravo argues the west wing collapse pattern is more survivable and wants to redirect all resources there. Aftershock probability is 40% in the next hour. Both leads have equal experience, and the team is splitting along loyalty lines. Morale is fracturing.',
    question: 'How do you resolve this and maintain operational cohesion?',
    choices: [
      {
        id: 'a',
        text: 'Override both — you personally assess the structural data, make the call, and accept full responsibility.',
        weights: { leadership: 5, ethics: 2, speed: 4, awareness: 3, resourcefulness: 2 },
        impactText: 'Your decisive authority reunites the team. You choose the east wing based on sonar data — 3 survivors are found. Team respects the leadership, though Lead Bravo files a formal objection post-mission. Effective but autocratic.',
      },
      {
        id: 'b',
        text: 'Split the team: Alpha takes a small probe team east, Bravo takes the main team west. Hedge both bets.',
        weights: { leadership: 3, ethics: 3, speed: 2, awareness: 2, resourcefulness: 4 },
        impactText: 'Both wings explored. West yields 5 survivors; east probe finds 2 more. But the split left the probe team dangerously under-equipped — one rescuer is injured in an aftershock. Outcomes maximized but safety compromised.',
      },
      {
        id: 'c',
        text: 'Call a 5-minute all-hands huddle, present the data transparently, and let the team vote.',
        weights: { leadership: 0, ethics: 3, speed: 0, awareness: 1, resourcefulness: 0 },
        impactText: 'The vote is 7-5 for the west wing. The 5-minute delay means the east wing becomes inaccessible after an aftershock. 3 survivors trapped there are never reached. They die. Democracy in a crisis is abdication of command.',
      },
      {
        id: 'd',
        text: 'Pull both leads aside, acknowledge the tension, then assign Alpha east and Bravo west with clear time-boxes.',
        weights: { leadership: 5, ethics: 4, speed: 3, awareness: 4, resourcefulness: 5 },
        impactText: 'Private de-escalation works. Both leads feel heard and accountable. Operations proceed smoothly with clear boundaries. 7 total survivors found. Post-mission debrief is constructive. Leadership and empathy combined.',
      },
    ],
  },
  {
    id: 5,
    timeLimit: 60,
    category: 'Ethical Dilemma',
    briefing: 'SITUATION BRIEFING — LAST CHOPPER',
    scenario:
      'A Category 5 cyclone is making landfall in 90 minutes. Your last operational helicopter can make exactly ONE more trip before grounding. It can carry 6 passengers. Two SOS signals are active: Signal A comes from a hospital rooftop with 4 critical-care patients on life support (moving them risks equipment failure). Signal B comes from a school shelter with 14 people including 6 children, but it\'s on higher ground that MAY withstand the storm surge. The pilot warns that flying conditions are deteriorating every minute.',
    question: 'Where do you send the helicopter?',
    choices: [
      {
        id: 'a',
        text: 'Hospital rooftop — those 4 patients have ZERO survival chance without evacuation.',
        weights: { leadership: 2, ethics: 4, speed: 2, awareness: 2, resourcefulness: 1 },
        impactText: 'All 4 patients airlifted. Two experience equipment interruptions but survive. The school shelter takes damage but holds — all 14 survive with injuries. You got lucky the shelter held. What if it hadn\'t?',
      },
      {
        id: 'b',
        text: 'School shelter — 6 children plus 8 adults. Higher total lives, and children are involved.',
        weights: { leadership: 1, ethics: 2, speed: 3, awareness: 0, resourcefulness: 1 },
        impactText: 'You evacuate 6 (the children). The remaining 8 adults shelter and survive. The 4 hospital patients are lost when the surge overwhelms the building. 4 lives gone because you ran a numbers game without analyzing survival probability.',
      },
      {
        id: 'c',
        text: 'Send the chopper to the school with instructions to take the 6 children, then attempt a risky second run to the hospital.',
        weights: { leadership: 2, ethics: 2, speed: 0, awareness: 1, resourcefulness: 2 },
        impactText: 'Children evacuated. The pilot attempts the second run but is forced back by 140 km/h gusts. Hospital patients don\'t make it. The pilot suffers severe PTSD. Your gamble risked the pilot\'s life and failed. Reckless optimism kills.',
      },
      {
        id: 'd',
        text: 'Radio both locations: instruct hospital staff to disconnect mobile equipment and prepare for ground transport, send the chopper to the school.',
        weights: { leadership: 5, ethics: 3, speed: 3, awareness: 5, resourcefulness: 5 },
        impactText: 'Creative logistics. Hospital staff disconnect 2 of 4 patients from fixed equipment and move them ground-level. Chopper evacuates children. 2 hospital patients don\'t survive the transition. It\'s imperfect but maximizes total outcomes through parallel action.',
      },
    ],
  },
];

const MAX_PER_DIM = SCENARIOS.length * 5;
const MAX_TOTAL = MAX_PER_DIM * DIMENSIONS.length;

// ─── CONFIG ──────────────────────────────────────────────────
const API_BASE = '/api';

// ─── STATE ───────────────────────────────────────────────────
let phase = 'intro'; // intro | playing | feedback | result
let currentIndex = 0;
let scores = {};
let lastChoice = null;
let timeLeft = 0;
let timerId = null;
let choiceLocked = false;
let choiceHistory = [];

function resetScores() {
  scores = {};
  DIMENSIONS.forEach(d => scores[d.key] = 0);
  choiceHistory = [];
}
resetScores();

// ─── DOM REFS ────────────────────────────────────────────────
const $content = document.getElementById('phase-wrapper');

// ─── RENDER ROUTER ───────────────────────────────────────────
function render() {
  clearInterval(timerId);
  switch (phase) {
    case 'intro': renderIntro(); break;
    case 'playing': renderScenario(); break;
    case 'feedback': renderFeedback(); break;
    case 'result': renderResult(); break;
  }
}

// ─── TRANSITION HELPER ───────────────────────────────────────
function transitionTo(nextPhase, cb) {
  $content.classList.add('phase-wrapper--out');
  setTimeout(() => {
    phase = nextPhase;
    if (cb) cb();
    render();
    $content.classList.remove('phase-wrapper--out');
  }, 350);
}

// ─── INTRO ───────────────────────────────────────────────────
function renderIntro() {
  $content.innerHTML = `
    <div class="intro-screen" id="intro">
      <div class="intro-badge">
        <div class="intro-badge__ring"></div>
        <span class="intro-badge__icon">🛡️</span>
      </div>
      <h1 class="intro-title">
        PULSE<br>
        <span class="intro-title__sub">Rescue Mission Lead Assessment</span>
      </h1>
      <p class="intro-desc">
        You are being evaluated for readiness to command emergency rescue operations.
        Each scenario presents a high-stakes, time-sensitive crisis. There are no "correct" answers —
        only decisions with consequences. <strong>Poor decisions will fail you.</strong>
      </p>
      <div class="intro-stats">
        <div class="intro-stat">
          <span class="intro-stat__val">5</span>
          <span class="intro-stat__label">Scenarios</span>
        </div>
        <div class="intro-stat">
          <span class="intro-stat__val">45–60s</span>
          <span class="intro-stat__label">Per Round</span>
        </div>
        <div class="intro-stat">
          <span class="intro-stat__val">75%</span>
          <span class="intro-stat__label">To Pass</span>
        </div>
      </div>
      <div class="intro-dims">
        ${DIMENSIONS.map(d => `<span class="intro-dim">${d.icon} ${d.label}</span>`).join('')}
      </div>
      <button class="btn-start" id="btn-start">
        <span class="btn-start__text">BEGIN ASSESSMENT</span>
        <span class="btn-start__arrow">→</span>
      </button>
      <p class="intro-footer">
        ⚠️ Decisions are timed. Failure to respond triggers an automatic forced decision with severe penalties.
      </p>
    </div>
  `;
  // Animate in
  requestAnimationFrame(() => {
    document.getElementById('intro').classList.add('intro-screen--ready');
  });
  document.getElementById('btn-start').addEventListener('click', startQuiz);
}

// ─── START ───────────────────────────────────────────────────
function startQuiz() {
  currentIndex = 0;
  resetScores();
  lastChoice = null;
  transitionTo('playing');
}

// ─── SCENARIO ────────────────────────────────────────────────
function renderScenario() {
  choiceLocked = false;
  const s = SCENARIOS[currentIndex];
  timeLeft = s.timeLimit;

  const radius = 22;
  const circ = 2 * Math.PI * radius;

  $content.innerHTML = `
    <div class="scenario-card" id="scenario-card">
      <div class="scenario-header">
        <div class="scenario-header__left">
          <span class="scenario-category">${s.category}</span>
          <span class="scenario-progress">
            SCENARIO ${currentIndex + 1}<span class="scenario-progress__sep">/</span>${SCENARIOS.length}
          </span>
        </div>
        <div class="countdown" id="countdown">
          <svg class="countdown__svg" viewBox="0 0 50 50">
            <circle class="countdown__track" cx="25" cy="25" r="${radius}" fill="none" stroke-width="3"/>
            <circle class="countdown__ring" id="timer-ring" cx="25" cy="25" r="${radius}"
              fill="none" stroke-width="3" stroke-linecap="round"
              stroke-dasharray="${circ}" stroke-dashoffset="0"
              transform="rotate(-90 25 25)"/>
          </svg>
          <span class="countdown__value" id="timer-val">${timeLeft}</span>
          <span class="countdown__label">SEC</span>
        </div>
      </div>

      <div class="scenario-progress-bar">
        <div class="scenario-progress-bar__fill" style="width:${(currentIndex / SCENARIOS.length) * 100}%"></div>
        <div class="scenario-progress-bar__active" style="width:${((currentIndex + 1) / SCENARIOS.length) * 100}%"></div>
      </div>

      <div class="scenario-briefing">
        <span class="scenario-briefing__tag">${s.briefing}</span>
      </div>

      <div class="scenario-body">
        <p class="scenario-text">${s.scenario}</p>
        <h2 class="scenario-question">${s.question}</h2>
      </div>

      <div class="scenario-choices" id="choices">
        ${s.choices.map((c, i) => `
          <button class="choice-btn" data-id="${c.id}" style="animation-delay:${i * 0.08}s">
            <span class="choice-btn__marker">${String.fromCharCode(65 + i)}</span>
            <span class="choice-btn__text">${c.text}</span>
            <span class="choice-btn__chevron">›</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  // Timer
  const $ring = document.getElementById('timer-ring');
  const $val = document.getElementById('timer-val');
  const $cd = document.getElementById('countdown');

  function updateTimerVisuals() {
    const progress = (timeLeft / s.timeLimit) * circ;
    $ring.setAttribute('stroke-dashoffset', String(circ - progress));
    $val.textContent = timeLeft;
    // Urgency
    $cd.className = 'countdown';
    if (timeLeft <= 10) $cd.classList.add('countdown--critical');
    else if (timeLeft <= 20) $cd.classList.add('countdown--warning');
    else $cd.classList.add('countdown--normal');
  }
  updateTimerVisuals();

  timerId = setInterval(() => {
    timeLeft--;
    updateTimerVisuals();
    if (timeLeft <= 0) {
      clearInterval(timerId);
      handleTimeout(s);
    }
  }, 1000);

  // Choices
  document.getElementById('choices').addEventListener('click', (e) => {
    const btn = e.target.closest('.choice-btn');
    if (!btn || choiceLocked) return;
    choiceLocked = true;
    clearInterval(timerId);

    const choiceId = btn.dataset.id;
    const choice = s.choices.find(c => c.id === choiceId);

    // Selection animation
    document.querySelectorAll('.choice-btn').forEach(b => {
      if (b.dataset.id === choiceId) b.classList.add('choice-btn--selected');
      else b.classList.add('choice-btn--dimmed');
      b.classList.add('choice-btn--disabled');
    });

    setTimeout(() => {
      applyChoice(choice);
      transitionTo('feedback');
    }, 600);
  });
}

function handleTimeout(scenario) {
  if (choiceLocked) return;
  choiceLocked = true;
  // Timeout = ZERO scores across all dimensions
  const penalizedWeights = {};
  Object.keys(scenario.choices[0].weights).forEach(k => {
    penalizedWeights[k] = 0;
  });
  lastChoice = {
    ...scenario.choices[0],
    weights: penalizedWeights,
    text: '[NO DECISION MADE — TIME EXPIRED]',
    impactText: '⏱️ CRITICAL FAILURE — You failed to make any decision. In a real emergency, indecision costs lives. Zero points awarded. ' + scenario.choices[0].impactText,
    timedOut: true,
  };
  Object.entries(penalizedWeights).forEach(([k, v]) => { scores[k] += v; });
  choiceHistory.push({ scenarioId: scenario.id, choiceId: 'timeout', timedOut: true });
  transitionTo('feedback');
}

function applyChoice(choice) {
  lastChoice = choice;
  Object.entries(choice.weights).forEach(([k, v]) => { scores[k] += v; });
  choiceHistory.push({ scenarioId: SCENARIOS[currentIndex].id, choiceId: choice.id, timedOut: false });
}

// ─── SAVE RESULT TO BACKEND ─────────────────────────────────
async function saveResultToBackend(totalScore, pct, tierLabel) {
  try {
    const token = localStorage.getItem('crisis_token');
    if (!token) {
      console.error('No auth token found. Redirecting...');
      window.location.href = '/auth';
      return;
    }

    const payload = {
      leadership: scores.leadership,
      ethics: scores.ethics,
      speed: scores.speed,
      awareness: scores.awareness,
      resourcefulness: scores.resourcefulness,
      totalScore,
      maxTotal: MAX_TOTAL,
      percentage: pct,
      tier: tierLabel,
      choices: choiceHistory,
    };

    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      console.log('✅ Result saved:', data.id, 'verified:', data.isVerified);

      // Update local storage user data
      const userData = JSON.parse(localStorage.getItem('pulse_user')) || {};
      userData.isVerified = data.isVerified;
      userData.tier = data.tier;
      localStorage.setItem('pulse_user', JSON.stringify(userData));

      const $status = document.getElementById('save-status');
      if ($status) {
        if (data.isVerified) {
          $status.innerHTML = '✅ Result saved — <strong style="color:#8fe68f;">VERIFIED ✔</strong> (Passed assessment)';
          $status.style.color = '#8fe68f';
        } else {
          $status.innerHTML = '✅ Result saved — <strong style="color:var(--rose);">NOT VERIFIED ✘</strong> (Below passing threshold)';
          $status.style.color = 'var(--rose)';
        }
      }

      // Add a back button after a short delay
      setTimeout(() => {
        const btn = document.createElement('button');
        btn.className = 'btn-start';
        btn.style.marginTop = '2rem';
        btn.innerHTML = '<span>RETURN TO DASHBOARD</span>';
        btn.onclick = () => window.location.href = '/dashboard';
        document.getElementById('result').appendChild(btn);
      }, 1000);

    } else {
      console.warn('⚠️ Save failed:', data.message || data.error);
      const $status = document.getElementById('save-status');
      if ($status) { $status.textContent = `⚠️ Save failed: ${data.message || 'Error'}`; $status.style.color = 'var(--rose)'; }
    }
  } catch (err) {
    console.error('❌ Network error saving result:', err);
    const $status = document.getElementById('save-status');
    if ($status) { $status.textContent = '⚠️ Server unreachable — result not saved.'; $status.style.color = 'var(--rose)'; }
  }
}

// ─── FEEDBACK ────────────────────────────────────────────────
function renderFeedback() {
  const s = SCENARIOS[currentIndex];
  const isLast = currentIndex + 1 >= SCENARIOS.length;

  $content.innerHTML = `
    <div class="feedback" id="feedback">
      <div class="feedback-header">
        <span class="feedback-header__tag">
          ${lastChoice.timedOut ? '⏱️ TIME EXPIRED' : '📋 MISSION IMPACT REPORT'}
        </span>
        <span class="feedback-header__cat">${s.category}</span>
      </div>

      <div class="feedback-card">
        <h3 class="feedback-card__title">Your Decision</h3>
        <p class="feedback-card__decision">${lastChoice.text}</p>
        <div class="feedback-divider"></div>
        <h3 class="feedback-card__title feedback-card__title--impact">Consequence</h3>
        <p class="feedback-card__impact">${lastChoice.impactText}</p>

        <div class="feedback-scores">
          ${Object.entries(lastChoice.weights).map(([key, val]) => {
    const barClass = val <= 1 ? 'feedback-score__bar--low' : val >= 4 ? 'feedback-score__bar--high' : '';
    return `
              <div class="feedback-score">
                <span class="feedback-score__label">${key}</span>
                <div class="feedback-score__bar-wrap">
                  <div class="feedback-score__bar ${barClass}" style="width:${(val / 5) * 100}%"></div>
                </div>
                <span class="feedback-score__val">+${val}</span>
              </div>
            `;
  }).join('')}
        </div>
      </div>

      <button class="btn-continue" id="btn-continue">
        <span>${isLast ? 'VIEW READINESS REPORT' : 'NEXT SCENARIO'}</span>
        <span class="btn-continue__arrow">→</span>
      </button>
    </div>
  `;

  requestAnimationFrame(() => {
    document.getElementById('feedback').classList.add('feedback--visible');
  });

  document.getElementById('btn-continue').addEventListener('click', () => {
    if (isLast) {
      transitionTo('result');
    } else {
      currentIndex++;
      lastChoice = null;
      transitionTo('playing');
    }
  });
}

// ─── RESULT ──────────────────────────────────────────────────
function renderResult() {
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const pct = Math.round((totalScore / MAX_TOTAL) * 100);
  const tier = [...TIERS].reverse().find(t => pct >= t.min) || TIERS[0];

  let narrative = '';
  if (pct >= 92) narrative = 'Outstanding. You demonstrated elite-level judgment across all operational dimensions. Your ability to synthesize complex variables under extreme pressure marks you as a natural-born mission commander.';
  else if (pct >= 78) narrative = 'Highly effective. You consistently balanced competing priorities with tactical precision. Minor gaps in one or two dimensions can be addressed through field experience and advanced training simulations.';
  else if (pct >= 60) narrative = 'Borderline. Your decisions reflect some foundational instincts, but critical moments revealed dangerous hesitation or resource misallocation. You are NOT cleared for mission leadership. Targeted retraining is mandatory before re-assessment.';
  else if (pct >= 40) narrative = 'Failing. You showed promise in select areas but made decisions that would directly result in preventable casualties. Multi-variable decision-making under time pressure is a critical weakness. A structured mentorship program with veteran mission leads is required.';
  else narrative = 'Critical failure. Emergency command requires rapid, confident, multi-dimensional judgment. Your assessment reveals fundamental gaps in leadership, awareness, and resource management. People would die under your command. Comprehensive retraining is non-negotiable.';

  $content.innerHTML = `
    <div class="result" id="result">
      <div class="result-badge">
        <div class="result-badge__ring" style="border-color:${tier.color};box-shadow:0 0 30px ${tier.color}44"></div>
        <span class="result-badge__icon">${tier.badge}</span>
      </div>

      <div class="result-tier-label">RESCUE READINESS TIER</div>
      <h1 class="result-tier-name" style="color:${tier.color}">${tier.label}</h1>

      <div class="result-score-summary">
        <span class="result-score-summary__pct">${pct}%</span>
        <span class="result-score-summary__detail">${totalScore} / ${MAX_TOTAL} mission points</span>
      </div>

      <div class="result-dims">
        <h3 class="result-dims__title">PERFORMANCE BREAKDOWN</h3>
        ${DIMENSIONS.map(dim => {
    const val = scores[dim.key];
    const pctDim = Math.round((val / MAX_PER_DIM) * 100);
    return `
            <div class="result-dim">
              <div class="result-dim__header">
                <span class="result-dim__icon">${dim.icon}</span>
                <span class="result-dim__label">${dim.label}</span>
                <span class="result-dim__val">${val}/${MAX_PER_DIM}</span>
              </div>
              <div class="result-dim__bar-wrap">
                <div class="result-dim__bar" data-width="${pctDim}%"></div>
              </div>
            </div>
          `;
  }).join('')}
      </div>

      <div class="result-narrative">
        <h3 class="result-narrative__title">ASSESSMENT SUMMARY</h3>
        <p class="result-narrative__text">${narrative}</p>
      </div>

      <p id="save-status" style="font-size:.7rem;color:var(--pearl-muted);letter-spacing:.08em;margin-top:var(--space-sm);">Saving result to mission database…</p>

      <div style="margin-top:var(--space-md);">
        <button class="btn-restart" id="btn-restart">
          <span>RETAKE ASSESSMENT</span>
          <span class="btn-restart__icon">↻</span>
        </button>
      </div>
    </div>
  `;

  // Animate in
  requestAnimationFrame(() => {
    document.getElementById('result').classList.add('result--visible');
  });
  // Animate bars
  setTimeout(() => {
    document.querySelectorAll('.result-dim__bar').forEach(bar => {
      bar.style.width = bar.dataset.width;
    });
  }, 600);

  // Save to backend
  saveResultToBackend(totalScore, pct, tier.label);

  document.getElementById('btn-restart').addEventListener('click', () => {
    transitionTo('intro', () => {
      currentIndex = 0;
      resetScores();
      lastChoice = null;
    });
  });
}

// ─── BOOT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', render);
