// Resources page, "Still to check": every parameter whose encoding is unverified or not decoded yet, from the
// effect data and the codec (zptc.js). Effects with no firmware entry are left out: the builder cannot use them.
(() => {
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const rows = { unverified: [], raw: [] };
  EFFECTS_DATA.forEach(([name, , , , , params], i) => {
    if (!FIRMWARE_DATA[i]) return;
    params.forEach(([pname, , range]) => {
      const c = ZPTC.codec(range, pname);
      if (!c) rows.raw.push([name, pname, range]);
      else if (!c.verified) rows.unverified.push([name, pname, range]);
    });
  });
  for (const [kind, list] of Object.entries(rows)) {
    document.getElementById(`check-${kind}-count`).textContent = list.length;
    document.getElementById(`check-${kind}`).innerHTML = list.length
      ? `<thead><tr><th>Effect</th><th>Parameter</th><th>Range</th></tr></thead><tbody>${list.map(r => `<tr>${r.map(c => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody>`
      : '<tbody><tr><td>Nothing left.</td></tr></tbody>';
  }
})();
