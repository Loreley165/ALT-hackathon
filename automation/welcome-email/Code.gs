const ALT_MAIL = {
  sender: 'hello.alt.team@gmail.com',
  formId: '1mOXBMGKYo53duoq7l3tz6NtNWwLOLMNq3oiiESpE7Kc',
  publicId: '1FAIpQLSecNjKv7QKbNmDYWbfHBmsP8uj9VNtNHJoLabEAjrzNTMd9JQ',
  site: 'https://alt-coral.vercel.app/'
};

function installWelcomeEmails() {
  assertTeamAccount_();
  const form = FormApp.openById(ALT_MAIL.formId);
  if (!form.getPublishedUrl().includes(ALT_MAIL.publicId)) {
    throw new Error('This is not the form linked from the ALT website. No trigger installed.');
  }
  const fields = {};
  form.getItems().forEach(item => {
    const title = item.getTitle().replace(/\s+/g, ' ').trim();
    if (title === 'What should we call you?') fields.name = item.getId();
    if (title === "Let's stay in touch! What's your email?") fields.email = item.getId();
    if (title.startsWith('Can we keep in touch?')) fields.consent = item.getId();
  });
  if (Object.keys(fields).length !== 3) throw new Error('Required form fields were not found.');
  PropertiesService.getScriptProperties().setProperty('ALT_FIELDS', JSON.stringify(fields));
  const existing = ScriptApp.getProjectTriggers().some(t =>
    t.getHandlerFunction() === 'sendAltWelcome' && t.getTriggerSourceId() === ALT_MAIL.formId);
  if (!existing) ScriptApp.newTrigger('sendAltWelcome').forForm(form).onFormSubmit().create();
  console.log('ALT welcome emails enabled for future submissions. Previous responses were not emailed.');
}

function sendAltWelcome(event) {
  assertTeamAccount_();
  if (!event || !event.response) throw new Error('Use the form-submit trigger; do not run this function manually.');
  if (!event.source || event.source.getId() !== ALT_MAIL.formId) throw new Error('Unexpected form.');
  const fields = JSON.parse(PropertiesService.getScriptProperties().getProperty('ALT_FIELDS') || '{}');
  if (!fields.consent) throw new Error('Run installWelcomeEmails first.');
  const answers = {};
  event.response.getItemResponses().forEach(item => answers[item.getItem().getId()] = item.getResponse());
  if (String(answers[fields.consent] || '').trim() !== "Yes, I'd like to hear from ALT.") return;
  const email = String(answers[fields.email] || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email address; nothing sent.');
  const name = String(answers[fields.name] || '').replace(/[\r\n\u0000-\u001f]/g, ' ').trim().slice(0, 100) || 'there';
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email.toLowerCase());
  const key = 'WELCOME_' + Utilities.base64EncodeWebSafe(digest);
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const store = PropertiesService.getScriptProperties();
    if (store.getProperty(key)) return;
    if (MailApp.getRemainingDailyQuota() < 1) throw new Error('Daily email quota reached. Nothing sent.');
    MailApp.sendEmail({to: email, subject: 'You’re on the list — welcome to ALT',
      body: welcomeBody_(name), htmlBody: welcomeHtml_(name), name: 'ALT Team', replyTo: ALT_MAIL.sender});
    store.setProperty(key, new Date().toISOString());
    console.log('One welcome email sent successfully.');
  } finally { lock.releaseLock(); }
}

function sendPreviewToTeam() {
  assertTeamAccount_();
  MailApp.sendEmail({to: ALT_MAIL.sender, subject: '[TEST] You’re on the list — welcome to ALT',
    body: welcomeBody_('Emma'), htmlBody: welcomeHtml_('Emma'), name: 'ALT Team', replyTo: ALT_MAIL.sender});
  console.log('Preview sent only to the ALT team mailbox.');
}

function welcomeBody_(name) {
  return `Hi ${name},\n\nThanks for joining the ALT waitlist.\n\nWe’re building a clearer start for hospitality teams—turning everyday experience into practical next steps and visible progress.\n\nWe’ll keep you posted on product updates and opportunities to try ALT as it develops.\n\nExplore ALT: ${ALT_MAIL.site}\n\nHave an idea or a question? Just reply—we’d love to hear from you.\n\nThe ALT Team\nAlign · Learn · Thrive\n\nPrefer not to receive updates? Reply “unsubscribe”.`;
}

