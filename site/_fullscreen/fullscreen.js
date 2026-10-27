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
