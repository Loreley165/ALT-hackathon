// Integration point: replace this local demo with the future analysis service.
function analyseShift(reflection) {
  return { reflection, message: 'You took time to reflect on Shift 4. For POS Independent, consider which tasks you completed on your own and where you needed support.' };
}
const $ = selector => document.querySelector(selector);
const reflection = $('#reflection');
const error = $('#reflection-error');
const analysis = $('#analysis');
const dialog = $('#text-dialog');
const choices = [...document.querySelectorAll('[data-answer]')];
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let listening = false;
let session = 0;
function changed() {
  $('#demo-status').hidden = true;
  $('#count').textContent = `${reflection.value.length.toLocaleString('en-AU')} / 3,000`;
  error.hidden = true;
  analysis.hidden = true;
  updatePreview();
}
function stopVoice() {
  session++;
  if (recognition) recognition.abort();
  recognition = null;
  listening = false;
  $('#record').setAttribute('aria-label', 'Start voice input');
  $('#record').setAttribute('aria-pressed', 'false');
  $('#analyse').disabled = false;
}
function reflectionText() {
  const picks = choices.filter(button => button.getAttribute('aria-pressed') === 'true').map(button => button.dataset.answer);
  return [...picks, reflection.value.trim()].filter(Boolean).join('\n');
}
function updatePreview() {
  const text = reflectionText();
  $('#reflection-preview').hidden = !text;
  $('#preview-copy').textContent = text;
}
function openText() {
  stopVoice();
  dialog.showModal();
}
$('#open-text').addEventListener('click', openText);
$('#edit-text').addEventListener('click', openText);
$('#close-text').addEventListener('click', () => dialog.close());
$('#save-text').addEventListener('click', () => { updatePreview(); dialog.close(); });
$('#record').disabled = !SpeechRecognition;
if (!SpeechRecognition) $('#voice-status').textContent = 'Voice isn’t available in this browser. Tap “Type instead” below to write your reflection.';
choices.forEach(button => button.addEventListener('click', () => {
  const selected = button.getAttribute('aria-pressed') !== 'true';
  // "Did not use POS" is mutually exclusive with the other POS experiences.
  if (selected) choices.forEach(other => {
    if (button === choices[3] || other === choices[3]) other.setAttribute('aria-pressed', 'false');
  });
  button.setAttribute('aria-pressed', String(selected));
  changed();
}));
reflection.addEventListener('input', changed);
$('#record').addEventListener('click', () => {
  if (listening) { recognition.stop(); return; }
  if (!SpeechRecognition) return;
  const currentSession = ++session;
  const engine = new SpeechRecognition();
  recognition = engine;
  engine.lang = 'en-AU';
  engine.continuous = true;
  engine.interimResults = false;
  engine.onresult = event => {
    if (currentSession !== session) return;
    let added = '';
    for (let i = event.resultIndex; i < event.results.length; i++) if (event.results[i].isFinal) added += event.results[i][0].transcript + ' ';
    reflection.value = [reflection.value.trim(), added.trim()].filter(Boolean).join(' ').slice(0, 3000);
    changed();
  };
  engine.onerror = event => {
    if (currentSession !== session) return;
    const messages = {'not-allowed':'Microphone permission was denied. Allow microphone access in your browser, or open text input below.', 'no-speech':'No speech detected. Try again or type your reflection.', 'audio-capture':'No microphone was found. Open text input below.', network:'The speech service is unavailable. Try again or open text input below.'};
    $('#voice-status').textContent = messages[event.error] || 'Voice input stopped. You can retry or continue typing.';
    stopVoice();
  };
  engine.onend = () => {
    if (currentSession !== session) return;
    stopVoice();
    $('#voice-status').textContent = 'Recording stopped. Review your words below, or tap to record more.';
  };
  try {
    engine.start();
    listening = true;
    $('#record').setAttribute('aria-label', 'Stop voice input');
    $('#record').setAttribute('aria-pressed', 'true');
    $('#analyse').disabled = true;
    $('#voice-status').textContent = 'Listening… Tap stop when you’re done.';
  } catch {
    stopVoice();
    $('#voice-status').textContent = 'Voice input could not start. Try again or open text input below.';
  }
});
$('#reflection-form').addEventListener('submit', event => {
  event.preventDefault();
  if (listening) return;
  const text = reflectionText();
  if (!text) {
    error.textContent = 'Choose an answer, type a reflection, or record your voice first.';
    error.hidden = false;
    return;
  }
  startAnalysis();
});
window.addEventListener('pagehide', stopVoice);

