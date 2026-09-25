# Stage 3: ALT Next Shift Mission

This component is only the third screen. It does not implement the teammate-owned Skill Passport, AI capability analysis, or evidence display.

Full product flow: reflection → analysis transition → Skill Passport (teammate) → Next Shift Mission.
Current demo: reflection → transition → Alison’s integrated Passport → mission.

Copy `ALTNextShiftMission.jsx` and `result.css` into a React app (React 18+):

```jsx
import ALTNextShiftMission, { mockMission } from './ALTNextShiftMission';
import './result.css';

<ALTNextShiftMission data={mockMission} onBack={() => setScreen('reflection')} />
```

Props: `data` defaults to mockMission (`employee`, `shift`, `targetSkill`, `missions`); optional `onBack` handles Record Again. No API or router. Optional onSave(data) may return a Promise; initiallySaved sets the initial saved state. Storage belongs to the host adapter. CSS uses scoped class names and accessible headings use React useId.

`mount.jsx` bridges the component into this HTML app. The 2700ms transition now calls `showPassport()`. Its continue callback calls `showMissions()` to open stage 3. Another React app can use its own router and render the component directly.

`ALTAnalysisResult.jsx` is a compatibility re-export only. New integrations should use ALTNextShiftMission. The mock tasks do not submit requests or update skill records.

The demo adapter saves mock next-shift tasks under localStorage key `alt-next-shift-mission-v1`. Save failures show an error and allow retry. Record Again clears only the current reflection, not saved missions.
