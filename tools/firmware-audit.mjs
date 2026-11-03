#!/usr/bin/env node
// Static firmware/effect audit. It never writes to the supplied firmware and never attempts to flash a pedal.
//
//   node tools/firmware-audit.mjs --catalog all
//   node tools/firmware-audit.mjs ms-60b /path/to/updater-or-zip
//   node tools/firmware-audit.mjs ms-50g /path/to/extracted --strict --json

import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const SITE = join(ROOT, 'site');
const SOURCES = JSON.parse(readFileSync(join(ROOT, 'firmware', 'sources.json'), 'utf8'));
const PEDALS = Object.keys(SOURCES);
const SKIP_EXTENSIONS = new Set(['.txt', '.md', '.pdf', '.html', '.json', '.xml', '.csv', '.log']);
const MAX_INPUT_BYTES = 256 * 1024 * 1024;

function usage() {
  console.log('Usage: node tools/firmware-audit.mjs --catalog <ms-60b|ms-50g|ms-70cdr|all> [--json]');
  console.log('       node tools/firmware-audit.mjs <pedal> <directory|zip|updater> [--strict] [--json]');
}

function parseArgs(args) {
  const flags = new Set(args.filter(arg => arg.startsWith('--')));
  const positional = args.filter(arg => !arg.startsWith('--'));
  if (flags.has('--help') || flags.has('-h')) return { help: true };
  if (args[0] === '--catalog') return { catalog: args[1] || 'all', flags };
  return { pedal: positional[0], input: positional[1], flags };
}

function loadProfile(pedal) {
  const context = vm.createContext({});
  const files = [`${pedal}/pedal.js`, `${pedal}/firmware-data.js`];
  const source = files.map(file => readFileSync(join(SITE, file), 'utf8')).join('\n;\n');
  vm.runInContext(`${source}\n;globalThis.auditProfile={PEDAL,FIRMWARE_DATA};`, context);
  const profile = JSON.parse(JSON.stringify(context.auditProfile));
  const effects = profile.FIRMWARE_DATA.filter(Boolean).map(row => ({
    dsp: row[0],
    name: row[1],
    id: Number.parseInt(row[2], 16),
    file: row[3],
    version: row[4]
  }));
  return { ...profile.PEDAL, effects };
}

function u32le(bytes, offset) {
  return (bytes[offset] | bytes[offset + 1] << 8 | bytes[offset + 2] << 16 | bytes[offset + 3] << 24) >>> 0;
}

function ascii(bytes, start, length) {
  return String.fromCharCode(...bytes.subarray(start, start + length)).replace(/[\0 ]+$/g, '').trim();
}

function findTag(bytes, tag, from = 0) {
  const needle = Buffer.from(tag, 'ascii');
  for (let i = from; i <= bytes.length - needle.length; i++) {
    let match = true;
    for (let j = 0; j < needle.length; j++) if (bytes[i + j] !== needle[j]) { match = false; break; }
    if (match) return i;
  }
  return -1;
}

function parseZdlfs(bytes, origin) {
  const found = [];
  let cursor = 0;
  while (cursor <= bytes.length - 4) {
    const offset = findTag(bytes, 'ZDLF', cursor);
    if (offset < 0) break;
    if (offset + 100 > bytes.length) { cursor = offset + 4; continue; }
    const length = u32le(bytes, offset + 4);
    if (length < 116 || length > bytes.length - offset) { cursor = offset + 4; continue; }
    const container = bytes.subarray(offset, offset + length);
    const infoOffset = findTag(container, 'INFO', 100);
    let dsp = null;
    if (infoOffset >= 0 && infoOffset + 8 <= container.length) {
      const infoLength = u32le(container, infoOffset + 4);
      const floatOffset = infoOffset + 4 + infoLength;
      if (infoLength >= 4 && floatOffset + 4 <= container.length) {
        dsp = new DataView(container.buffer, container.byteOffset).getFloat32(floatOffset, true) / 2.5;
      }
    }
    found.push({
      origin,
      offset,
      size: length,
      id: u32le(bytes, offset + 96),
      version: ascii(bytes, offset + 89, 4),
      name: ascii(bytes, offset + 100, 11),
      target: u32le(bytes, offset + 12),
      dsp: Number.isFinite(dsp) ? dsp : null,
      sha256: createHash('sha256').update(container).digest('hex')
    });
    cursor = offset + length;
  }
  return found;
}

