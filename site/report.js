// "Report a problem" and "Contact us": the form opens from the button in the status bar, or from any element with
// data-report="report" | "contact"; the message goes to the site administrator through POST /api/report (a Telegram bot,
// see deploy/accounts.mjs). Open to everyone, signed in or not.
// A trigger can bring its own text: data-intro (the sentence above the form) and data-template (the message to start from).
// Pages without a status bar (the landing page) get the form from their own buttons only.
// Load after pedal.js and account.js (a signed-in visitor gets their name and email filled in).

(() => {
  const status = document.querySelector('.fs-status');

  const MODES = {
    report: {
      kind: 'problem', title: 'Report a problem', intro: 'Tell us what is wrong or what you would like: the message goes straight to the person who makes this site.',
      emailHint: '(optional, so we can reply)', needEmail: false, placeholder: 'What you were doing, what happened, what you expected', template: ''
    },
    contact: {
      kind: 'contact', title: 'Contact us', intro: 'Write to the person who makes this site.',
      emailHint: '(needed, so we can answer you)', needEmail: true, placeholder: 'Your message', template: ''
    }
  };

  const button = status ? document.createElement('button') : null;
  if (button) {
    button.type = 'button';
    button.className = 'fs-report';
    button.dataset.report = 'report';
    button.textContent = 'Report a problem';
    const privacy = status.querySelector('a[href$="privacy.html"]');
    if (privacy) privacy.after(button); else status.append(button);
  }

  let dialog = null;
  let resetLabel = 0;
  let current = null; // the mode of the form as it is now
  const drafts = {}; // what was typed in each mode and not sent yet
  const field = name => dialog.querySelector(`[name="${name}"]`);
  const part = selector => dialog.querySelector(selector);

  function build() {
    dialog = document.createElement('dialog');
    dialog.className = 'Overlay Overlay--small account-dialog report-dialog';
    dialog.setAttribute('aria-labelledby', 'report-title');
    dialog.innerHTML = `<div class="Overlay-header"><h2 class="Overlay-title" id="report-title"></h2></div>
      <div class="Overlay-body">
        <form class="report-form" novalidate>
          <p data-intro></p>
          <label><span>Name <small>(optional)</small></span><input class="form-control" name="name" maxlength="80" autocomplete="name" /></label>
          <label><span>Email <small data-email-hint></small></span><input class="form-control" name="email" type="email" maxlength="200" autocomplete="email" /></label>
          <label><span>Message</span><textarea class="form-control" name="message" rows="6" maxlength="3000"></textarea></label>
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
      const message = field('message').value;
      if (!message.trim() || message.trim() === current.template.trim()) { fail('Write your message.'); field('message').focus(); return; }
      if (current.needEmail && !field('email').value.trim()) { fail('Add your email address, so we can answer you.'); field('email').focus(); return; }
      error.hidden = true;
      send.disabled = true;
      const details = field('details').checked;
      const updated = document.querySelector('.fs-status time, .gh-updated')?.getAttribute('datetime');
      const info = !details ? '' : [typeof PEDAL !== 'undefined' && PEDAL.name, updated && `site updated ${updated}`, `window ${innerWidth}×${innerHeight}`, navigator.userAgent].filter(Boolean).join(' · ');
      try {
        const response = await fetch('/api/report', {
          method: 'POST', credentials: 'same-origin',
          body: new URLSearchParams({ kind: current.kind, name: field('name').value, email: field('email').value, message, page: details ? location.pathname + location.search : '', info })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || `Server error ${response.status}.`);
        const email = field('email').value.trim();
        part('[data-reply]').textContent = current.needEmail ? `Thank you! We will write to ${email}.` : email ? `Thank you! If needed, we will reply to ${email}.` : 'Thank you!';
        field('message').value = current.template;
        delete drafts[current.name];
        form.hidden = true;
        part('.report-done').hidden = false;
        part('.report-done .btn').focus();
        if (button && current.name === 'report') {
          button.textContent = '✓ Message sent';
          clearTimeout(resetLabel);
          resetLabel = setTimeout(() => { button.textContent = 'Report a problem'; }, 8000);
        }
      } catch (problem) {
        fail(problem instanceof TypeError ? 'Cannot reach the server. Check your connection and try again.' : problem.message);
      } finally {
        send.disabled = false;
      }
    });
  }

  function open(name, trigger) {
    if (!dialog) { build(); document.body.append(dialog); }
    const next = { name, ...MODES[name], intro: trigger?.dataset.intro || MODES[name].intro, template: trigger?.dataset.template ?? MODES[name].template };
    if (current && current.name !== name) { drafts[current.name] = field('message').value; field('message').value = drafts[name] ?? next.template; }
    else if (!current) field('message').value = next.template;
    current = next;
    part('#report-title').textContent = next.title;
    part('[data-intro]').textContent = next.intro;
    part('[data-email-hint]').textContent = next.emailHint;
    field('message').placeholder = next.placeholder;
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
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-report]');
    if (trigger && MODES[trigger.dataset.report]) open(trigger.dataset.report, trigger);
  });
})();
