// Tone ideas page: starting chains by style (advice styles with a starter) and by bassist (tone-ideas.js).
// "Open in builder" passes the chain through a share link (patch-link.js).
// Requires EFFECTS_DATA, CATEGORIES, ZPTC, ADVICE, TONE_IDEAS and PATCHLINK.

(() => {
  const $ = selector => document.querySelector(selector);
  const escapeHtml = text => String(text).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const ALT_ROCK = ['grunge', 'postpunk', 'indie', 'altmetal', 'fuzzrock'];
  const state = { filter: 'alt' };

  const styleById = id => ADVICE.styles.find(s => s.id === id);
  const toPatch = chain => ({
    name: chain.name,
    effects: chain.effects.map(e => ({ index: ADVICE.byName.get(e.effect).index, on: true, values: e.values }))
  });
  const thumb = index => `assets/effects/fx-${String(index).padStart(3, '0')}.png`;
  const sourceLink = key => { const src = ADVICE.sources[key]; return src ? `<a href="${escapeHtml(src.url)}" target="_blank" rel="noreferrer">${escapeHtml(src.title)}</a>` : ''; };

  function chainHtml(chain) {
    const patch = toPatch(chain);
    const dsp = patch.effects.reduce((sum, e) => sum + ZPTC.effects[e.index].dsp, 0);
    return `<ol class="tone-chain">${patch.effects.map(e => {
      const [name, category] = EFFECTS_DATA[e.index];
      return `<li style="--c:${CATEGORIES[category].color}"><img class="fx-thumb" src="${thumb(e.index)}" alt="" width="28" height="35" loading="lazy" /><span>${escapeHtml(name)}</span></li>`;
    }).join('')}</ol>
    <p class="tone-dsp">DSP ${dsp.toFixed(1)}% · ${patch.effects.length} effect${patch.effects.length === 1 ? '' : 's'}</p>`;
  }
  const openButton = chain => `<a class="btn btn-sm btn-primary" href="${PATCHLINK.url(toPatch(chain))}">Open in builder</a>`;

  function styleCard(style) {
    const players = TONE_IDEAS.filter(t => t.style === style.id).map(t => t.name);
    return `<article class="tone-card" id="style-${style.id}">
      <header><h3>${escapeHtml(style.name)}</h3>${ALT_ROCK.includes(style.id) ? '<span class="Label">Alternative rock</span>' : ''}</header>
      <p>${escapeHtml(style.summary)}</p>
      ${chainHtml(style.starter)}
      ${players.length ? `<p class="tone-players">Bassists: ${players.map(escapeHtml).join(', ')}</p>` : ''}
      <div class="tone-actions">${openButton(style.starter)}</div>
      <details class="sources"><summary>Sources</summary>${style.sources.map(sourceLink).join('')}</details>
    </article>`;
  }

  function bassistCard(idea) {
    const style = styleById(idea.style);
    const chain = idea.chain || style.starter;
    return `<article class="tone-card" id="bassist-${idea.id}">
      <header><h3>${escapeHtml(idea.name)}</h3><span class="Label">${escapeHtml(idea.band)}</span></header>
      <p>${escapeHtml(idea.summary)}</p>
      <ul class="tone-facts">${idea.facts.map(f => `<li>${escapeHtml(f.text)} <span class="tone-cite">${sourceLink(f.source)}</span></li>`).join('')}</ul>
      ${chainHtml(chain)}
      <p class="tone-approach">${escapeHtml(idea.approach)}</p>
      <div class="tone-actions">${openButton(chain)}<a class="btn btn-sm btn-invisible" href="#style-${style.id}">Style: ${escapeHtml(style.name)}</a></div>
    </article>`;
  }

  function render() {
    const styles = ADVICE.styles.filter(s => s.starter && (state.filter === 'all' || ALT_ROCK.includes(s.id)));
    $('#tone-filter').innerHTML = [['alt', 'Alternative rock'], ['all', 'All styles']]
      .map(([id, label]) => `<button class="chip-filter" data-filter="${id}" aria-pressed="${state.filter === id}">${label}</button>`).join('');
    $('#tone-styles').innerHTML = styles.map(styleCard).join('');
    // An idea whose style is unknown (e.g. an older advice-rules.js) is skipped instead of breaking the page
    $('#tone-bassists').innerHTML = TONE_IDEAS.filter(t => styleById(t.style)?.starter && (state.filter === 'all' || ALT_ROCK.includes(t.style))).map(bassistCard).join('');
  }

  $('#tone-filter').addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    state.filter = button.dataset.filter;
    render();
  });
  render();
})();
