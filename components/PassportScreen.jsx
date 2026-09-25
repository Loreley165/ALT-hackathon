import React, { useState } from 'react';
import SkillPassport, { initialSkills } from '../skill-passport/src/SkillPassport.jsx';
import { seedRecords, completeTask } from '../skill-passport/src/learning.js';
import './passport-bridge.css';

export default function PassportScreen({ analysed, reflection, onMission }) {
  const [records, setRecords] = useState(() => seedRecords(analysed ? 'updated' : 'current'));
  const [notice, setNotice] = useState('');
  const skills = initialSkills.map(skill => ({ ...skill, status: analysed && skill.id === 'pos' ? 'Ready for Verification' : skill.status }));
  return <div className="passport-integration">
    <SkillPassport learnerName="Alex Chen" role="Shift 4 · Hospitality team member" skills={skills}
      learningRecords={records} onCompleteTask={(skillId, taskId) => setRecords(value => completeTask(value, skillId, taskId))}
      onRequestVerification={async () => setNotice('Demo request recorded for this session. No supervisor notification was sent.')}/>
    <div className="passport-handoff">
      {reflection && <details><summary>Your shift reflection</summary><p>{reflection}</p></details>}
      <p className="passport-mock">MOCK ANALYSIS · Demo skill statuses, not a real AI assessment.</p>
      {notice && <p role="status">{notice}</p>}
      <button type="button" onClick={onMission}>See My Next Shift Mission →</button>
    </div>
  </div>;
}
