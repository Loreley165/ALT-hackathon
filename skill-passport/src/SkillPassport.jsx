import React, { useId, useState } from 'react';
import './SkillPassport.css';
import SkillModule from './SkillModule';
import BrandLogo from './BrandLogo';

export const initialSkills = [
  { id: 'guest', name: 'Guest Interaction', detail: 'Make every guest feel welcome.', status: 'Verified', icon: 'guest' },
  { id: 'menu', name: 'Menu Knowledge', detail: 'Know the menu. Share it with confidence.', status: 'Verified', icon: 'menu' },
  { id: 'pos', name: 'POS Independent', detail: 'Take orders and payments independently.', status: 'Practising', icon: 'pos' },
  { id: 'dietary', name: 'Dietary & Allergens', detail: 'Support safe, informed dining choices.', status: 'Needs Support', icon: 'dietary' },
];
export const updatedSkills = initialSkills.map(skill => ({ ...skill, status: skill.id === 'pos' ? 'Ready for Verification' : skill.id === 'dietary' ? 'Practising' : skill.status }));

const statusClass = { Verified: 'verified', Practising: 'practising', 'Needs Support': 'support', 'Ready for Verification': 'ready' };

export function Icon({ name, ...props }) {
  const paths = {
    check: <path d="m5 12 4 4L19 6"/>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
    guest: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6m2 9v-2a6 6 0 0 0-2-4"/></>,
    menu: <><path d="M12 6v15M3 4h4a5 5 0 0 1 5 2 5 5 0 0 1 5-2h4v15h-4a5 5 0 0 0-5 2 5 5 0 0 0-5-2H3z"/></>,
    pos: <><rect x="4" y="3" width="16" height="12" rx="2"/><path d="M8 21h8m-4-6v6M8 7h8m-8 4h3"/></>,
    dietary: <><path d="M20 3C8 2 3 8 6 15s15 3 14-12ZM4 21 15 9m-7 8-1-5m5 1h5"/></>,
    spark: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="m8 12 3 3 5-6"/></>,
  };
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.spark}</svg>;
}

/** Controlled skill data; onRequestVerification may return a Promise. No backend is assumed. */
export default function SkillPassport({ skills = initialSkills, learnerName = 'Alex Morgan', role = 'Hospitality team member', passportId = 'ALT–0042', onRequestVerification, className = '', avatar = '', level, learningRecords, onCompleteTask, now = new Date(), requested = false }) {
  const titleId = useId();
  const helpId = useId();
  const [requestState, setRequestState] = useState(requested ? 'success' : 'idle');
  const verified = skills.filter(skill => skill.status === 'Verified').length;
  const ready = skills.filter(skill => skill.status === 'Ready for Verification');
  const canRequest = ready.length > 0 && typeof onRequestVerification === 'function';
  async function requestVerification() {
    if (!canRequest || requestState === 'pending' || requestState === 'success') return;
    setRequestState('pending');
    try { await onRequestVerification({ learnerName, passportId, skills: ready.map(skill => ({ ...skill })) }); setRequestState('success'); }
    catch { setRequestState('error'); }
  }
  return <section className={`alt-passport ${className}`} aria-labelledby={titleId}>
    <header className="alt-passport__cover">
      <div className="alt-passport__eyebrow"><span><span className="alt-passport__mini-logo"><BrandLogo dark/></span> LEARNING, MADE VISIBLE.</span><Icon name="spark"/></div>
      <div className="alt-passport__title-row"><div><p className="alt-passport__kicker">YOUR GROWTH. YOUR PROOF.</p><h2 id={titleId}>Skill Passport<span>.</span></h2></div><div className="alt-passport__seal"><Icon name="shield"/><span>BUILT ON<br/>EXPERIENCE</span></div></div>
      <div className="alt-passport__identity"><div className="alt-passport__avatar">{avatar ? <img src={avatar} alt={`${learnerName}'s avatar`}/> : learnerName.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('')}</div><div><strong>{learnerName}</strong><span>{level || role}</span></div><span className="alt-passport__id">{passportId}</span></div>
    </header>
    <div className="alt-passport__body">
      <div className="alt-passport__progress-head"><span><span className="alt-passport__live-dot"/> YOUR SKILLS, IN MOTION</span><strong>{verified}<span> / {skills.length} verified</span></strong></div>
      <div className="alt-passport__progress" role="progressbar" aria-label="Verified skills" aria-valuenow={verified} aria-valuemin={0} aria-valuemax={skills.length || 1}><span style={{ width: `${skills.length ? verified / skills.length * 100 : 0}%` }}/></div>
      {learningRecords ? <ul className="alt-learning-modules">{skills.map((skill, index) => <SkillModule key={skill.id} skill={skill} index={index} records={learningRecords} onCompleteTask={onCompleteTask} now={now}/>)}</ul> : <ul className="alt-passport__skills">{skills.map((skill, index) => <li key={skill.id} className={`alt-passport__skill alt-passport__skill--${statusClass[skill.status] || 'practising'}`}>
        <span className="alt-passport__skill-icon"><Icon name={skill.icon}/></span><div className="alt-passport__skill-copy"><span className="alt-passport__skill-number">SKILL {String(index + 1).padStart(2, '0')}</span><h3>{skill.name}</h3><p>{skill.detail}</p></div><span className={`alt-passport__badge alt-passport__badge--${statusClass[skill.status] || 'practising'}`}><Icon name={skill.status === 'Verified' ? 'check' : skill.status === 'Ready for Verification' ? 'spark' : skill.status === 'Practising' ? 'clock' : 'guest'}/>{skill.status}</span>
      </li>)}</ul>}
      <div className="alt-passport__action"><div className="alt-passport__action-note"><Icon name="shield"/><p>Progress takes practice.<br/><strong>Recognition makes it count.</strong></p></div><button type="button" className="alt-passport__request" onClick={requestVerification} disabled={!canRequest || requestState === 'pending' || requestState === 'success'} aria-describedby={helpId}>{requestState === 'pending' ? 'Sending Request…' : requestState === 'success' ? 'Verification Requested' : 'Request Supervisor Verification'}<Icon name={requestState === 'success' ? 'check' : 'arrow'}/></button><p id={helpId} className={`alt-passport__feedback ${requestState === 'error' ? 'alt-passport__feedback--error' : ''}`} role="status">{requestState === 'error' ? 'Your request could not be sent. Please try again.' : requestState === 'success' ? 'Request recorded. Skills stay unverified until a supervisor reviews them.' : !ready.length ? 'A skill becomes eligible when it is ready for verification.' : !onRequestVerification ? 'Connect a supervisor workflow to enable requests.' : `${ready.length} skill ready for your supervisor’s review.`}</p></div>
    </div>
    <footer className="alt-passport__footer"><span>EVERY SHIFT IS A STEP FORWARD.</span><span>ALT / SKILL PASSPORT <Icon name="spark"/></span></footer>
  </section>;
}