function readZipEntries(file) {
  const listing = spawnSync('unzip', ['-Z1', file], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  if (listing.status !== 0) throw new Error(`Cannot list ZIP ${file}; install the unzip command or extract it first`);
  return listing.stdout.split(/\r?\n/).filter(Boolean).filter(name => !name.endsWith('/')).map(name => {
    const data = spawnSync('unzip', ['-p', file, name], { maxBuffer: MAX_INPUT_BYTES });
    if (data.status !== 0) throw new Error(`Cannot read ZIP entry ${name}`);
    return { name: `${basename(file)}:${name}`, bytes: data.stdout };
  });
}

function collectFiles(root) {
  const stat = lstatSync(root);
  if (stat.isDirectory()) {
    const files = [];
    for (const name of readdirSync(root)) files.push(...collectFiles(join(root, name)));
    return files;
  }
  if (stat.size > MAX_INPUT_BYTES) return [];
  if (extname(root).toLowerCase() === '.zip') return readZipEntries(root);
  return [{ name: root, bytes: readFileSync(root) }];
}

function expectedByFile(profile) {
  return new Map(profile.effects.map(effect => [effect.file.toLowerCase(), effect]));
}

function uniqueContainers(containers) {
  const seen = new Set();
  return containers.filter(container => {
    const key = `${container.sha256}:${container.id}:${container.version}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function audit(pedal, input = null) {
  if (!PEDALS.includes(pedal)) throw new Error(`Unknown pedal ${pedal}; choose ${PEDALS.join(', ')}`);
  const profile = loadProfile(pedal);
  const expected = expectedByFile(profile);
  const catalogIssues = [];
  const ids = new Set();
  const files = new Set();
  for (const effect of profile.effects) {
    if (ids.has(effect.id)) catalogIssues.push(`duplicate catalog ID 0x${effect.id.toString(16)}`);
    ids.add(effect.id);
    const file = effect.file.toLowerCase();
    if (files.has(file)) catalogIssues.push(`duplicate catalog file ${effect.file}`);
    files.add(file);
  }

  let inputs = [];
  if (input) {
    const full = resolve(input);
    if (!existsSync(full)) throw new Error(`Input does not exist: ${full}`);
    inputs = collectFiles(full).filter(item => !SKIP_EXTENSIONS.has(extname(item.name).toLowerCase()));
  }
  const containers = uniqueContainers(inputs.flatMap(item => parseZdlfs(item.bytes, item.name)));
  const updaterWrappers = inputs.filter(item => item.bytes.length >= 2 && item.bytes[0] === 0x4d && item.bytes[1] === 0x5a);
  const matched = [];
  const unknown = [];
  const mismatches = [];
  for (const container of containers) {
    const fileName = basename(container.origin.split(':').at(-1)).toLowerCase();
    const match = expected.get(fileName);
    if (!match) { unknown.push(container); continue; }
    if (container.id !== match.id) mismatches.push({ file: fileName, expectedId: match.id, actualId: container.id });
    if (container.version && match.version && container.version !== match.version) mismatches.push({ file: fileName, expectedVersion: match.version, actualVersion: container.version });
    if (container.dsp !== null && Math.abs(container.dsp - match.dsp) > 0.06) mismatches.push({ file: fileName, expectedDsp: match.dsp, actualDsp: container.dsp });
    matched.push({ ...container, expected: match });
  }
  const discoveredFiles = new Set(matched.map(item => basename(item.origin.split(':').at(-1)).toLowerCase()));
  const wrapperOnly = Boolean(input && !containers.length && updaterWrappers.length);
  const missing = input && !wrapperOnly ? profile.effects.filter(effect => !discoveredFiles.has(effect.file.toLowerCase())).map(effect => effect.file) : [];
  const notes = [];
  if (input && !containers.length && updaterWrappers.length) notes.push('The input is a Windows updater wrapper; extract its embedded effect modules before comparing the ZDLF/ZD2 catalog.');
  return {
    pedal,
    name: profile.name,
    firmware: SOURCES[pedal].firmware,
    targetMask: SOURCES[pedal].targetMask,
    supportUrl: SOURCES[pedal].supportUrl,
    input: input ? resolve(input) : null,
    catalog: { effects: profile.effects.length, issues: catalogIssues },
    artifacts: { files: inputs.length, updaterWrappers: updaterWrappers.length, zd2Containers: containers.length, matched: matched.length, unknown: unknown.length, missing: missing.length },
    notes,
    checks: {
      catalog: catalogIssues.length === 0,
      containers: !input || containers.length > 0,
      extraction: !wrapperOnly,
      ids: mismatches.length === 0,
      unknown: !input || unknown.length === 0,
      completeCatalog: !input || wrapperOnly || missing.length === 0
    },
    matched,
    unknown,
    mismatches,
    missing,
    ok: catalogIssues.length === 0 && (!input || (containers.length > 0 && !wrapperOnly && mismatches.length === 0 && unknown.length === 0 && missing.length === 0))
  };
}

function printHuman(result) {
  console.log(`${result.name} firmware ${result.firmware} · target ${result.targetMask}`);
  console.log(`Catalog: ${result.catalog.effects} effects · ${result.catalog.issues.length ? 'FAIL' : 'OK'}`);
  if (result.input) {
    console.log(`Input: ${result.input}`);
    console.log(`Containers: ${result.artifacts.zd2Containers} · matched ${result.artifacts.matched} · unknown ${result.artifacts.unknown} · missing ${result.artifacts.missing}`);
    for (const note of result.notes) console.log(`ℹ ${note}`);
    for (const issue of result.mismatches) console.log(`✗ ${issue.file}: ${JSON.stringify(issue)}`);
    for (const file of result.missing) console.log(`? missing ${file}`);
    for (const item of result.unknown) console.log(`? unknown ${basename(item.origin.split(':').at(-1))} · id 0x${item.id.toString(16)}`);
  }
  console.log(result.ok ? '✓ firmware audit passed' : '✗ firmware audit needs review');
}

const args = parseArgs(process.argv.slice(2));
if (args.help || (!args.catalog && !args.pedal)) { usage(); process.exit(args.help ? 0 : 2); }

try {
  const pedals = args.catalog === 'all' ? PEDALS : [args.catalog || args.pedal];
  const results = pedals.map(pedal => audit(pedal, args.catalog ? null : args.input));
  if (args.flags.has('--json')) console.log(JSON.stringify(results.length === 1 ? results[0] : results, null, 2));
  else results.forEach(printHuman);
  if (args.flags.has('--strict') && results.some(result => !result.ok)) process.exitCode = 1;
} catch (error) {
  console.error(`firmware-audit: ${error.message}`);
  process.exitCode = 1;
}

export { audit, loadProfile };
