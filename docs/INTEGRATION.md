# ALT employee demo

Employee reflection and mock Next Shift Mission screen (stage 3), displayed inside an iPhone 17-style web mockup. Alex Chen · Shift 4 · POS Independent.

## Run

The checked-in `result-ui.js` bundle is ready to serve. Run `python3 -m http.server 5173 --bind 127.0.0.1` and open http://127.0.0.1:5173. No API key or backend is needed.

For development: `pnpm install`, `pnpm build`, `pnpm test`. Commit `result-ui.js` after rebuilding.

## Demo

Tap **Try demo**, review the prepared reflection, then tap **Update My Skill Passport**. Evidence appears at 0.9 seconds, strengths/development at 1.8 seconds, and the teammate’s React Skill Passport opens at 2.7 seconds. The integrated stage-2 Skill Passport from origin/Alison opens first. Its “See My Next Shift Mission” button then opens stage 3. Return to the reflection without losing input.

The Mission screen displays three next-shift tasks only. Evidence shown in the transition is not a replacement for the separate Passport capability analysis. The Passport menu opens the integrated teammate page. All results are illustrative regardless of input; no skill records or verification requests are submitted.

The default input is voice. “Type instead” opens text and selectable answers. Browser speech recognition may use the browser vendor's remote speech service, only after tapping the microphone; that service is unrelated to the mock analysis. Unsupported browsers can use text or Try demo. English (Australia) is the recognition language. Nothing persists after reload.

## React integration

See `components/README.md`. `ALTNextShiftMission.jsx` and `result.css` are standalone; the data and optional back callback are props. `mount.jsx` bridges React into the current HTML app.

## Validation

`pnpm test` covers actual React server rendering, custom props and text escaping, unique accessible heading IDs, and a Happy DOM integration test running the built React bundle through the complete demo and back navigation. It also asserts there are no analysis API requests. Browser automation was blocked by security-policy verification, so visual inspection and real microphone testing remain unverified.

Mockup proportions reference Apple's published iPhone 17 dimensions: https://www.apple.com/iphone-17/specs/. This is a code-drawn interactive mockup, not an official device render.

## Teammate integration

Imported `skill-passport/` from `origin/Alison` at `ce9a50f`. `components/PassportScreen.jsx` adapts her reusable SkillPassport with Alex Chen, the reflection text, mock statuses, task dialogs and a continue-to-mission callback. The original teammate source is preserved; only a new adapter is used. Passport renders in a Shadow DOM with `result-ui.css` to keep its styles from conflicting with the existing app. There is one phone frame and one bottom navigation. Rebuild with `node build.mjs` and run `node --test tests/result.test.mjs` after dependencies are installed.

Flow: reflection → 2.7s analysis → Skill Passport → Next Shift Mission. All analysis remains mock; task completion and verification requests are session-only demo interactions.