// Display real device-local time; no invented shift start or duration.
function updateClock() {
  const now = new Date();
  $('#current-date').textContent = new Intl.DateTimeFormat('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(now);
  const time = new Intl.DateTimeFormat('en-AU', { hour: '2-digit', minute: '2-digit' }).format(now);
  $('#current-time').textContent = time;
  $('#current-time').setAttribute('datetime', now.toISOString());
  $('#device-time').textContent = time.replace(/\s?(am|pm)/i, '');
}
updateClock();
setInterval(updateClock, 10000);

// Staged demo only. Replace with real analysis progress when the API is connected.
let transitionTimers = [];
function startAnalysis() {
  transitionTimers.forEach(clearTimeout);
  $('#passport-result')?.remove();
  ['evidence-step', 'insights-step', 'continue-step'].forEach(id => $('#' + id).hidden = true);
  $('#passport-status').hidden = true;
  $('#update-passport').disabled = false;
  $('#analysis-title').textContent = 'ALT is reading your shift…';
  $('#transition-status').textContent = 'Finding the learning in your everyday work.';
  $('#reflection-form').hidden = true;
  document.querySelectorAll('.reflection > .section-top, .reflection > h2, .reflection > .description').forEach(el => el.hidden = true);
  analysis.hidden = false;
  analysis.classList.remove('complete');
  $('#analysis-title').focus({ preventScroll: true });
  $('.app-shell').scrollTo({ top: 0, behavior: 'instant' });
  const reveal = (id, delay, message) => setTimeout(() => {
    $('#' + id).hidden = false;
    $('#transition-status').textContent = message;
  }, delay);
  transitionTimers = [
    reveal('evidence-step', 900, 'Evidence recognised. Identifying strengths and development areas…'),
    reveal('insights-step', 1800, 'Your demo insights are ready.'),
    setTimeout(() => {
      $('#continue-step').hidden = false;
      $('#analysis-title').textContent = 'Your learning, made visible.';
      $('#transition-status').textContent = 'A moment from your shift. A clearer picture of your growth.';
      analysis.classList.add('complete');
    }, 2700)
  ];
}
$('#back-reflection').addEventListener('click', () => {
  transitionTimers.forEach(clearTimeout);
  analysis.hidden = true;
  $('#reflection-form').hidden = false;
  document.querySelectorAll('.reflection > .section-top, .reflection > h2, .reflection > .description').forEach(el => el.hidden = false);
  $('#analyse').focus();
});
function buildPassportPreview(reflection) {
  if (!$('#passport-result-style')) {
    const style = document.createElement('style');
    style.id = 'passport-result-style';
    style.textContent = '.passport-result{margin:16px 0;padding:16px;border:1px solid #e0d8c7;border-radius:15px;background:#fffefa;color:#263d49;animation:reveal-evidence .4s ease-out}.passport-result h4{font-size:18px;margin:6px 0 14px;font-weight:500}.passport-result .eyebrow{color:#9c875c;font-size:8px;letter-spacing:1.2px}.passport-result-status{display:grid;gap:4px;padding:12px;border-radius:10px;background:#f4f1e8}.passport-result-status span,.passport-result-evidence>span,.passport-result-mission>span{font-size:8px;letter-spacing:.7px;color:#897752;text-transform:uppercase}.passport-result-status strong{font-size:13px;font-weight:550}.passport-result-status small{color:#748083;font-size:9px}.passport-result-evidence{margin-top:14px}.passport-result-evidence p{white-space:pre-wrap;overflow-wrap:anywhere;margin:7px 0 0;border-left:2px solid #b79b66;padding:2px 0 2px 10px;font-size:10px;line-height:1.7;color:#58676a}.passport-result-mission{margin-top:14px;padding:12px;border-radius:10px;background:#f5f3ed}.passport-result-mission p{margin:6px 0 0;font-size:10px;line-height:1.6;color:#334a55}.passport-result-note{font-size:9px;line-height:1.6;color:#7a8585;margin:12px 0 0}';
    document.head.appendChild(style);
  }

  const didNotUsePOS = choices[3].getAttribute('aria-pressed') === 'true'
    || /\b(did(?: not|n’t|n't) (?:get a chance to )?use (?:the )?POS|no POS opportunity)\b/i.test(reflection);
  const demonstratedIndependence = choices[0].getAttribute('aria-pressed') === 'true'
    || /\b(independent(?:ly)?|on my own|without help)\b/i.test(reflection);
  const needsSupport = choices[1].getAttribute('aria-pressed') === 'true'
    || choices[2].getAttribute('aria-pressed') === 'true'
    || /\b(help|support|tricky|practice|allergy|allergen)\b/i.test(reflection);
  const suggestedStatus = didNotUsePOS
    ? 'No new POS evidence'
    : demonstratedIndependence
      ? 'Ready for supervisor review'
      : 'Practice evidence added';
  const nextMission = didNotUsePOS
    ? 'Look for a supported opportunity to practise POS on your next shift.'
    : needsSupport
      ? 'Practise one POS order independently, with a supervisor available to support you.'
      : demonstratedIndependence
        ? 'Ask your supervisor to review this evidence for POS Independent.'
        : 'Record another POS experience and ask your supervisor what to practise next.';

  const section = document.createElement('section');
  section.id = 'passport-result';
  section.className = 'passport-result';
  section.setAttribute('aria-labelledby', 'passport-result-title');
  section.innerHTML = `
    <p class="eyebrow">SKILL PASSPORT · THIS SHIFT</p>
    <h4 id="passport-result-title">POS Independent</h4>
    <div class="passport-result-status">
      <span>Suggested status</span>
      <strong></strong>
      <small>Supervisor verification required</small>
    </div>
    <div class="passport-result-evidence">
      <span>Latest evidence · Your reflection</span>
      <p></p>
    </div>
    <div class="passport-result-mission">
      <span>NEXT SHIFT MISSION</span>
      <p></p>
    </div>
    <p class="passport-result-note">This is a session-only demo preview. ALT suggests evidence for review; it does not certify a skill.</p>
  `;
  section.querySelector('.passport-result-status strong').textContent = suggestedStatus;
  section.querySelector('.passport-result-evidence p').textContent = didNotUsePOS
    ? 'You noted that you did not use the POS this shift. No new POS evidence was added.'
    : reflection;
  section.querySelector('.passport-result-mission p').textContent = nextMission;
  return section;
}

$('#update-passport').addEventListener('click', () => {
  const reflection = reflectionText();
  const preview = buildPassportPreview(reflection);
  const existing = $('#passport-result');
  if (existing) existing.replaceWith(preview);
  else $('#continue-step').insertBefore(preview, $('#passport-status'));
  $('#passport-status').textContent = 'Your reflection is now shown in the Skill Passport preview.';
  $('#passport-status').hidden = false;
  $('#update-passport').textContent = 'Skill Passport preview ready';
  $('#update-passport').disabled = true;
  preview.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
});

// Prepared example matches the illustrative evidence in the demo transition.
$('#try-demo').addEventListener('click', () => {
  stopVoice();
  choices.forEach(button => button.setAttribute('aria-pressed', 'false'));
  reflection.value = 'I handled three POS orders independently, including one modified order. I needed help from a teammate with a nut allergy enquiry.';
  changed();
  $('#demo-status').textContent = 'Demo reflection loaded below. Review it, then tap Update My Skill Passport.';
  $('#demo-status').hidden = false;
  $('#reflection-preview').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
});

// Connected Skill Passport modules. These records are demo-only and stay in this browser.
(() => {
  const hub = $('#passport-hub');
  if (!hub) return;
  const storageKey = 'alt-skill-passport-demo-v1';
  const seed = {
    role: 'employee', view: 'passport', skillStatus: 'Practising', verified: false,
    nextMission: 'Complete one modified POS order independently, with a supervisor available for support.',
    records: [
      { shift: 'Shift 2', date: '19 Sep', evidence: 'Completed two POS orders independently; asked where to add a dietary note.', status: 'Practising' },
      { shift: 'Shift 3', date: '22 Sep', evidence: 'Handled one modified order and requested support with an allergy enquiry.', status: 'Practising' }
    ],
    missions: [
      { title: 'Add dietary notes to a POS ticket', support: 'Practise with a supervisor nearby.', done: false },
      { title: 'Complete one modified order independently', support: 'Apply a modifier and read the ticket back.', done: true },
      { title: 'Ask a supervisor to review POS evidence', support: 'Bring one example from a real shift.', done: false }
    ],
    training: [
      { title: 'POS basics: modifiers and dietary notes', detail: 'Short practice guide · 5 min', done: false },
      { title: 'Allergen-safe service', detail: 'Workplace checklist · 4 steps', done: false }
    ],
    observations: [], pathwayRole: 'Front of house', syncCount: 0
  };
  let state = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (!saved || saved.version !== 1) return { ...seed, version: 1 };
      return { ...seed, ...saved, version: 1 };
    } catch { return { ...seed, version: 1 }; }
  })();
  const managerLogin = $('#manager-login');
  const managerDashboard = $('#manager-dashboard');
  let managerSession = false;
  // A manager view must be entered through the demo login again after a reload.
  if (state.role === 'manager') { state.role = 'employee'; state.view = 'passport'; }
  const nav = $('#hub-nav');
  const panel = $('#hub-panel');
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const save = () => { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {} };
  const roles = {
    'Front of house': ['POS order flow', 'Dietary and allergen notes', 'Guest communication', 'Payment and close-out'],
    'Barista': ['Coffee workflow', 'POS modifiers', 'Dietary milk requests', 'Station reset'],
    'Kitchen': ['Ticket reading', 'Allergen separation', 'Prep and handover', 'Service timing']
  };
  const employeeViews = [
    ['passport', 'My Passport'], ['evidence', 'Evidence'], ['pathway', 'Learning Path'], ['training', 'Learning Resources']
  ];
  const managerViews = [
    ['reviews', 'Shift Reviews'], ['verification', 'Skill Verification'], ['team', 'Team Readiness'], ['framework', 'Skill Framework'], ['integrations', 'Connections']
  ];
  const badge = (text, tone = '') => `<span class="hub-badge ${tone}">${escapeHTML(text)}</span>`;
  const latest = () => state.records[state.records.length - 1];
  function openHub() {
    hub.hidden = false;
    renderHub();
    hub.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }
  function statusText() { return state.verified ? 'Verified by supervisor · demo' : state.skillStatus; }
  function renderPassport() {
    const count = state.records.length;
    const percent = state.verified ? 100 : /review/i.test(state.skillStatus) ? 78 : /no new/i.test(state.skillStatus) ? 32 : 56;
    const item = latest();
    return `<p class="hub-section-label">PERSONAL SKILL RECORD</p><div class="hub-card"><div class="hub-passport-summary"><div><strong>POS Independent</strong><small>${count} shift records · Last updated ${escapeHTML(item?.date || '—')}</small></div>${badge(statusText(), state.verified ? 'good' : 'warn')}</div><div class="hub-meter"><i style="width:${percent}%"></i></div><div class="hub-steps"><span class="done"></span><span class="done"></span><span class="${percent >= 70 ? 'done' : ''}"></span><span class="${state.verified ? 'done' : ''}"></span></div><p>Evidence builds progression. Only a supervisor can confirm the skill.</p></div><div class="hub-card"><div class="hub-card-top"><h3>Latest shift evidence · ${escapeHTML(item?.shift || 'No new shift')}</h3>${badge(item?.status || 'Sample history')}</div><p>${escapeHTML(item?.evidence || 'Add a shift reflection to start a new evidence record.')}</p></div><div class="hub-mission"><p class="hub-section-label">NEXT SHIFT MISSION</p><b>${escapeHTML(state.nextMission)}</b><small>Personalised from recent evidence and support needs.</small></div><div class="hub-card"><div class="hub-card-top"><h3>Learning loop</h3>${badge(`${count} shifts`)}</div><p>Reflect → evidence → practice → supervisor review</p><button class="hub-action" data-go="evidence" type="button">View evidence history</button></div>`;
  }
  function renderEvidence() {
    const records = [...state.records].reverse();
    if (!records.length) return '<p class="hub-empty">No evidence yet. Record a shift reflection to get started.</p>';
    return `<p class="hub-section-label">CROSS-SHIFT EVIDENCE · DEMO RECORDS</p><p class="hub-copy">Each entry connects an observed work experience to a skill and the next practice step.</p><div class="hub-list">${records.map(record => `<article class="hub-list-item"><i>✓</i><span><b>${escapeHTML(record.shift)} · ${escapeHTML(record.date)}</b><small>${escapeHTML(record.evidence)}</small></span>${badge(record.status, /review|verified/i.test(record.status) ? 'good' : '')}</article>`).join('')}</div><p class="hub-notice">Employee reflections and manager observations appear together in a real Skill Passport. This prototype stores fictional demo records in your browser.</p>`;
  }
  function renderPathway() {
    const pathway = roles[state.pathwayRole] || roles['Front of house'];
    const done = state.missions.filter(mission => mission.done).length;
    return `<p class="hub-section-label">ADAPTIVE ONBOARDING · ${escapeHTML(state.pathwayRole.toUpperCase())}</p><h3 class="hub-title">A practice path shaped by your shifts</h3><p class="hub-copy">Choose a hospitality role to see its skill framework. Completion is a local demo action.</p><label class="hub-copy" for="pathway-role">Role-based skill path</label><select id="pathway-role" class="hub-select"><option ${state.pathwayRole === 'Front of house' ? 'selected' : ''}>Front of house</option><option ${state.pathwayRole === 'Barista' ? 'selected' : ''}>Barista</option><option ${state.pathwayRole === 'Kitchen' ? 'selected' : ''}>Kitchen</option></select><div class="hub-card"><div class="hub-card-top"><h3>Next-shift practice</h3>${badge(`${done}/${state.missions.length} complete`)}</div><div class="hub-list">${state.missions.map((mission, index) => `<div class="hub-list-item"><i class="${mission.done ? 'done' : ''}">${mission.done ? '✓' : '○'}</i><span><b>${escapeHTML(mission.title)}</b><small>${escapeHTML(mission.support)}</small></span><button type="button" class="hub-action" data-action="toggle-mission" data-index="${index}">${mission.done ? 'Undo' : 'Complete'}</button></div>`).join('')}</div></div><div class="hub-card"><h3>Role skills</h3><div class="hub-list">${pathway.map((skill, index) => `<div class="hub-list-item"><i class="${index < 2 ? 'done' : ''}">${index < 2 ? '✓' : '○'}</i><span><b>${escapeHTML(skill)}</b><small>${index < 2 ? 'Evidence in progress' : 'Upcoming practice area'}</small></span>${badge(index < 2 ? 'In practice' : 'Next')}</div>`).join('')}</div></div>`;
  }
  function renderTraining() {
    return `<p class="hub-section-label">LEARNING RESOURCES</p><h3 class="hub-title">Practice between shifts</h3><p class="hub-copy">Short learning items support workplace practice; completing one does not verify a skill.</p><div class="hub-list">${state.training.map((course, index) => `<div class="hub-list-item"><i class="${course.done ? 'done' : ''}">${course.done ? '✓' : '○'}</i><span><b>${escapeHTML(course.title)}</b><small>${escapeHTML(course.detail)}</small></span><button type="button" class="hub-action" data-action="toggle-training" data-index="${index}">${course.done ? 'Completed' : 'Mark complete'}</button></div>`).join('')}</div><p class="hub-notice">Training items are demo content. No external learning platform is connected.</p>`;
  }
  function renderReviews() {
    const record = latest();
    const note = state.observations.at(-1);
    return `<p class="hub-section-label">MANAGER OBSERVATION</p><h3 class="hub-title">Coach from a real shift</h3><p class="hub-copy">Review the employee's own evidence, add an observation, and agree on a next practice step.</p><div class="hub-card"><div class="hub-card-top"><h3>${escapeHTML(record?.shift || 'Latest shift')} · Employee reflection</h3>${badge(record?.status || 'No new evidence')}</div><p>${escapeHTML(record?.evidence || 'Submit a shift reflection first.')}</p></div>${note ? `<div class="hub-card"><h3>Latest supervisor observation</h3><p>${escapeHTML(note.text)}</p><p>${escapeHTML(note.date)}</p></div>` : ''}<label class="hub-copy" for="manager-observation">Add an observation</label><textarea id="manager-observation" class="hub-textarea" maxlength="500" placeholder="What did you observe? What should the employee practise next?"></textarea><button type="button" class="hub-action primary-action" data-action="save-observation">Save observation</button><p class="hub-status" id="manager-status" role="status"></p><p class="hub-notice">Observations are saved to this browser's demo profile only.</p>`;
  }
  function renderVerification() {
    const item = latest();
    return `<p class="hub-section-label">SUPERVISOR-VERIFIED SKILL</p><h3 class="hub-title">Evidence first. Human confirmation.</h3><p class="hub-copy">ALT can surface evidence for review. A manager decides whether it meets workplace requirements.</p><div class="hub-card"><div class="hub-card-top"><h3>POS Independent</h3>${badge(statusText(), state.verified ? 'good' : 'warn')}</div><p>${escapeHTML(item?.evidence || 'No new evidence has been submitted.')}</p></div><div class="hub-grid"><div class="hub-stat"><b>${state.records.length}</b><span>shift evidence records</span></div><div class="hub-stat"><b>${state.observations.length}</b><span>manager observations</span></div></div><button type="button" class="hub-action primary-action" data-action="verify-skill" ${state.verified ? 'disabled' : ''}>${state.verified ? 'Verified in demo' : 'Confirm skill · demo only'}</button><p class="hub-status" id="verification-status" role="status">${state.verified ? 'This sample profile is marked as supervisor-verified in this browser.' : 'This action changes only the fictional demo profile.'}</p><p class="hub-notice">A real verification workflow requires authenticated supervisor permissions, audit history, and workplace policy rules.</p>`;
  }
  function renderTeam() {
    const employees = [
      { name: 'Alex Chen', role: 'Front of house · Shift 4', status: statusText(), progress: state.verified ? 100 : /review/i.test(state.skillStatus) ? 78 : 56 },
      { name: 'Mira Chen', role: 'New hire · Day 2', status: 'Needs POS coaching', progress: 42 },
      { name: 'Jordan Lee', role: 'Barista · Week 3', status: 'Building evidence', progress: 67 }
    ];
    return `<p class="hub-section-label">TEAM READINESS · SAMPLE TEAM</p><h3 class="hub-title">See where coaching will help</h3><p class="hub-copy">A concept dashboard using fictional team members and sample progress.</p><div class="hub-grid"><div class="hub-stat"><b>${employees.filter(person => /review|verified/i.test(person.status)).length}</b><span>ready for supervisor review</span></div><div class="hub-stat"><b>${employees.filter(person => /needs/i.test(person.status)).length}</b><span>need a coaching opportunity</span></div></div><div class="hub-list">${employees.map(person => `<article class="hub-list-item"><i>${person.name.slice(0, 1)}</i><span><b>${escapeHTML(person.name)}</b><small>${escapeHTML(person.role)} · ${escapeHTML(person.status)}</small><span class="hub-meter"><i style="width:${person.progress}%"></i></span></span>${badge(`${person.progress}%`)}</article>`).join('')}</div><p class="hub-notice">Team view is illustrative. Real team data requires employer identity, role permissions, and connected employee records.</p>`;
  }
  function renderFramework() {
    const skills = roles[state.pathwayRole] || roles['Front of house'];
    return `<p class="hub-section-label">HOSPITALITY SKILL FRAMEWORK</p><h3 class="hub-title">Make expectations clear by role</h3><p class="hub-copy">Select a role to preview a small set of observable skills.</p><label class="hub-copy" for="framework-role">Role</label><select id="framework-role" class="hub-select"><option ${state.pathwayRole === 'Front of house' ? 'selected' : ''}>Front of house</option><option ${state.pathwayRole === 'Barista' ? 'selected' : ''}>Barista</option><option ${state.pathwayRole === 'Kitchen' ? 'selected' : ''}>Kitchen</option></select><div class="hub-list">${skills.map((skill, index) => `<div class="hub-list-item"><i>${String(index + 1).padStart(2, '0')}</i><span><b>${escapeHTML(skill)}</b><small>Observe, practise, then review with a supervisor.</small></span>${badge(index === 0 ? 'Core skill' : 'Role skill')}</div>`).join('')}</div><p class="hub-notice">Framework is sample content. Each workplace should define its own standards and verification criteria.</p>`;
  }
  function renderIntegrations() {
    return `<p class="hub-section-label">SYSTEM CONNECTIONS</p><h3 class="hub-title">Connect learning with daily work</h3><p class="hub-copy">A future integration hub for workplace learning and service systems.</p><div class="hub-list"><div class="hub-list-item"><i>1</i><span><b>Learning platform</b><small>Training completion and learning resources</small></span>${badge('Not connected', 'warn')}</div><div class="hub-list-item"><i>2</i><span><b>POS system</b><small>Order context and skill practice prompts</small></span>${badge('Not connected', 'warn')}</div><div class="hub-list-item"><i>3</i><span><b>Workforce directory</b><small>Roles, teams, and supervisor access</small></span>${badge('Not connected', 'warn')}</div></div><button type="button" class="hub-action primary-action" data-action="demo-sync">Simulate a demo sync</button><p class="hub-status" id="sync-status" role="status">${state.syncCount ? `${state.syncCount} local demo sync${state.syncCount === 1 ? '' : 's'} simulated. No external system was contacted.` : 'No external systems are connected.'}</p><p class="hub-notice">Real connections need vendor APIs, employer authorization, privacy agreements, and secure identity mapping.</p>`;
  }
  const renderers = { passport: renderPassport, evidence: renderEvidence, pathway: renderPathway, training: renderTraining, reviews: renderReviews, verification: renderVerification, team: renderTeam, framework: renderFramework, integrations: renderIntegrations };
  function renderHub() {
    const options = state.role === 'manager' ? managerViews : employeeViews;
    if (!options.some(([key]) => key === state.view)) state.view = options[0][0];
    $('#hub-role [data-role="employee"]').setAttribute('aria-selected', String(state.role === 'employee'));
    $('#hub-role [data-role="manager"]').setAttribute('aria-selected', String(state.role === 'manager'));
    $('#hub-back').textContent = state.role === 'manager' && managerSession ? '← Manager dashboard' : '← Back to reflection';
    nav.innerHTML = options.map(([key, label]) => `<button type="button" role="tab" data-view="${key}" aria-selected="${String(key === state.view)}">${label}</button>`).join('');
    panel.innerHTML = (renderers[state.view] || renderPassport)();
    save();
  }
  function hideEmployeeScreen() {
    $('#reflection-form').hidden = true;
    analysis.hidden = true;
    hub.hidden = true;
    managerLogin.hidden = true;
    managerDashboard.hidden = true;
    document.querySelectorAll('.reflection > .section-top, .reflection > h2, .reflection > .description').forEach(element => { element.hidden = true; });
  }
  function showEmployeeScreen() {
    managerSession = false;
    state.role = 'employee';
    state.view = 'passport';
    save();
    managerLogin.hidden = true;
    managerDashboard.hidden = true;
    hub.hidden = true;
    analysis.hidden = true;
    $('#reflection-form').hidden = false;
    document.querySelectorAll('.reflection > .section-top, .reflection > h2, .reflection > .description').forEach(element => { element.hidden = false; });
    $('.app-shell').scrollTo({ top: 0, behavior: 'smooth' });
  }
  function showManagerLogin() {
    hideEmployeeScreen();
    managerLogin.hidden = false;
    managerLogin.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }
  function renderManagerDashboard() {
    const needsReview = !state.verified && /review/i.test(state.skillStatus);
    $('#manager-review-count').textContent = needsReview ? '1' : '0';
    $('#manager-alex-summary').textContent = `POS Independent · ${state.verified ? 'Verified in demo' : state.skillStatus}`;
    const record = latest();
    $('#manager-pending-copy').textContent = record ? `${record.shift}: ${record.evidence}` : 'No shift reflection has been added yet.';
  }
  function openManagerModule(view) {
    managerSession = true;
    state.role = 'manager';
    state.view = view;
    save();
    managerDashboard.hidden = true;
    openHub();
  }
  $('#manager-login-open').addEventListener('click', showManagerLogin);
  $('#manager-login-back').addEventListener('click', showEmployeeScreen);
  $('#manager-demo-login').addEventListener('click', () => {
    managerSession = true;
    state.role = 'manager';
    state.view = 'team';
    save();
    hideEmployeeScreen();
    managerDashboard.hidden = false;
    renderManagerDashboard();
    managerDashboard.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  });
  managerDashboard.addEventListener('click', event => {
    const target = event.target.closest('[data-manager-view], #open-team-module, #review-skill-button, #manager-signout');
    if (!target) return;
    if (target.id === 'manager-signout') {
      state.role = 'employee';
      state.view = 'passport';
      save();
      showEmployeeScreen();
      return;
    }
    openManagerModule(target.dataset.managerView || (target.id === 'review-skill-button' ? 'reviews' : 'team'));
  });
  $('#view-passport').addEventListener('click', openHub);
  $('#hub-role').addEventListener('click', event => {
    const button = event.target.closest('[data-role]');
    if (!button) return;
    if (button.dataset.role === 'manager' && !managerSession) {
      showManagerLogin();
      return;
    }
    if (button.dataset.role === 'employee' && managerSession) {
      showEmployeeScreen();
      return;
    }
    state.role = button.dataset.role;
    state.view = state.role === 'manager' ? 'reviews' : 'passport';
    renderHub();
  });
  nav.addEventListener('click', event => {
    const button = event.target.closest('[data-view]');
    if (!button) return;
    state.view = button.dataset.view;
    renderHub();
  });
  $('#hub-back').addEventListener('click', () => {
    hub.hidden = true;
    if (managerSession) {
      managerDashboard.hidden = false;
      renderManagerDashboard();
      managerDashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    else if (!analysis.hidden) $('#back-reflection').click();
    else $('.app-shell').scrollTo({ top: 0, behavior: 'smooth' });
  });
  $('#reset-demo').addEventListener('click', () => {
    state = { ...seed, records: seed.records.map(item => ({ ...item })), missions: seed.missions.map(item => ({ ...item })), training: seed.training.map(item => ({ ...item })), observations: [], version: 1 };
    try { localStorage.removeItem(storageKey); } catch {}
    renderHub();
  });
  $('#update-passport').addEventListener('click', () => {
    const preview = $('#passport-result');
    const resultStatus = preview?.querySelector('.passport-result-status strong')?.textContent || 'Practice evidence added';
    const mission = preview?.querySelector('.passport-result-mission p')?.textContent || state.nextMission;
    const shift = `Shift ${Math.max(4, state.records.length + 2)}`;
    const date = new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short' }).format(new Date());
    state.records.push({ shift, date, evidence: reflectionText(), status: resultStatus });
    state.skillStatus = resultStatus;
    state.verified = false;
    state.nextMission = mission;
    state.view = state.role === 'manager' ? 'reviews' : 'passport';
    save();
    openHub();
  });
  panel.addEventListener('click', event => {
    const route = event.target.closest('[data-go]');
    if (route) { state.view = route.dataset.go; renderHub(); return; }
    const action = event.target.closest('[data-action]');
    if (!action) return;
    const index = Number(action.dataset.index);
    if (action.dataset.action === 'toggle-mission' && state.missions[index]) state.missions[index].done = !state.missions[index].done;
    if (action.dataset.action === 'toggle-training' && state.training[index]) state.training[index].done = !state.training[index].done;
    if (action.dataset.action === 'save-observation') {
      const value = panel.querySelector('#manager-observation')?.value.trim();
      if (!value) { $('#manager-status').textContent = 'Add an observation before saving.'; return; }
      state.observations.push({ text: value, date: new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()) });
    }
    if (action.dataset.action === 'verify-skill' && !state.verified) {
      state.verified = true;
      state.skillStatus = 'Supervisor verified · demo';
      if (latest()) latest().status = 'Supervisor verified · demo';
    }
    if (action.dataset.action === 'demo-sync') state.syncCount += 1;
    renderHub();
  });
  panel.addEventListener('change', event => {
    if (event.target.matches('#pathway-role, #framework-role')) {
      state.pathwayRole = event.target.value;
      renderHub();
    }
  });
  $('#reflection-form').addEventListener('submit', () => { hub.hidden = true; });
  if (new URLSearchParams(window.location.search).get('view') === 'manager') showManagerLogin();
})();
