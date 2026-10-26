// Share links for patches, used by the builder (Share link) and the Tone ideas page (Open in builder).
// The patch travels in the URL fragment (#p=…), which browsers never send to the server; &s=<style id> picks the advice style.
// Payload: [name, [[effectIndex, on 1|0, [values in Effects List parameter order]]]] as base64url JSON.
// Requires EFFECTS_DATA.

const PATCHLINK = (() => {
  const paramNames = index => EFFECTS_DATA[index][5].map(p => p[0]);
  const toBase64Url = text => btoa(String.fromCharCode(...new TextEncoder().encode(text))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const fromBase64Url = code => new TextDecoder().decode(Uint8Array.from(atob(code.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)));

  // patch: { name, effects: [{ index, on, values }] }
  const encode = patch => toBase64Url(JSON.stringify([String(patch.name || '').trim(), patch.effects.map(e => [e.index, e.on === false ? 0 : 1, paramNames(e.index).map(n => e.values?.[n] ?? null)])]));

  function decode(code, maxEffects = 6) {
    const [name, effects] = JSON.parse(fromBase64Url(code));
    if (typeof name !== 'string' || !Array.isArray(effects)) throw new Error('not a patch');
    return {
      name: name.replace(/[^!%&'+,\-.=_ A-Za-z0-9]/g, '').slice(0, 28),
      effects: effects.filter(e => Array.isArray(e) && Number.isInteger(e[0]) && EFFECTS_DATA[e[0]]).slice(0, maxEffects).map(([index, on, values]) => ({
        index, on: on !== 0,
        values: Object.fromEntries(paramNames(index).map((n, i) => [n, Array.isArray(values) ? values[i] : null]).filter(([, v]) => typeof v === 'number' || (typeof v === 'string' && v.length <= 40)))
      }))
    };
  }

  // Reads #p=…&s=… from a location hash; returns null when there is no patch in it
  function fromHash(hash) {
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    return params.get('p') ? { code: params.get('p'), style: params.get('s') } : null;
  }
  const url = (patch, style = null, page = 'builder.html') => `${page}#p=${encode(patch)}${style ? `&s=${encodeURIComponent(style)}` : ''}`;

  return { encode, decode, fromHash, url };
})();
