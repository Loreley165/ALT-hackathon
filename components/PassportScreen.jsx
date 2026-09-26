import React, { useEffect, useRef, useState } from 'react';
import { initialSkills } from '../skill-passport/src/SkillPassport.jsx';
import SkillModule from '../skill-passport/src/SkillModule.jsx';
import { seedRecords, completeTask } from '../skill-passport/src/learning.js';
import { demoAxes, passportSVG, passportPNG, downloadBlob } from './passport-art.js';
import './passport-bridge.css';

function Brand() { return <svg className="pp-logo" viewBox="0 0 112 54" role="img" aria-label="ALT"><text x="4" y="40" fill="currentColor" fontFamily="Georgia,serif" fontSize="47">ALT</text><path d="M3 43 Q29 23 51 37" fill="none" stroke="#d3b980" strokeWidth="3"/></svg>; }
const shiftProgress = [
  { label: 'POS operation', before: 62, after: 72, evidence: '3 orders completed independently · 1 modified order handled' },
  { label: 'Communication', before: 72, after: 76, evidence: 'Asked for supervisor support when it mattered' },
  { label: 'Allergen handling', before: 38, after: 38, evidence: 'Keep practising with supervisor support' },
];
function ShiftProgress({ analysed }) {
  return <section className="pp-growth" aria-labelledby="growth-title">
    <div className="pp-section-heading"><h3 id="growth-title">Your progress this shift</h3><span>DEMO</span></div>
    <p className="pp-muted">{analysed ? 'Small steps. Real reasons to keep going.' : 'Reflect on your shift to see your progress here.'}</p>
    {analysed && <ul>{shiftProgress.map(skill=><li key={skill.label}>
      <div className="pp-growth-title"><strong>{skill.label}</strong><span className={skill.after > skill.before ? 'pp-gain' : 'pp-practice'}>{skill.after > skill.before ? `+${skill.after-skill.before} pts` : 'Keep practising'}</span></div>
      <p>{skill.evidence}</p><div className="pp-growth-score"><span>{skill.before} → <b>{skill.after}</b> / 100</span></div>
      <div className="pp-growth-track" aria-hidden="true"><i style={{width:`${skill.after}%`}}/><i style={{width:`${skill.before}%`}}/></div>
    </li>)}</ul>}
    <p className="pp-growth-note">Illustrative demo changes, not an AI assessment.</p>
  </section>;
}
function SharePassport({ axes, analysed, onClose }) {
  const dialog=useRef(null); const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
  useEffect(()=>{ const before=document.activeElement; dialog.current.showModal(); return ()=>before?.focus?.(); },[]);
  async function exportCard(share) {
    setBusy(true); setMessage('');
    try {
      const blob=await passportPNG(axes,analysed); const file=new File([blob],'Alex-Chen-ALT-Skill-Passport.png',{type:'image/png'});
      if(share && navigator.canShare?.({files:[file]})) { await navigator.share({files:[file],title:'My ALT Skill Passport'}); setMessage('Passport shared.'); }
      else { downloadBlob(blob); setMessage(share?'Image downloaded. You can send it using your preferred app.':'PNG downloaded — ready to share.'); }
    } catch(e) { if(e.name!=='AbortError') setMessage('Could not export the image. Please try again.'); }
    finally {setBusy(false);}
  }
  return <dialog className="pp-share" ref={dialog} aria-labelledby="share-title" onCancel={e=>{e.preventDefault();onClose();}}>
    <div className="pp-share-top"><div><p>YOUR SKILLS, TO GO</p><h2 id="share-title">Your shareable passport</h2></div><button aria-label="Close passport preview" onClick={onClose}>×</button></div>
    <img className="pp-share-card" src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(passportSVG(axes,analysed))}`} alt="Alex Chen’s demonstration skill passport, with six capability scores and skill statuses"/>
    <div className="pp-share-actions"><button disabled={busy} onClick={()=>exportCard(false)}>{busy?'Preparing…':'Download PNG'}</button><button disabled={busy} onClick={()=>exportCard(true)}>Share image ↗</button></div><p className="pp-share-status" role="status">{message || 'Demo data is labelled on the exported card.'}</p>
  </dialog>;
}
export default function PassportScreen({ analysed, reflection, onMission }) {
  const [records,setRecords]=useState(()=>seedRecords(analysed?'updated':'current'));
  const [sharing,setSharing]=useState(false);
  const axes=demoAxes.map(a=>({...a,score:!analysed && a.label==='POS operation'?62:a.score}));
  const skills=initialSkills.map(skill=>({...skill,status:analysed && skill.id==='pos'?'Ready for Verification':skill.status}));
  return <div className="pp-app">
    <header className="pp-header"><Brand/><span>MY LEARNING</span><div className="pp-avatar">AC</div></header>
    <div className="pp-content">
      <div className="pp-title"><p>YOUR GROWTH, MADE VISIBLE</p><h2>Skill Passport<span>.</span></h2><div>A little better, every shift.</div></div>
      <div className="pp-identity-line"><span className="pp-light-avatar">AC</span><div><strong>Alex Chen</strong><p>Shift 4 · Hospitality team member</p></div></div>
      <section className="pp-skills"><div className="pp-section-heading"><h3>Your skills</h3><span>4 AREAS</span></div><p className="pp-muted">Tap a skill to explore your learning steps.</p><ul className="alt-learning-modules">{skills.map((skill,index)=><SkillModule key={skill.id} skill={skill} index={index} records={records} onCompleteTask={(id,task)=>setRecords(value=>completeTask(value,id,task))} now={new Date()}/>)}</ul></section>
      <div className="passport-handoff">{reflection && <details><summary>Your shift reflection</summary><p>{reflection}</p></details>}<button onClick={onMission}>See My Next Shift Mission →</button></div>
      <ShiftProgress analysed={analysed}/>
      <button className="pp-share-trigger" onClick={()=>setSharing(true)}><span>▣</span> View & share my passport <span>↗</span></button>
      <p className="pp-disclaimer">* Mock skill record. Scores and verified labels are examples only; no real assessment or certification.</p>
    </div>
    {sharing && <SharePassport axes={axes} analysed={analysed} onClose={()=>setSharing(false)}/>}
  </div>;
}
