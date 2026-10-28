// Layout helpers shared by the pages of the site (pedal menu, contents list, small-screen notice). Load right after pedal.js.

// Small screens: the layout needs a window of at least 800 × 640 px (see the media query at the end of fullscreen.css).
// Below that this notice takes the place of the page: it says so, suggests a bigger screen or the browser's full-screen
// mode, and says what the site does. There is no phone layout.
{
  const here = document.currentScript.src;
  const notice = document.createElement('div');
  notice.className = 'fs-small';
  notice.setAttribute('role', 'note');
  notice.innerHTML = `
    <h1><img src="${new URL('favicon.svg', here)}" alt="" width="28" height="28" /> ZOOM MultiStomp Patch Studio</h1>
    <p class="fs-small-warn"><b>This window is too small.</b> The site shows every page in one screen and needs a window of at least 800 × 640 px; this one is <span data-size></span>. Open it on a computer or on a tablet held sideways, make the window bigger, or switch the browser to full screen (<kbd class="gh-kbd">F11</kbd>, or <kbd class="gh-kbd">⌃</kbd> <kbd class="gh-kbd">⌘</kbd> <kbd class="gh-kbd">F</kbd> on a Mac).</p>
    <p>A free tool, with nothing to install, to plan patches for the ZOOM MS-60B+ (bass) and MS-50G+ (guitar) MultiStomp pedals:</p>
    <ul>
      <li><b>Effects</b>: every effect of the pedal with the original text of the ZOOM Effects List, its estimated DSP load, and all its parameters with their ranges.</li>
      <li><b>Patch builder</b>: pick up to 6 effects, put them in order and set their parameters while the DSP load and the advice on order and levels follow along. Download the patch as a <code>.zptc</code> file for Handy Guitar Lab.</li>
      <li><b>Pedal manager</b> (MS-60B+, Chrome or Edge on a computer, experimental): read the patches stored on the pedal and write new ones over USB, with a backup of every memory it replaces.</li>
      <li><b>Tone ideas</b> (MS-60B+): starting chains by style and by bassist.</li>
      <li>A free account keeps your patches, settings and pedal backups safe and brings them to every device.</li>
    </ul>
    <p class="fs-small-links"><a href="${new URL('landing/', here)}">More about the site</a> <a href="https://github.com/tongatron/ZOOM-MultiStomp-Patch-Studio" target="_blank" rel="noreferrer">Source on GitHub</a></p>`;
  document.body.prepend(notice);
  const size = notice.querySelector('[data-size]');
  const showSize = () => { size.textContent = `${innerWidth} × ${innerHeight} px`; };
  addEventListener('resize', showSize);
  showSize();
}

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
  // Fills an "On this page" list with the h2 and h3 headings of a document (headings without an id get one) and
  // highlights the entry of the section being read while the document scrolls
  toc(doc, list) {
    const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const headings = [...doc.querySelectorAll('h2, h3')];
    list.innerHTML = headings.map(h => {
      if (!h.id) h.id = slug(h.textContent);
      return `<li${h.tagName === 'H3' ? ' class="toc-sub"' : ''}><a href="#${h.id}">${h.textContent.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</a></li>`;
    }).join('');

    const links = [...list.querySelectorAll('a')];
    const scroller = doc.closest('.fs-pane-body'); // the pane the document scrolls in
    const pane = list.closest('.fs-pane-body'); // the pane of the contents list, which scrolls to keep the entry in view
    if (!scroller || !pane || !links.length) return;
    const indexOf = hash => headings.findIndex(h => `#${h.id}` === hash);
    let active = -1;
    let chosen = indexOf(location.hash); // the section a link just took us to: it stays marked even when it is too short to reach the top
    const mark = index => {
      if (index === active) return;
      active = index;
      links.forEach((link, i) => i === index ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
      const a = links[index].getBoundingClientRect(), p = pane.getBoundingClientRect();
      if (a.top < p.top + 8) pane.scrollTop -= p.top + 8 - a.top;
      else if (a.bottom > p.bottom - 8) pane.scrollTop += a.bottom - p.bottom + 8;
    };
    const update = () => {
      const view = scroller.getBoundingClientRect();
      let index = 0;
      headings.forEach((h, i) => { if (h.getBoundingClientRect().top <= view.top + 24) index = i; }); // the last heading that reached the top
      if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2) { // the end: the last sections cannot reach the top
        index = chosen >= 0 && headings[chosen].getBoundingClientRect().top < view.bottom ? chosen : headings.length - 1;
      }
      mark(index);
    };
    scroller.addEventListener('scroll', update, { passive: true });
    for (const type of ['wheel', 'touchmove', 'keydown']) scroller.addEventListener(type, () => { chosen = -1; }, { passive: true });
    list.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (link) { chosen = links.indexOf(link); mark(chosen); }
    });
    addEventListener('hashchange', () => { chosen = indexOf(location.hash); });
    addEventListener('resize', update);
    update();
  }
};
