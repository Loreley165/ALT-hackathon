# ALT Skill Passport — learning app

[Source repository — Alison branch](https://github.com/Loreley165/ALT-hackathon/tree/Alison/skill-passport)

A responsive React PWA that keeps the original navy, ivory and gold passport design. Uses the supplied ALT artwork. No runtime UI, icon, image-export or backend dependencies beyond React.

## Run and install

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run build
npm run preview -- --port 4173
```

Open `http://localhost:4173`. Development mode: `npm run dev`. Service workers run only in the production build/preview.

Use **Install app** in a supported desktop/Android browser. On iPhone/iPad use Safari → Share → Add to Home Screen. Installation is browser-managed; the interface provides instructions when a programmatic prompt is unavailable. A phone needs an HTTPS deployment URL; your computer's localhost URL is not a remotely accessible address.

The production build is checked in at `skill-passport/docs/`. To publish this branch, the repository owner can enable GitHub Pages with branch `Alison` and folder `/ (root)`. The app will then be available at https://loreley165.github.io/ALT-hackathon/skill-passport/docs/. Publication is not enabled by uploading source alone. To update it, run `npm run build:pages`, commit `docs/` along with the source, then push. Relative asset paths and scoped service-worker caching support the repository subdirectory. You can also deploy the entire `dist/` directory to an HTTPS static host. The build creates a manifest, launcher/apple icons and a service worker that precaches the app and artwork for offline use. The first visit must be online. After a deployment, close all app tabs/windows and reopen to activate a waiting version. For a different static subdirectory, use `npm run build:pages`; its relative paths work without a hard-coded repository name.

The preview uses an iPhone 17 inspired shell with a simulated Dynamic Island, status bar, dark bezel and home indicator. Passport begins immediately below the status bar; the former navigation header and introductory content are hidden. Shields fill as learning progresses, without individual background cards. The three Passport / Today / Profile controls remain fixed inside the bottom of the frame. Installed standalone mode removes simulated device chrome. A 390×844 homepage fits the entire badge collection and verification action. Task dialogs are at most 326px wide and 68% of the viewport height, leaving the passport visible behind a light overlay. Task dialogs support Escape, focus restoration and native modal focus containment.

## Learning behavior

- Each of four skills is a badge in a compact 2×2 grid. Its olive fill shows the fraction of currently completed steps. Click a badge to open a small modal showing a compact progress overview and only the current task. Reviews take priority, then the first unfinished task. Completing it advances automatically. Fully completed skills show an all-done summary and the next review date; the homepage never expands. These are demo learning content, to be reviewed against the venue's training materials before production use.
- Light orange: not yet complete. Olive green: complete. Light red: monthly review due. Both steps and module summaries use text and color.
- A review is due one **calendar month** after completion or last review, at the same local time. Month-end dates clamp to the last day of the next month; Jan 31 becomes Feb 28/29. Completing a review starts a new monthly cycle.
- The app checks dates on load, focus and every 30 seconds while open. Reminders are in-app; this does not send background push notifications.
- Learning completion and supervisor verification are separate. Completing every step makes an unverified skill Ready for Verification. Verified history stays Verified even when practice is due for review.
- Existing Current / Updated snapshots remain under **Profile → Explore demo states**, with independent saved progress. Guest Interaction and Menu Knowledge start verified. Updated POS starts ready, and Dietary & Allergens starts practising.
- Supervisor requests are recorded locally by a demo callback. No supervisor receives a message.

## Today, profile and posters

Use the bottom navigation on mobile or the desktop tabs to open Passport / Today / Profile. Profile supports a name and a local image upload (JPG/PNG/WebP, max 5 MB), centre-cropped and resized to 256px. No image is uploaded to a server.

The demo level is derived from verified skills: 0–1 → Level 1, 2–3 → Level 2, 4 → Level 3. Replace `levelFor` with your actual level policy when integrating.

Completing a whole module opens the poster automatically. After any completed or reviewed step, it can also be generated from Today. The PNG includes the current profile name, level, avatar, local date and **only today's completed/reviewed tasks**. Previously seeded practice is not presented as work done today. Download PNG works offline; native file sharing is used only when the browser supports it. Otherwise users can download and share the image manually.

Progress, profile and activity are stored in `localStorage` on this browser. Refreshing retains them. Clearing browser data removes them. No accounts, server database or cross-device sync are connected.

## Reuse the component

Copy these files to the host app: `SkillPassport.jsx`, `SkillPassport.css`, `SkillModule.jsx`, `learning.js`, `learning.css`, `badges.css`, `BrandLogo.jsx`, `brand.css`. Copy `public/brand/alt-brand-board.png` to the host's `/brand/` public directory or change the URL in `BrandLogo.jsx`. For posters also copy `AchievementPoster.jsx`, `poster.js` and the `.alt-poster-*` / `.app-*` dialog styles from `app.css`.

```jsx
import SkillPassport, { updatedSkills } from './SkillPassport';
import { completeTask, seedRecords } from './learning';

const [records, setRecords] = useState(() => seedRecords('updated'));

<SkillPassport
  skills={updatedSkills}
  learnerName="Alex Morgan"
  avatar=""
  level="Level 2 · Service Explorer"
  learningRecords={records}
  onCompleteTask={(skillId, taskId) => {
    setRecords(current => completeTask(current, skillId, taskId));
  }}
  onRequestVerification={async payload => {
    const response = await fetch('/api/verification-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Request failed');
  }}
/>
```

The example API must be implemented by the host. The callback receives `{ learnerName, passportId, skills }`, with only ready skills. Resolve for success; throw/reject for a retryable error. Without a callback or eligible skills the button is disabled. `requested` initializes an already-requested state. Change the component `key` when starting a new verification cycle or changing learners. The host owns `skills` and should derive/update statuses from its policy; the component does not mutate them. Omitting `learningRecords` preserves the original compact passport list.

The supplied icon assets are prepared from the user's brand board; the wordmarks use exact viewports of the original artwork, not recreated lettering.

## Reflection analysis / team B

The standalone `analyseReflection(text)` module is on the separate local branch `codex/analysis-reflection` and worktree `../alt-analysis-b`. It returns the agreed five fields, without changing this app's design. See that branch's `ANALYSIS_INTERFACE.md` for the A → B → Skill Passport / Next Mission connection and conservative state guards. The module is a local rule-based MVP, not a language model or supervisor assessment. It has not been merged into this interface; A's reflection screen was not supplied here.

## Validation

With Google Chrome installed:

```sh
npm run build
npm test
```

Four model tests check calendar-month/leap-year boundaries, monthly refresh, local-day filtering and module-state priority. Seven browser tests check both snapshots, verification persistence, learning progress, poster PNG download, unsupported-share fallback, profile photo/name, keyboard/mobile layouts at 320/390px, PWA assets and offline reload. Screenshots are saved under `screenshots/`.

To use bundled Chromium instead of Chrome, remove `channel: 'chrome'` from `playwright.config.js` and run `npx playwright install chromium`.
