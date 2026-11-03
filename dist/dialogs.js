// Messages and questions for the visitor, drawn by the site itself: the pages never call the browser's alert, confirm or
// prompt (those look different on every browser, can be switched off by it and cannot hold formatted text).
//   DIALOGS.confirm({ title, text | html, ok, cancel, danger }) → Promise<true | false>   (Esc, Cancel and a click outside are false)
//   DIALOGS.alert({ title, text | html, ok })                    → Promise<void>
//   DIALOGS.toast(text, { action, onAction, ms })                 a short message at the bottom of the page, with one optional button
// `text` is plain text; `html` is markup the caller has already escaped. Needs styles.css and theme.css (Overlay, btn, update-bar).
const DIALOGS = (() => {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  let count = 0;

  function ask({ title, text = '', html = '', ok = 'OK', cancel = 'Cancel', danger = false }) {
    return new Promise(resolve => {
      const dialog = document.createElement('dialog');
      const id = `dialog-title-${++count}`;
      dialog.className = 'Overlay Overlay--small account-dialog';
      dialog.setAttribute('aria-labelledby', id);
      dialog.innerHTML = `<div class="Overlay-header"><h2 class="Overlay-title" id="${id}">${esc(title)}</h2></div>
        <div class="Overlay-body">${html || `<p>${esc(text)}</p>`}
          <div class="account-actions">${cancel ? `<button class="btn" type="button" value="no">${esc(cancel)}</button>` : ''}<button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" type="button" value="yes">${esc(ok)}</button></div>
        </div>`;
      let answer = false;
      dialog.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (!button && event.target !== dialog) return; // a click on the backdrop lands on the dialog itself
        answer = button?.value === 'yes';
        dialog.close();
      });
      dialog.addEventListener('close', () => { dialog.remove(); resolve(answer); }); // also Esc
      document.body.append(dialog);
      dialog.showModal();
      // A question that deletes something starts on Cancel, so that Enter pressed by habit keeps the data
      dialog.querySelector(danger && cancel ? '[value="no"]' : '[value="yes"]').focus();
    });
  }

  const confirm = options => ask(options);
  const alert = options => ask({ ...options, cancel: null }).then(() => {});

  function toast(text, { action = '', onAction = null, ms = action ? 10000 : 6000 } = {}) {
    document.querySelectorAll('.dialogs-toast').forEach(old => old.remove());
    const bar = document.createElement('div');
    bar.className = 'update-bar dialogs-toast';
    bar.setAttribute('role', 'status');
    bar.innerHTML = `<span>${esc(text)}</span>${action ? `<button class="btn btn-sm" type="button" data-toast="action">${esc(action)}</button>` : ''}<button class="btn btn-sm btn-invisible" type="button" data-toast="close" aria-label="Dismiss">OK</button>`;
    bar.addEventListener('click', event => {
      const choice = event.target.closest('[data-toast]')?.dataset.toast;
      if (!choice) return;
      bar.remove();
      if (choice === 'action') onAction?.();
    });
    document.body.append(bar);
    setTimeout(() => bar.remove(), ms);
    return bar;
  }

  return { confirm, alert, toast };
})();
