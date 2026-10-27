// Full-screen lab: small adapters that let the shared scripts run in the prototype layouts unchanged.
// Each one is switched on by an attribute on <body>. Load right after pedal.js, before the page scripts.
(() => {
  const body = document.body;

  // The prototypes live two folders down: the shared scripts build the effect image paths from PEDAL.base
  if (body.dataset.fsBase) PEDAL.base = body.dataset.fsBase;

  // Prototype A, Effects: the effect detail is a pane next to the list, not a modal dialog
  const dock = body.dataset.fsDock && document.getElementById(body.dataset.fsDock);
  if (dock) {
    dock.showModal = dock.show; // non-modal: the list and the filters stay usable
    const search = document.getElementById('search');
    const typing = () => ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
    // app.js reads every key as a dialog key while the detail is open: keep the arrows for the caret and / and Esc for search
    window.addEventListener('keydown', event => {
      if (typing() && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) { event.stopPropagation(); return; }
      if (event.key === '/' && !typing()) { event.preventDefault(); event.stopPropagation(); search.focus(); search.select(); return; }
      if (event.key === 'Escape' && document.activeElement === search && search.value) {
        event.stopPropagation();
        search.value = '';
        search.dispatchEvent(new Event('input'));
      }
    }, true);
    // A click on the pane background would close it like a click on the backdrop
    window.addEventListener('click', event => { if (event.target === dock) event.stopPropagation(); }, true);
    // Mark the effect shown in the pane in the list
    const markCurrent = () => {
      const slug = decodeURIComponent(location.hash.slice(1));
      document.querySelectorAll('.fx-link').forEach(link => {
        const here = link.dataset.slug === slug;
        if (here) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
        if (here) link.scrollIntoView({ block: 'nearest' });
      });
    };
    document.addEventListener('DOMContentLoaded', () => {
      new MutationObserver(markCurrent).observe(document.getElementById('dialog-body'), { childList: true });
      new MutationObserver(markCurrent).observe(document.getElementById('fx-list'), { childList: true });
      // Without an effect in the address, show the first one
      if (!dock.open) document.querySelector('.fx-link')?.click();
    });
  }

  // Prototype B, builder: one slot is edited at a time, like the selected effect on the pedal
  if ('fsOneOpen' in body.dataset) {
    window.addEventListener('click', event => {
      const button = event.target.closest('#chain-list [data-action="toggle-open"]');
      if (!button) return;
      const slot = state.effects.find(s => s.uid === Number(button.closest('.chain-item').dataset.uid));
      if (slot?.open) { event.stopPropagation(); return; } // the selected slot stays selected
      state.effects.forEach(s => { s.open = false; });
    }, true);
    document.addEventListener('DOMContentLoaded', () => {
      const list = document.getElementById('chain-list');
      const update = () => {
        // Loading a patch, undo and redo close every slot: select the first one again
        if (state.effects.length && !state.effects.some(s => s.open)) {
          state.effects[0].open = true;
          render();
          return;
        }
        // The free slots of the board are drawn as buttons that open the effect picker (handled by builder.js)
        const free = state.effects.length ? ZPTC.MAX_EFFECTS - state.effects.length : 0;
        const shown = list.querySelectorAll('.fs-slot-free');
        if (shown.length === free) return;
        shown.forEach(slot => slot.remove());
        for (let i = 0; i < free; i++) list.insertAdjacentHTML('beforeend', '<li class="fs-slot-free"><button class="btn btn-sm" data-action="open-picker">+ Add effect</button></li>');
      };
      new MutationObserver(update).observe(list, { childList: true });
      update();
    });
  }

  // Prototype B: panes that slide in from the side (Advice, My patches), one at a time
  document.addEventListener('DOMContentLoaded', () => {
    const drawers = [...document.querySelectorAll('[data-fs-drawer]')].map(button => ({ button, drawer: document.getElementById(button.getAttribute('aria-controls')) }));
    const set = (entry, open) => {
      entry.drawer.classList.toggle('is-open', open);
      entry.drawer.inert = !open;
      entry.button.setAttribute('aria-expanded', String(open));
    };
    drawers.forEach(entry => {
      const { button, drawer } = entry;
      set(entry, false);
      // The button repeats the drawer's first counter (advice found, saved patches)
      const count = button.querySelector('.Counter');
      const source = drawer.querySelector('.Counter');
      if (count && source) {
        const copy = () => { count.textContent = source.textContent; };
        new MutationObserver(copy).observe(source, { childList: true, characterData: true, subtree: true });
        copy();
      }
      button.addEventListener('click', () => {
        const open = !drawer.classList.contains('is-open');
        drawers.forEach(other => set(other, open && other === entry));
      });
      drawer.querySelector('[data-fs-drawer-close]')?.addEventListener('click', () => { set(entry, false); button.focus(); });
    });
    document.addEventListener('keydown', event => {
      const entry = drawers.find(d => d.drawer.classList.contains('is-open'));
      if (event.key !== 'Escape' || !entry || document.querySelector('dialog[open]')) return;
      set(entry, false);
      entry.button.focus();
    });
  });
})();
