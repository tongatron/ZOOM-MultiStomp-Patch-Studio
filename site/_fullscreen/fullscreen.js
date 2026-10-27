// Full-screen version (site/_fullscreen/): helpers shared by its pages. Load right after ../pedal.js.

// The pages sit one folder below the pedal folder: the shared scripts build the effect image paths from PEDAL.base
PEDAL.base = '../';

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
