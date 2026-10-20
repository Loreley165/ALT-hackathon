# ALT showcase edition

English, light visual design. Built on the existing ALT repository, with the original components and standalone prototype retained.

## Screen links

- `/`: product overview
- `/?page=game`: continuous visitor experience
- `/?page=welcome`: iPad invitation, QR and direct-play entry
- `/?page=reel`: automatic 32.5-second desktop loop with pause and full-screen controls
- `/?page=team`: Alison / Yuchen Jiang, Loreley / Xin Li, Tommy / Tao-rong Sun, in the requested order. Full names and concise project-relevant introductions; no invented portraits.
- `/prototype-original.html`: preserved original prototype

## Run and build

Serve the directory using a local static HTTP server. ES modules require HTTP rather than opening files directly.

`npm test` runs the game-result branch tests without dependencies.
`npm run build` creates `dist/` without dependencies. Existing Vercel configuration builds this directory.

The original React source is retained. `npm run build:legacy` and `npm run test:legacy` require the original package dependencies.

## Demo behaviour

- Three rounds: first table (8s read / 12s choose), revised coffee order (8s / 15s), lunch rush (10s / 18s). Ten scored details in total.
- Correct/incorrect/missing answers produce different reflections and next-step tasks.
- The confirmed reflection carries unchanged to the Passport and manager review.
- Manager action verifies a fictional activity record, never a qualification.
- Results live only in the page's memory. Reset/reload clears them; devices do not share records.
- Analysis uses explicit game-result rules, not an AI API. Editing the reflection changes its displayed record, not the rule-based task recommendation.
- Feedback and team email reuse Tommy's committed destinations. Confirm the form's final wording and email ownership before the showcase.
- QR is generated locally from the current published origin. Loopback previews deliberately do not advertise a phone-scannable QR.
- No visitor data is sent to an AI service; Google Forms opens only when the visitor selects feedback.

## Remaining content

Tommy’s full LinkedIn biography and any further Alison biography remain pending readable source material. Loreley’s communications/content background is supported by the public LinkedIn profile summary. Team project contributions are based on the existing source history. No unverified employment details, customer evidence or performance statistics are included.

## Third-party asset

`vendor/qrcode.js`: qrcode-generator 1.4.4 by Kazuhiko Arase, MIT licence (notice retained in source).

## Brand alignment

Printed A3 poster is the fixed reference: official ALT mark, charcoal/navy, terracotta and From Experience to Evidence. The light website uses this identity; product views retain navy headers, ivory content, muted gold accents and olive learning states from the existing prototype. Logo assets are exact crops of supplied artwork, not recreated wordmarks. The original PDF and supplied files remain unchanged.

## Product story revision

Homepage: audience, problem, employee/manager value, four workflow steps, three benefits and calls to action. Four manually selectable product screens: reflection, Passport, next shift and manager review. Production-process captions removed.

## Chaptered visitor journey

1. Restaurant challenge: timed disappearing speech in three rounds, with service/rush pace. The game is promotional, not a product feature.
2. Employee demo: a prefilled record, illustrative analysis, Passport and next step.
3. Manager demo: received verification request, sample shift roster/skill matrix, review queue, next-shift plan, confirm or return with guidance.
4. Feedback: a prominent link to the existing Google Form. No response is submitted automatically.

The product demo also has a direct `?page=demo` entry using a sample reflection. The promotional game flows to the same chapters while retaining the visitor's score and reflection.

Team page: large A/L/T marks explain Align/Learn/Thrive, not artificial portraits. Alison is described as a Wine and Food Business student, based on supplied information.

Commercial information: availability/pricing section states pricing is not set; roadmap separates prototype from development directions and longer-term ambitions. No invented prices, customers or release dates.


## Shared leaderboard (rush-v2)
- Run `node dev-server.mjs` for a local API + SQLite preview on port 5174. SQLite lives in /tmp and is not packaged.
- Deploy the entire project root to Vercel, including api/ and server/; dist/ alone cannot host the API.
- Connect an Upstash Redis database and set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel server environment variables. Optional LEADERBOARD_SECRET overrides token-derived session signing. Never put credentials in browser files. Redeploy after setting variables.
- The board is not live online until configured and deployed. No offline results are silently labelled shared.
- Difficulty boards are separate; 15 details, server-scored answers, total elapsed shift time breaks ties. Signed sessions expire after 30 minutes; duplicate finish requests retain the original score.
- Public nickname is optional, limited to 24 characters. Only nickname, score, difficulty and elapsed time are displayed. No email is requested by the game.
- A local preview session is clearly labelled and separate from production scores. Feedback form unchanged.
- Verification: node --test tests/showcase.test.mjs tests/leaderboard.test.mjs.
