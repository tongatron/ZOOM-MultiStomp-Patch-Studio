// "Report a problem": a button in the status bar opens a form; the message goes to the site administrator through
// POST /api/report (a Telegram bot, see deploy/accounts.mjs). Open to everyone, signed in or not.
// Load after pedal.js and account.js (a signed-in visitor gets their name and email filled in).

(() => {
  const status = document.querySelector('.fs-status');
  if (!status) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'fs-report';
  button.textContent = 'Report a problem';
  const privacy = status.querySelector('a[href$="privacy.html"]');
  if (privacy) privacy.after(button); else status.append(button);

  let dialog = null;
  let resetLabel = 0;
  const field = name => dialog.querySelector(`[name="${name}"]`);
  const part = selector => dialog.querySelector(selector);

  function build() {
    dialog = document.createElement('dialog');
    dialog.className = 'Overlay Overlay--small account-dialog report-dialog';
    dialog.setAttribute('aria-labelledby', 'report-title');
    dialog.innerHTML = `<div class="Overlay-header"><h2 class="Overlay-title" id="report-title">Report a problem</h2></div>
      <div class="Overlay-body">
        <form class="report-form" novalidate>
          <p>Tell us what is wrong or what you would like: the message goes straight to the person who makes this site.</p>
          <label><span>Name <small>(optional)</small></span><input class="form-control" name="name" maxlength="80" autocomplete="name" /></label>
          <label><span>Email <small>(optional, so we can reply)</small></span><input class="form-control" name="email" type="email" maxlength="200" autocomplete="email" /></label>
          <label><span>Message</span><textarea class="form-control" name="message" rows="6" maxlength="3000" placeholder="What you were doing, what happened, what you expected"></textarea></label>
          <label class="report-check"><input type="checkbox" name="details" checked /><span>Send technical details <small>(the address of this page, the pedal, the date of the site's last update, the size of your window and the name of your browser)</small></span></label>
          <p class="report-error" role="alert" hidden></p>
          <div class="account-actions"><button class="btn" type="button" data-close>Cancel</button><button class="btn btn-primary" type="submit">Send</button></div>
        </form>
        <div class="report-done" hidden>
          <p><b>Message sent.</b> <span data-reply></span></p>
          <div class="account-actions"><button class="btn btn-primary" type="button" data-close>Close</button></div>
        </div>
      </div>`;
    const form = part('form');
    const error = part('.report-error');
    const send = part('[type="submit"]');
    const fail = text => { error.textContent = text; error.hidden = false; };

    dialog.addEventListener('click', event => { if (event.target.closest('[data-close]')) dialog.close(); });
    field('message').addEventListener('keydown', event => {
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); form.requestSubmit(); }
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!field('message').value.trim()) { fail('Write your message.'); field('message').focus(); return; }
      error.hidden = true;
      send.disabled = true;
      const details = field('details').checked;
      const updated = status.querySelector('time')?.getAttribute('datetime');
      const info = !details ? '' : [typeof PEDAL !== 'undefined' && PEDAL.name, updated && `site updated ${updated}`, `window ${innerWidth}×${innerHeight}`, navigator.userAgent].filter(Boolean).join(' · ');
      try {
        const response = await fetch('/api/report', {
          method: 'POST', credentials: 'same-origin',
          body: new URLSearchParams({ name: field('name').value, email: field('email').value, message: field('message').value, page: details ? location.pathname + location.search : '', info })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || `Server error ${response.status}.`);
        const email = field('email').value.trim();
        part('[data-reply]').textContent = email ? `Thank you! If needed, we will reply to ${email}.` : 'Thank you!';
        field('message').value = '';
        form.hidden = true;
        part('.report-done').hidden = false;
        part('.report-done .btn').focus();
        button.textContent = '✓ Message sent';
        clearTimeout(resetLabel);
        resetLabel = setTimeout(() => { button.textContent = 'Report a problem'; }, 8000);
      } catch (problem) {
        fail(problem instanceof TypeError ? 'Cannot reach the server. Check your connection and try again.' : problem.message);
      } finally {
        send.disabled = false;
      }
    });
  }

  button.addEventListener('click', () => {
    if (!dialog) { build(); document.body.append(dialog); }
    const me = typeof ACCOUNT !== 'undefined' ? ACCOUNT.me : null;
    if (me?.signedIn) { // a draft already typed stays as it is
      if (!field('name').value) field('name').value = me.name || '';
      if (!field('email').value) field('email').value = me.email || '';
    }
    part('form').hidden = false;
    part('.report-done').hidden = true;
    part('.report-error').hidden = true;
    dialog.showModal();
    field('message').focus();
  });
})();
