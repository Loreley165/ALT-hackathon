import React, { useEffect, useRef, useState } from 'react';
import { passportArt, passportPNG, svgUrl } from './passport-art.js';
import './profile.css';

export default function ProfileScreen({ onPassport, analysed = false }) {
  const [open,setOpen]=useState(false);
  return <section className="alt-profile">
    <div className="profile-topline"><span>YOUR SPACE</span><span>ALT / 0042</span></div>
    <div className="profile-identity"><span className="profile-portrait">AC<span>✧</span></span><h1>Alex Chen</h1><p>Hospitality team member</p><span className="profile-level">Level 2 · Service Explorer</span></div>
    <div className="profile-stats"><div><strong>04</strong><span>Current shift</span></div><div><strong>02</strong><span>Verified skills*</span></div><div><strong>04</strong><span>Skills tracked*</span></div></div>
    <button className="profile-passport-card" onClick={()=>setOpen(true)}><span className="passport-mini" aria-hidden="true">ALT<br/><span>✧</span><small>SKILL PASSPORT</small></span><span><small>TAKE YOUR GROWTH WITH YOU</small><strong>Your Skill Passport</strong><span>A shareable snapshot of your skills.</span><b>Preview & share ↗</b></span></button>
    <div className="profile-section-heading"><h2>My development</h2><span>SHIFT 4</span></div>
    <button className="profile-row" onClick={onPassport}><span className="profile-row-icon">◎</span><span><strong>POS Independent</strong><small>Your current learning focus</small></span><span>→</span></button>
    <div className="profile-focus"><span>KEEP BUILDING CONFIDENCE</span><p>Every shift adds a little more to your story.</p><div><i/></div><small>2 of 4 skills verified · demo progress</small></div>
    <p className="profile-disclaimer">* Demo profile and skill records. No account or employer verification is connected.</p>
    {open && <SharePassport analysed={analysed} onClose={()=>setOpen(false)}/>}
  </section>;
}
function SharePassport({onClose,analysed}) {
  const ref=useRef(null), svg=passportArt('Alex Chen', analysed ? 'Ready for verification' : 'Practising');
  const [blob,setBlob]=useState(null),[status,setStatus]=useState('Preparing your passport…'),[busy,setBusy]=useState(false);
  useEffect(()=>{const prior=document.activeElement;ref.current.showModal();let active=true;passportPNG(svg).then(b=>{if(active){setBlob(b);setStatus('Ready to save or share.');}}).catch(()=>{if(active)setStatus('PNG is unavailable here. Download the SVG instead.');});return()=>{active=false;prior?.focus?.();};},[]);
  function download(file,ext) { const url=URL.createObjectURL(file);const a=document.createElement('a');a.href=url;a.download=`Alex-Chen-Skill-Passport.${ext}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);setStatus('Passport downloaded.'); }
  async function share() { if(!blob)return;const file=new File([blob],'Alex-Chen-Skill-Passport.png',{type:'image/png'});if(!navigator.canShare?.({files:[file]})){download(blob,'png');return;}setBusy(true);try{await navigator.share({title:'Alex Chen · ALT Skill Passport',files:[file]});setStatus('Share completed.');}catch(e){setStatus(e.name==='AbortError'?'Sharing cancelled.':'Could not share. You can download the image instead.');}finally{setBusy(false);} }
  const canShare=!!blob && !!navigator.canShare?.({files:[new File([blob],'passport.png',{type:'image/png'})]});
  return <dialog ref={ref} className="passport-share-dialog" aria-labelledby="share-title" onCancel={e=>{e.preventDefault();onClose();}}><div className="share-header"><div><small>YOUR PORTABLE PROFILE</small><h2 id="share-title">Ready to share.</h2></div><button onClick={onClose} aria-label="Close passport preview">×</button></div><img className="share-art" src={svgUrl(svg)} alt="Alex Chen Skill Passport. Six-axis demo chart: Guest service 82, menu knowledge 78, POS 72, allergen handling 38, communication 76, teamwork 84. All values are illustrative."/><div className="share-actions"><button disabled={!blob||busy} onClick={share}>{canShare?'Share Passport ↗':'Save Passport Image ↓'}</button><button onClick={()=>download(blob||new Blob([svg],{type:'image/svg+xml'}),blob?'png':'svg')}>{blob?'Download PNG':'Download SVG'}</button></div><p role="status">{status}</p><p className="share-footnote">Demo scores, not an official credential. You choose where to share.</p></dialog>;
}
