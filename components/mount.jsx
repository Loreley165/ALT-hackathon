import React from 'react';
import { createRoot } from 'react-dom/client';
import ALTNextShiftMission, { mockMission } from './ALTNextShiftMission.jsx';
import PassportScreen from './PassportScreen.jsx';
let missionRoot, passportRoot;
window.ALTMissions = {
  show(container, onBack) {
    missionRoot ||= createRoot(container);
    let initiallySaved = false;
    try { const saved = JSON.parse(localStorage.getItem('alt-next-shift-mission-v1')); initiallySaved = saved?.employee === mockMission.employee && JSON.stringify(saved.missions) === JSON.stringify(mockMission.missions); } catch {}
    missionRoot.render(<ALTNextShiftMission key={String(initiallySaved)} onBack={onBack} initiallySaved={initiallySaved} onSave={data => {
      localStorage.setItem('alt-next-shift-mission-v1', JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
      window.dispatchEvent(new Event('alt-mission-saved'));
    }}/>);
  }
};
window.ALTPassport = {
  show(container, props) {
    if (!passportRoot) {
      const shadow = container.attachShadow({ mode: 'open' });
      const style = document.createElement('link');
      style.rel = 'stylesheet'; style.href = new URL('result-ui.css', document.baseURI).href;
      const mount = document.createElement('div');
      shadow.append(style, mount);
      passportRoot = createRoot(mount);
    }
    passportRoot.render(<PassportScreen key={String(props.analysed)} {...props}/>);
  }
};
