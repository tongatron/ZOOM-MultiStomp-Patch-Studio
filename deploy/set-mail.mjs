// Sets up the email of the ZOOM Patch Studio (Gmail, like PatternMachine): welcome and new-password emails.
// On the server, next to server.mjs:
//   node set-mail.mjs                        asks for the Gmail address and its app password, writes mail.json (mode 600)
//   node set-mail.mjs --test you@example.com sends a test email with the saved settings
// An app password comes from Google Account > Security > 2-Step Verification > App passwords (the one of
// PatternMachine works too). MAIL_FILE overrides the file. Restart the service after the first set-up.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMessage, mailConfig, mailHtml, smtpSend } from './mail.mjs';
import { ask, writeSecret } from './prompt.mjs';

const file = process.env.MAIL_FILE || join(dirname(fileURLToPath(import.meta.url)), 'mail.json');
const testTo = process.argv[process.argv.indexOf('--test') + 1];

if (process.argv.includes('--test')) {
  const cfg = mailConfig(file);
  if (!cfg || !testTo) { console.error(cfg ? 'usage: node set-mail.mjs --test you@example.com' : `no settings in ${file}`); process.exit(1); }
  const text = 'If you can read this, the emails of ZOOM Patch Studio work.';
  await smtpSend(cfg, testTo, buildMessage({ from: cfg.user, fromName: cfg.fromName, to: testTo, subject: 'ZOOM Patch Studio: test email', text,
    html: mailHtml({ title: 'Test email', intro: text }) }));
  console.log('test email sent to', testTo);
} else {
  const user = await ask('Gmail address that sends: ');
  const appPassword = (await ask('App password (16 letters, spaces do not matter): ', { hidden: true })).replace(/\s/g, '');
  if (!user || !appPassword) { console.error('both the address and the app password are needed'); process.exit(1); }
  await writeSecret(file, { user, app_password: appPassword, from_name: 'ZOOM Patch Studio', host: 'smtp.gmail.com', port: 465 });
  console.log(`saved in ${file}; try it with: node set-mail.mjs --test you@example.com`);
}
