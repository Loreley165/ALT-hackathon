import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import SkillPassport, { initialSkills, updatedSkills, Icon } from './SkillPassport';
import AchievementPoster from './AchievementPoster';
import BrandLogo from './BrandLogo';
import { completeTask, curriculum, levelFor, moduleState, readStore, recordKey, STORAGE_KEY, taskState, todayActivities } from './learning';
import './demo.css';
import './app.css';
import './phone.css';
import './iphone.css';

function Avatar({ profile, large = false }) { return <span className={`app-avatar ${large ? 'app-avatar--large' : ''}`}>{profile.avatar ? <img src={profile.avatar} alt={`${profile.name}'s avatar`}/> : profile.name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('')}</span>; }

function App() {
  const [store, setStore] = useState(readStore);
  const [tab, setTab] = useState('passport');
  const [poster, setPoster] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [profileError, setProfileError] = useState('');
  const [installEvent, setInstallEvent] = useState(null);
  const [installHelp, setInstallHelp] = useState(false);
  const [installed, setInstalled] = useState(window.matchMedia('(display-mode: standalone)').matches);
  const [now, setNow] = useState(() => new Date());
  const [toast, setToast] = useState('');
  const [draftName, setDraftName] = useState(store.profile.name);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const scenario = store.scenarios[store.version];
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); setStorageError(''); } catch { setStorageError('Device storage is unavailable or full. Progress will last only for this session.'); } }, [store]);
  useEffect(() => { const refresh = () => setNow(new Date()); const timer = setInterval(refresh, 30000); document.addEventListener('visibilitychange', refresh); window.addEventListener('focus', refresh); return () => { clearInterval(timer); document.removeEventListener('visibilitychange', refresh); window.removeEventListener('focus', refresh); }; }, []);
  useEffect(() => {
    const capture = event => { event.preventDefault(); setInstallEvent(event); };
    const complete = () => { setInstalled(true); setInstallEvent(null); setInstallHelp(false); };
    window.addEventListener('beforeinstallprompt', capture); window.addEventListener('appinstalled', complete);
    return () => { window.removeEventListener('beforeinstallprompt', capture); window.removeEventListener('appinstalled', complete); };
  }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 5000); return () => clearTimeout(timer); }, [toast]);
  const skills = (store.version === 'current' ? initialSkills : updatedSkills).map(skill => {
    if (skill.status === 'Verified') return skill;
    const state = moduleState(skill.id, scenario.records, now);
    const started = curriculum[skill.id].some(task => scenario.records[recordKey(skill.id, task.id)]?.completedAt);
    return { ...skill, status: state === 'complete' ? 'Ready for Verification' : started ? 'Practising' : 'Needs Support' };
  });
  const verified = skills.filter(skill => skill.status === 'Verified').length;
  const level = levelFor(verified);
  const today = useMemo(() => todayActivities(scenario.activities, now), [scenario.activities, now]);
  const reviewCount = Object.values(scenario.records).filter(record => taskState(record, now) === 'review').length;
  const completedCount = Object.values(scenario.records).filter(record => record?.completedAt).length;
  const readyIds = skills.filter(skill => skill.status === 'Ready for Verification').map(skill => skill.id).sort();
  const alreadyRequested = readyIds.length > 0 && readyIds.every(id => scenario.requested.includes(id));
  const nextSkill = skills.find(skill => moduleState(skill.id, scenario.records, now) === 'review') || skills.find(skill => moduleState(skill.id, scenario.records, now) === 'pending');

  function finishTask(skillId, taskId) {
    const date = new Date();
    const previous = taskState(scenario.records[recordKey(skillId, taskId)], date);
    if (previous === 'complete') return;
    const records = completeTask(scenario.records, skillId, taskId, date);
    const task = curriculum[skillId].find(item => item.id === taskId);
    const skill = skills.find(item => item.id === skillId);
    const activity = { id: `${recordKey(skillId, taskId)}-${date.getTime()}`, skillId, taskId, skillName: skill.name, title: task.title, kind: previous === 'review' ? 'review' : 'complete', at: date.toISOString() };
    setStore(value => ({ ...value, scenarios: { ...value.scenarios, [value.version]: { ...value.scenarios[value.version], records, activities: [...value.scenarios[value.version].activities, activity], requested: value.scenarios[value.version].requested.filter(id => id !== skillId) } } }));
    setNow(date); setToast(previous === 'review' ? 'Review recorded. Your next review is in one month.' : 'One step forward. Added to today’s achievements.');
    if (moduleState(skillId, records, date) === 'complete') setPoster(true);
  }
  async function requestVerification(payload) {
    const version = store.version;
    await new Promise(resolve => setTimeout(resolve, 450));
    setStore(value => ({ ...value, scenarios: { ...value.scenarios, [version]: { ...value.scenarios[version], requested: [...new Set([...value.scenarios[version].requested, ...payload.skills.map(skill => skill.id)])] } } }));
    setToast('Demo request recorded. No supervisor notification was sent.');
  }
  async function uploadAvatar(event) {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setProfileError('Choose a JPG, PNG or WebP image under 5 MB.'); return; }
    setAvatarBusy(true); setProfileError(''); const url = URL.createObjectURL(file);
    try { const img = new Image(); img.src = url; await img.decode(); const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256; const side = Math.min(img.width, img.height); canvas.getContext('2d').drawImage(img, (img.width-side)/2, (img.height-side)/2, side, side, 0, 0, 256, 256); const avatar = canvas.toDataURL('image/png'); setStore(value => ({ ...value, profile: { ...value.profile, avatar } })); setToast('Your passport photo has been updated.'); }
    catch { setProfileError('This image could not be opened. Try another photo.'); }
    finally { URL.revokeObjectURL(url); setAvatarBusy(false); }
  }
  async function install() { if (installEvent) { await installEvent.prompt(); const result = await installEvent.userChoice; setInstallEvent(null); if (result.outcome !== 'accepted') setInstallHelp(true); } else setInstallHelp(value => !value); }
  function continueLearning() { setTab('passport'); setTimeout(() => { const items = [...document.querySelectorAll('.alt-module')]; const target = items.find(item => item.classList.contains('alt-module--review')) || items.find(item => item.classList.contains('alt-module--pending')); if (target) { target.querySelector('.alt-badge-button').click(); } }, 50); }

  return <div className={`demo-shell app-shell iphone-shell ${tab === 'passport' ? 'iphone-shell--passport' : ''}`}><div className="iphone-status" aria-hidden="true"><span>9:41</span><span className="iphone-island"/><span className="iphone-indicators"><span className="iphone-signal"><i/><i/><i/><i/></span><svg width="15" height="13" viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 5a12 12 0 0 1 16 0M5 9a7 7 0 0 1 10 0M8 13a3 3 0 0 1 4 0"/></svg><span className="iphone-battery"/></span></div>
    <header className="demo-nav"><a className="demo-brand" href="#main" onClick={() => setTab('passport')} aria-label="ALT home"><BrandLogo/><span>GROW WITH EVERY SHIFT.</span></a><nav className="app-desktop-tabs" aria-label="Main navigation">{[['passport','Passport'],['today','Today'],['profile','Profile']].map(([value,label]) => <button key={value} aria-current={tab === value ? 'page' : undefined} onClick={() => setTab(value)}>{label}{value === 'today' && today.length > 0 && <span>{today.length}</span>}</button>)}</nav><button className="app-install" onClick={install} disabled={installed}>{installed ? 'Installed ✓' : 'Install app'}<Icon name="arrow"/></button><button className="app-profile-shortcut" aria-label="Open profile" onClick={() => setTab('profile')}><Avatar profile={store.profile}/></button></header>
    {installHelp && <div className="app-install-help" role="status"><strong>Take ALT with you.</strong><span>On iPhone/iPad: open this app in Safari, tap Share → Add to Home Screen. On Android or desktop: use your browser’s Install app / Add to Home Screen menu. Install controls depend on your browser. For another device, the app needs an HTTPS address.</span><button aria-label="Close install help" onClick={() => setInstallHelp(false)}>×</button></div>}
    {storageError && <p className="app-warning" role="alert">{storageError}</p>}
    <main id="main">
      {tab === 'passport' && <><div className="demo-heading"><div><p className="demo-eyebrow"><span/> YOUR EVERYDAY GROWTH COMPANION</p><h1>Collect skills.<br/><em>Grow every day.</em></h1><p className="demo-intro">A little practice today. A little more confidence tomorrow.<br/>Open a skill, take a step, make it yours.</p></div><div className="app-streak"><span className="app-streak__number">{today.length.toString().padStart(2,'0')}<Icon name="spark"/></span><span>steps forward today</span><button onClick={() => setTab('today')}>View your day <span>↗</span></button></div></div>
      <div className="demo-layout"><div className="demo-passport-wrap"><div className="demo-caption"><span>01 / YOUR SKILL PASSPORT</span><span><span className="demo-status-dot"/> Saved on this device</span></div><SkillPassport key={`${store.version}-${readyIds.join('-')}`} skills={skills} learnerName={store.profile.name} avatar={store.profile.avatar} level={level} learningRecords={scenario.records} onCompleteTask={finishTask} now={now} onRequestVerification={requestVerification} requested={alreadyRequested}/></div>
      <aside className="demo-sidebar app-sidebar"><div className="demo-explore-label"><span>YOUR LEARNING PATH</span><Icon name="spark"/></div><h2>Build a little.<br/>Become more.</h2><p className="demo-side-intro">Every skill is a series of small steps.<br/>Your next one is waiting.</p><div className="app-learning-summary"><span><strong>{completedCount}<small>/12</small></strong>learning steps</span><span><strong>{reviewCount.toString().padStart(2,'0')}</strong>reviews due</span></div>
      <div className="app-legend"><p className="demo-section-label">A COLOUR FOR EVERY STEP</p><span><i className="app-dot--pending"/> Light orange <strong>To complete</strong></span><span><i className="app-dot--complete"/> Olive green <strong>Completed</strong></span><span><i className="app-dot--review"/> Light red <strong>Monthly review</strong></span><p>Reviews are due one calendar month after completion or your last review.</p></div>
      <div className="demo-next"><span className="demo-next-icon"><Icon name={reviewCount ? 'clock' : 'menu'}/></span><p className="demo-section-label">{reviewCount ? 'TIME FOR A REFRESH' : 'YOUR NEXT SMALL STEP'}</p><h3>{nextSkill?.name || 'You’ve done the practice.'}</h3><p>{nextSkill ? 'Open the module, practise each step and record your progress.' : 'Share what you learned today, or request a supervisor review.'}</p>{nextSkill && <button className="app-text-button" onClick={continueLearning}>Continue learning <Icon name="arrow"/></button>}</div>
      <button className="app-poster-cta" onClick={() => setPoster(true)} disabled={!today.length}><span><Icon name="spark"/><strong>Your day, in a poster.</strong><small>{today.length ? `${today.length} achievements ready to share` : 'Complete a step to start your story'}</small></span><Icon name="arrow"/></button>

      </aside></div></>}
      {tab === 'today' && <section className="app-page"><p className="demo-eyebrow"><span/> {now.toLocaleDateString('en-AU', { weekday:'long', day:'numeric', month:'long' }).toUpperCase()}</p><div className="app-page-heading"><div><h1>Your day.<br/><em>Your progress.</em></h1><p className="demo-intro">Small moments of learning add up to something good.</p></div><span className="app-today-count">{today.length.toString().padStart(2,'0')}<small>steps today</small></span></div><div className="app-today-layout"><div className="app-timeline">{today.length ? <><p className="demo-section-label">TODAY’S COMPLETED TASKS</p>{today.map(activity => <article key={activity.id}><span className="app-timeline-check"><Icon name="check"/></span><div><span>{activity.skillName} · {activity.kind === 'review' ? 'Reviewed' : 'Completed'}</span><h3>{activity.title}</h3><time dateTime={activity.at}>{new Date(activity.at).toLocaleTimeString('en-AU', { hour:'2-digit', minute:'2-digit' })}</time></div></article>)}</> : <div className="app-empty"><Icon name="spark"/><h2>Your next chapter starts here.</h2><p>Complete or review a learning step.<br/>Your achievements will appear here today.</p><button className="app-primary" onClick={continueLearning}>Explore your skills <Icon name="arrow"/></button></div>}</div><div className="app-share-card"><Icon name="spark"/><p className="demo-section-label">MADE TO BE SHARED</p><h2>A little proof<br/>of your progress.</h2><p>Your name, your level, your photo.<br/>And everything you learned today.</p><button className="app-primary" disabled={!today.length} onClick={() => setPoster(true)}>Create today’s poster <Icon name="arrow"/></button><small>PNG download · System sharing when available</small></div></div></section>}
      {tab === 'profile' && <section className="app-page"><p className="demo-eyebrow"><span/> YOUR PASSPORT IDENTITY</p><h1>Make it <em>yours.</em></h1><p className="demo-intro">This is how you’ll appear on your passport and shared posters.</p><div className="app-profile-grid"><form className="app-profile-form" onSubmit={event => { event.preventDefault(); if (!draftName.trim()) { setProfileError('Please enter your name.'); return; } setStore(value => ({ ...value, profile: { ...value.profile, name: draftName.trim() } })); setProfileError(''); setToast('Your profile has been saved.'); }}><div className="app-photo-edit"><Avatar profile={store.profile} large/><div><label className="app-secondary app-upload">{avatarBusy ? 'Updating…' : 'Change photo'}<input aria-label="Upload avatar" type="file" accept="image/png,image/jpeg,image/webp" disabled={avatarBusy} onChange={uploadAvatar}/></label><small>JPG, PNG or WebP · Up to 5 MB</small>{store.profile.avatar && <button type="button" className="app-text-button" onClick={() => setStore(value => ({ ...value, profile: { ...value.profile, avatar: '' } }))}>Remove photo</button>}</div></div><label className="app-field">Your name<input value={draftName} maxLength={48} required onChange={event => setDraftName(event.target.value)}/></label><label className="app-field">Your level<input value={level} readOnly/></label><p className="app-help">Demo level follows verified skills: 0–1 = Level 1; 2–3 = Level 2; 4 = Level 3. Practice completion does not change verified status.</p>{profileError && <p className="app-warning" role="alert">{profileError}</p>}<button className="app-primary" type="submit">Save profile <Icon name="check"/></button></form><div className="app-profile-info">      <details className="app-demo-settings"><summary>Explore demo states</summary><p>Each example keeps its own progress.</p><div className="demo-toggle" role="group" aria-label="Passport state"><button aria-pressed={store.version === 'current'} onClick={() => setStore(value => ({ ...value, version: 'current' }))}>Current state</button><button aria-pressed={store.version === 'updated'} onClick={() => setStore(value => ({ ...value, version: 'updated' }))}>Updated state</button></div><p>Supervisor requests are recorded locally in this demo. No notification is sent.</p></details><Icon name="shield"/><h2>Your progress.<br/>Always with you.</h2><p>Install ALT for an app-like experience and access previously loaded content offline.</p><button className="app-secondary" onClick={install} disabled={installed}>{installed ? 'App installed' : 'Install ALT'}</button><p className="app-help">Progress and photos are saved in this browser only. Clearing browser data removes them; account sync is not connected.</p></div></div></section>}
      <footer className="demo-footer"><span><BrandLogo/> <span>A LITTLE TRAINING. A LASTING DIFFERENCE.</span></span><span>LEARN. PRACTISE. GROW. <Icon name="spark"/></span></footer>
    </main>
    <nav className="app-bottom-nav" aria-label="Mobile navigation">{[['passport','Passport','menu'],['today','Today','spark'],['profile','Profile','guest']].map(([value,label,icon]) => <button key={value} aria-current={tab === value ? 'page' : undefined} onClick={() => { setTab(value); window.scrollTo(0,0); }}><Icon name={icon}/><span>{label}</span>{value === 'today' && today.length > 0 && <i>{today.length}</i>}</button>)}</nav>
    {toast && <div className="app-toast" role="status"><Icon name="check"/>{toast}</div>}
    {poster && today.length > 0 && <AchievementPoster profile={store.profile} level={level} activities={today} onClose={() => setPoster(false)}/>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => { navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => { /* App remains usable online when offline support is unavailable. */ }); });
