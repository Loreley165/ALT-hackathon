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
$('#update-passport').addEventListener('click', () => {
  $('#passport-status').textContent = 'Demo complete. The Skill Passport screen is not connected yet; no record has been changed.';
  $('#passport-status').hidden = false;
  $('#update-passport').disabled = true;
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
