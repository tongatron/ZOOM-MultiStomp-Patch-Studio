// Sets up the Telegram notice sent to the admin when a new user signs up (same bot and chat as PatternMachine).
//   node set-telegram.mjs           asks for the bot token and the chat id, writes telegram.json (mode 600)
//   node set-telegram.mjs --test    sends a test message with the saved settings
// TELEGRAM_FILE overrides the file. Restart the service after the first set-up.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sendTelegram } from './mail.mjs';
import { ask, writeSecret } from './prompt.mjs';

const file = process.env.TELEGRAM_FILE || join(dirname(fileURLToPath(import.meta.url)), 'telegram.json');

if (process.argv.includes('--test')) {
  process.env.TELEGRAM_FILE = file;
  const ok = await sendTelegram('ZOOM Patch Studio: test message. New sign-ups will be notified here.');
  console.log(ok ? 'test message sent' : `not sent: check ${file}`);
  process.exit(ok ? 0 : 1);
} else {
  const token = await ask('Bot token: ', { hidden: true });
  const chatId = await ask('Chat id: ');
  if (!token || !chatId) { console.error('both the token and the chat id are needed'); process.exit(1); }
  await writeSecret(file, { token, chat_id: chatId });
  console.log(`saved in ${file}; try it with: node set-telegram.mjs --test`);
}
