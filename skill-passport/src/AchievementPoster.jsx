import React, { useEffect, useRef, useState } from 'react';
import { renderPoster } from './poster';
import { Icon } from './SkillPassport';

export default function AchievementPoster({ profile, level, activities, onClose }) {
  const dialog = useRef(null);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => { const previous = document.activeElement; dialog.current.showModal(); return () => previous?.focus?.(); }, []);
  useEffect(() => {
    let active = true; let url;
    setImage(null); setMessage('');
    renderPoster({ profile, level, activities }).then(blob => { if (active) { url = URL.createObjectURL(blob); setImage({ blob, url }); } }).catch(() => { if (active) setMessage('Could not create your poster. Please try again.'); });
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [profile, level, activities, retry]);
  async function share() {
    try {
      const file = new File([image.blob], 'ALT-today.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: 'My ALT Skill Passport', text: 'Small steps. Real capability.' }); setMessage('Poster shared.'); }
      else { setMessage('Image sharing is not available here. Download the PNG to share it in your favourite app.'); }
    } catch (error) { if (error.name !== 'AbortError') setMessage('Sharing did not complete. You can download the PNG instead.'); }
  }
  return <dialog ref={dialog} className="alt-poster-dialog" aria-labelledby="poster-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === dialog.current) onClose(); }}>
    <div className="alt-poster-dialog__header"><div><span className="app-eyebrow">YOUR PROGRESS, WORTH SHARING</span><h2 id="poster-title">Today looks good on you.</h2></div><button className="app-icon-button" aria-label="Close poster" onClick={onClose}>×</button></div>
    {image ? <img className="alt-poster-image" src={image.url} alt={`Today's learning poster for ${profile.name}, ${level}. ${activities.length} completed or reviewed tasks: ${activities.map(a => a.title).join(', ')}.`}/> : <div className="alt-poster-loading">{message || 'Creating your poster…'}{message && <button onClick={() => setRetry(value => value + 1)}>Try again</button>}</div>}
    <div className="alt-poster-actions"><a className={`app-primary ${!image ? 'app-disabled' : ''}`} href={image?.url} download="ALT-today.png" aria-disabled={!image} onClick={event => { if (!image) event.preventDefault(); }}>Download PNG <Icon name="arrow"/></a><button className="app-secondary" onClick={share} disabled={!image}>Share poster</button></div><p className="app-help" role="status">{message || 'Includes only tasks completed or reviewed today.'}</p>
  </dialog>;
}
