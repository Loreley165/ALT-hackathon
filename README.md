# ALT employee MVP

A dependency-free, responsive phone mockup with a navy header, gold details and warm white content matching the supplied Skill Passport reference for Alex Chen, Shift 4, targeting POS Independent.

Run `python3 -m http.server 5173 --bind 127.0.0.1` from this folder and open http://127.0.0.1:5173.

- `index.html`: employee home and integration point for future components.
- `styles.css`: light content area, dark upper section, and a rounded phone frame with an internally scrolling screen.
- `app.js`: input modes, validation and local demo analysis. Replace `analyseShift` with the real analysis service later.

The first screen defaults to a large microphone. “Can’t talk right now? Type instead” opens a native modal dialog with text input and selectable answers. Closing the dialog preserves input. A preview allows review before the small pill-shaped “Update My Skill Passport” button. Opening text input stops recording. “Didn’t use the POS” is exclusive with other picks.

Voice uses browser SpeechRecognition where available, requests microphone access only on record, and allows transcript editing. Recognition may use the browser vendor's remote speech service. English (Australia) is the recognition language. Unsupported browsers and microphone/network errors show a fallback message. Use localhost or HTTPS for microphone access.

No backend or persistence. Content clears on reload. Analysis remains a labelled local demo and does not assess skills. Skill Passport and Next Mission are out of scope.

Validation: JavaScript interaction checks passed for blank input, multi-select/exclusivity, combined text, mocked voice transcript/stop/errors, stale callbacks and unsupported browsers. Actual microphone recognition and visual inspection could not be tested because browser automation's security-policy verification was unavailable.

Mockup: CSS iPhone 17 front view, using Apple’s published 71.5 × 149.6 mm body proportions (https://www.apple.com/iphone-17/specs/). Includes simulated hardware keys, Dynamic Island, fixed status bar and home indicator. This is an interactive web mockup, not an official Apple device render.
