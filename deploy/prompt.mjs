// Terminal questions for the set-up scripts (set-mail, set-telegram, add-user). Hidden answers are not echoed.
import { createInterface } from 'node:readline';

export function ask(question, { hidden = false } = {}) {
  return new Promise(resolve => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) rl._writeToOutput = text => { if (text.includes(question)) process.stdout.write(text); };
    rl.question(question, answer => { rl.close(); if (hidden) process.stdout.write('\n'); resolve(answer.trim()); });
  });
}

// Writes a JSON secret file readable only by its owner (atomic: temporary file, then rename).
export async function writeSecret(file, data) {
  const { open, rename } = await import('node:fs/promises');
  const tmp = `${file}.tmp`;
  const handle = await open(tmp, 'w', 0o600);
  await handle.writeFile(JSON.stringify(data, null, 2));
  await handle.close();
  await rename(tmp, file);
}
