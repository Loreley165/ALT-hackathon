import React, { useEffect, useRef, useState } from 'react';
import { initialSkills } from '../skill-passport/src/SkillPassport.jsx';
import SkillModule from '../skill-passport/src/SkillModule.jsx';
import { seedRecords, completeTask } from '../skill-passport/src/learning.js';
import { demoAxes, radarPoints, passportSVG, passportPNG, downloadBlob } from './passport-art.js';
import './passport-bridge.css';

function Brand() { return <svg className="pp-logo" viewBox="0 0 112 54" role="img" aria-label="ALT"><text x="4" y="40" fill="currentColor" fontFamily="Georgia,serif" fontSize="47">ALT</text><path d="M3 43 Q29 23 51 37" fill="none" stroke="#d3b980" strokeWidth="3"/></svg>; }
function Radar({ axes }) {
  return <svg className="pp-radar" viewBox="0 0 320 265" role="img" aria-label={`Demo capability scores out of 100: ${axes.map(a=>`${a.label} ${a.score}`).join(', ')}`}>
    {[25,50,75,100].map(score=><polygon key={score} points={radarPoints(axes.map(a=>({...a,score})))} fill="none" stroke="#dce2d5"/>)}
    {axes.map((a,i)=>{const angle=(-90+i*60)*Math.PI/180;return <line key={a.label} x1="160" y1="132" x2={160+Math.cos(angle)*87} y2={132+Math.sin(angle)*87} stroke="#e0e4d9"/>;})}
    <polygon points={radarPoints(axes)} fill="#8a9e6e40" stroke="#7b9162" strokeWidth="2"/>
    {axes.map((a,i)=>{const angle=(-90+i*60)*Math.PI/180,x=160+Math.cos(angle)*119,y=132+Math.sin(angle)*111;return <g key={a.label}><text x={x} y={y} textAnchor="middle" fill="#65766e" fontSize="9">{a.label}</text><text x={x} y={y+14} textAnchor="middle" fill="#294635" fontSize="11" fontWeight="600">{a.score}</text></g>;})}
  </svg>;
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
      <div className="pp-id-card"><div className="pp-id-top"><span className="pp-id-avatar">AC</span><div><strong>Alex Chen</strong><p>Hospitality team member</p></div><span className="pp-id-star">✧</span></div><div className="pp-id-bottom"><span>SHIFT <b>04</b></span><span>DEMO ID <b>ALT–0042</b></span><span>SKILLS <b>2 / 4 verified*</b></span></div></div>
      <button className="pp-share-trigger" onClick={()=>setSharing(true)}><span>▣</span> View & share my passport <span>↗</span></button>
      <section className="pp-capability"><div className="pp-section-heading"><h3>Your capability snapshot</h3><span>DEMO</span></div><Radar axes={axes}/><div className="pp-chart-note"><span></span>Illustrative scores / 100 · not an assessment</div></section>
      <section className="pp-skills"><div className="pp-section-heading"><h3>Your skills</h3><span>4 AREAS</span></div><p className="pp-muted">Tap a skill to explore your learning steps.</p><ul className="alt-learning-modules">{skills.map((skill,index)=><SkillModule key={skill.id} skill={skill} index={index} records={records} onCompleteTask={(id,task)=>setRecords(value=>completeTask(value,id,task))} now={new Date()}/>)}</ul></section>
      <div className="passport-handoff">{reflection && <details><summary>Your shift reflection</summary><p>{reflection}</p></details>}<button onClick={onMission}>See My Next Shift Mission →</button></div>
      <p className="pp-disclaimer">* Mock skill record. Scores and verified labels are examples only; no real assessment or certification.</p>
    </div>
    {sharing && <SharePassport axes={axes} analysed={analysed} onClose={()=>setSharing(false)}/>}
  </div>;
}
