// Full-screen version (site/_fullscreen/): helpers shared by its pages. Load right after ../pedal.js.

// The pages sit one folder below the pedal folder: the shared scripts build the effect image paths from PEDAL.base
PEDAL.base = '../';

// Pedal menu in the top bar: a button that opens a list of links; it closes with Esc, a click elsewhere or when focus leaves it
document.querySelectorAll('.fs-menu').forEach(menu => {
  const button = menu.querySelector('.fs-menu-button');
  const list = menu.querySelector('.fs-menu-list');
  const set = open => { list.hidden = !open; button.setAttribute('aria-expanded', String(open)); };
  button.addEventListener('click', () => set(list.hidden));
  menu.addEventListener('keydown', event => { if (event.key === 'Escape' && !list.hidden) { set(false); button.focus(); } });
  menu.addEventListener('focusout', event => { if (!menu.contains(event.relatedTarget)) set(false); });
  document.addEventListener('click', event => { if (!menu.contains(event.target)) set(false); });
});

// Patch box of the builder: the arrow in its header folds it away so My patches gets the room. While it is closed the
// header shows the name and the DSP load; the choice is remembered in this browser
const patchBox = document.querySelector('.patch-box');
if (patchBox) {
  const KEY = `${PEDAL.id}-fs-patch-collapsed`;
  const toggle = patchBox.querySelector('.patch-toggle');
  const body = patchBox.querySelector('#patch-body');
  const summary = patchBox.querySelector('.patch-summary');
  const fill = () => { summary.textContent = `${document.getElementById('patch-name').value.trim() || 'No name yet'} · ${document.getElementById('dsp-total').textContent}`; };
  const set = collapsed => {
    patchBox.classList.toggle('is-collapsed', collapsed);
    body.hidden = collapsed;
    summary.hidden = !collapsed;
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.title = collapsed ? 'Open the patch box' : 'Close the patch box';
    if (collapsed) fill();
  };
  toggle.addEventListener('click', () => {
    set(!body.hidden);
    try { localStorage.setItem(KEY, body.hidden ? '1' : '0'); } catch {}
  });
  // The name and the load change while the box is closed (a patch opened from My patches, an effect added from Tone ideas)
  new MutationObserver(() => { if (body.hidden) fill(); }).observe(document.getElementById('dsp-total'), { childList: true });
  try { if (localStorage.getItem(KEY) === '1') set(true); } catch {}
}

const FS = {
  // Fills an "On this page" list with the h2 and h3 headings of a document; headings without an id get one
  toc(doc, list) {
    const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    list.innerHTML = [...doc.querySelectorAll('h2, h3')].map(h => {
      if (!h.id) h.id = slug(h.textContent);
      return `<li${h.tagName === 'H3' ? ' class="toc-sub"' : ''}><a href="#${h.id}">${h.textContent.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</a></li>`;
    }).join('');
  }
};
