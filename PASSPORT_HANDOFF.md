# ALT Skill Passport handoff

The self-contained React app is in `skill-passport/` on the `Alison` branch. It includes shield progress badges, compact task dialogs, monthly review, profile editing, shareable achievement posters, three bottom navigation buttons, and PWA installation/offline support.

The team's existing reflection screen is not redesigned or connected by this upload. The Passport files use a separate directory to avoid conflicts when merging into `main`.

## Public website activation (repository owner)

1. Open repository **Settings → Pages**.
2. Choose **Deploy from a branch**.
3. Select **Alison** and **/ (root)**, then Save.
4. Wait for the Pages build to finish. Open `https://loreley165.github.io/ALT-hackathon/skill-passport/docs/`.

The source repository is public. The app URL is only live after Pages is enabled and deployment succeeds. A collaborator with push access may not have permission to change Pages settings.

After merging into main, select main/root instead. Rebuild future app changes from `skill-passport/` with `npm run build:pages`, then commit source and `docs/` together.

## Validation

- Four learning-model tests and seven browser tests passed.
- Production build passed.
- Nested Pages URL, brand assets, skill dialog and offline reload verified at the matching local subdirectory path.
- GitHub-hosted runtime still requires Pages activation by the repository owner.
