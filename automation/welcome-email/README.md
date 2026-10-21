# ALT welcome email

The installed Google Apps Script project is `ALT — Waitlist Welcome Emails`, managed by hello.alt.team@gmail.com. This directory backs up its current source and HTML preview; changing these files alone does not update the installed script.

The form-submit trigger sends a personalised welcome only to respondents who explicitly consent to ALT updates. Each email address receives one welcome. Previous responses are not processed. A plain-text alternative accompanies the HTML email.

`installWelcomeEmails` validates the published form URL, maps the required fields and installs one trigger without duplicating it. `sendPreviewToTeam` sends a clearly labelled test only to the team mailbox. The script checks that the effective sending account is the team account. No credentials are stored here.

Verification: submitted an `ALT Test` response using the team mailbox and confirmed that the automatic email arrived with the correct greeting and sender. The current HTML design was subsequently tested using the team-only preview function and visually checked in Gmail.