function assertTeamAccount_() {
  if (Session.getEffectiveUser().getEmail().toLowerCase() !== ALT_MAIL.sender) {
    throw new Error('Sign in with hello.alt.team@gmail.com to send from the team mailbox.');
  }
}

function welcomeHtml_(name) {
  const safeName = String(name).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#f4f3ed;color:#293339;font-family:Arial,Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">You’re on the ALT waitlist. A clearer start for hospitality teams.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3ed;"><tr><td align="center" style="padding:28px 14px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#fffefa;border:1px solid #e5e2d7;border-radius:20px;overflow:hidden;">
<tr><td style="background:#293339;padding:14px 28px;"><a href="${ALT_MAIL.site}" style="text-decoration:none;"><img src="${ALT_MAIL.site}assets/brand-lockup.png" alt="ALT — Align · Learn · Thrive. From Experience to Evidence." width="216" height="81" style="display:block;border:0;width:216px;max-width:100%;height:auto;"></a></td></tr>
<tr><td style="padding:32px 28px 28px;">
<p style="margin:0 0 22px;font-size:10px;line-height:1.5;letter-spacing:2px;color:#8b7852;font-weight:bold;">YOU’RE ON THE LIST</p>
<h1 style="font-size:36px;line-height:1.12;letter-spacing:-1.3px;font-weight:600;margin:0 0 25px;color:#293339;">A clearer start.<br>A shared journey.</h1>
<p style="margin:0 0 14px;font-size:17px;line-height:1.65;color:#293339;">Hi ${safeName},</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:#5e6867;">Thanks for joining the <strong style="color:#293339;">ALT waitlist.</strong></p>
<p style="margin:0 0 22px;font-size:15px;line-height:1.75;color:#5e6867;">We’re building a clearer start for hospitality teams—turning everyday experience into practical next steps and visible progress.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:18px 20px;background:#edf1e4;border-radius:12px;border-left:3px solid #bfcda8;"><p style="margin:0 0 7px;font-size:10px;letter-spacing:1.3px;font-weight:bold;color:#73835c;">WHAT HAPPENS NEXT</p><p style="margin:0;font-size:14px;line-height:1.7;color:#4f5b4a;">We’ll keep you posted on product updates and opportunities to try ALT as it develops.</p></td></tr></table>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:25px 0;"><tr><td style="border-radius:28px;background:#c8d5b4;"><a href="${ALT_MAIL.site}" style="display:inline-block;padding:15px 25px;color:#293339;font-size:14px;font-weight:bold;text-decoration:none;border:1px solid #c8d5b4;border-radius:28px;">Explore ALT &nbsp; ↗</a></td></tr></table>
<p style="margin:0 0 21px;font-size:14px;line-height:1.75;color:#5e6867;">Have an idea or a question? <a href="mailto:${ALT_MAIL.sender}" style="color:#a45f45;text-decoration:underline;text-underline-offset:3px;">Just reply</a>—we’d love to hear from you.</p>
<p style="margin:0;font-size:14px;line-height:1.65;color:#293339;"><strong>The ALT Team</strong><br><span style="font-size:11px;letter-spacing:1px;color:#8b7852;">ALIGN · LEARN · THRIVE</span></p>
</td></tr>
<tr><td style="border-top:1px solid #e8e5da;padding:18px 28px;"><p style="margin:0;font-size:11px;line-height:1.8;color:#808680;">You received this because you signed up for ALT updates.<br>Prefer not to receive updates? Reply <a href="mailto:${ALT_MAIL.sender}?subject=Unsubscribe%20from%20ALT%20updates" style="color:#808680;text-decoration:underline;">“unsubscribe”</a>.</p></td></tr>
</table>
<p style="font-size:11px;line-height:1.7;color:#8a8f88;margin:18px 0 0;">From Experience to Evidence.<br><a href="mailto:${ALT_MAIL.sender}" style="color:#8a8f88;text-decoration:none;">${ALT_MAIL.sender}</a></p>
</td></tr></table></body></html>`;
}
