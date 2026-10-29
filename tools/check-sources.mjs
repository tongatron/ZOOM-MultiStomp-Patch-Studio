#!/usr/bin/env node
// Checks that every advice source link still answers.
//   node tools/check-sources.mjs
// Not part of CI: external sites are flaky and some (Cloudflare) refuse scripts. A 403/429 is reported as
// "blocked", not "broken": open those links in a browser before replacing them.

import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SITE = new URL('../site/', import.meta.url);
const ctx = vm.createContext({ console });
const files = ['ms-60b/effects-data.js', 'ms-60b/firmware-data.js', 'zptc.js', 'advice-engine.js', 'ms-60b/advice-rules.js'];
vm.runInContext(`${files.map(f => readFileSync(new URL(f, SITE), 'utf8')).join('\n;\n')}\n;globalThis.ADVICE = ADVICE;`, ctx);
const { ADVICE } = ctx;

const HEADERS = { 'user-agent': 'Mozilla/5.0 (compatible; ms60b-source-check)', accept: 'text/html,application/pdf,*/*' };
async function check(url) {
  try {
    const response = await fetch(url, { redirect: 'follow', headers: HEADERS, signal: AbortSignal.timeout(20000) });
    return { status: response.status, final: response.url };
  } catch (error) {
    return { status: 0, error: error.cause?.code || error.name };
  }
}

const entries = Object.entries(ADVICE.sources);
const results = await Promise.all(entries.map(async ([key, source]) => ({ key, source, ...(await check(source.url)) })));
let bad = 0;
for (const r of results) {
  const kind = r.status >= 200 && r.status < 300 ? 'ok' : r.status === 403 || r.status === 429 ? 'blocked' : 'broken';
  if (kind === 'broken') bad++;
  const moved = r.final && r.final.replace(/\/$/, '') !== r.source.url.replace(/\/$/, '') ? `  → ${r.final}` : '';
  console.log(`${kind === 'ok' ? '✓' : kind === 'blocked' ? '?' : '✗'} ${kind.padEnd(7)} ${String(r.status || r.error).padEnd(6)} ${r.key.padEnd(14)} ${r.source.url}${moved}`);
}
console.log(`\n${results.length} sources, ${bad} broken`);
process.exitCode = bad ? 1 : 0;
