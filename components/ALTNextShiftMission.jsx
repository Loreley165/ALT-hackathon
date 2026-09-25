import React, { useId, useState } from 'react';

export const mockMission = {
  employee: 'Alex Chen', shift: 'Shift 4', targetSkill: 'POS Independent',
  missions: [
    { id: 'dietary', text: 'Handle one dietary enquiry with supervisor support', tag: 'SUPPORTED PRACTICE' },
    { id: 'order', text: 'Complete one modified POS order independently', tag: 'BUILD INDEPENDENCE' },
    { id: 'verification', text: 'Request POS verification', tag: 'SUPERVISOR CHECK-IN' },
  ],
};

/** Stage 3 only: mission planning after the host Passport screen. Import result.css once in the host app. */
export default function ALTNextShiftMission({ data = mockMission, onBack, onSave, initiallySaved = false }) {
  const titleId = useId();
  const [saved, setSaved] = useState(initiallySaved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  async function save() {
    if (!onSave || saving || saved) return;
    setSaving(true); setError('');
    try { await onSave(data); setSaved(true); }
    catch { setError('Could not save on this device. Please try again.'); }
    finally { setSaving(false); }
  }
  return <section className="alt-result" aria-labelledby={titleId}>
    <div className="alt-result__badge">✧ <span>YOUR NEXT SHIFT STARTS HERE.</span></div>
    <h2 id={titleId}>Ready for your next shift<span>.</span></h2>
    <p className="alt-result__intro">Keep these tasks for your next shift, or try again.</p>
    <div className="alt-result__person"><span>{data.employee} · {data.shift}</span><strong>{data.targetSkill}</strong></div>
    <section className="alt-result__missions" aria-label="Next Shift Mission">
      <div className="alt-result__section-label"><span>03</span><h3>Next Shift Mission</h3></div>
      <p className="alt-result__mission-intro">Three small steps for your next shift.</p>
      <ol>{data.missions.map((mission, index) => <li key={mission.id}>
        <span className="alt-result__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <div><p>{mission.text}</p><small>{mission.tag}</small></div>
      </li>)}</ol>
    </section>
    <div className="alt-result__actions">
      <button type="button" className="alt-result__save" onClick={save} disabled={!onSave || saving || saved}>{saved ? '✓ Saved for Next Shift' : saving ? 'Saving…' : 'Save for Next Shift'}</button>
      {onBack && <button type="button" className="alt-result__back" onClick={onBack}>↶ Record Again</button>}
    </div>
    <p className="alt-result__save-status" role="status">{error || (saved ? 'Saved on this device. Ready for your next shift.' : 'Mock tasks · Saved on this device only.')}</p>

  </section>;
}
