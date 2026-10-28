// Where the site lives. Read from the environment when the server starts.
//   SITE_URL        the address of the site: the links in emails and the target of the redirect from the old address
//   LEGACY_ORIGINS  comma separated old addresses of the site, which only redirect to SITE_URL (see legacy-host.mjs);
//                   empty turns the redirect off
// The site was zoom.tongatron.org until 2026-10-28.
export const SITE_URL = (process.env.SITE_URL || 'https://zoom_multistomp_studio.tongatron.org').replace(/\/$/, '');
export const LEGACY_ORIGINS = (process.env.LEGACY_ORIGINS ?? 'https://zoom.tongatron.org').split(',').map(origin => origin.trim().replace(/\/$/, '')).filter(Boolean);
