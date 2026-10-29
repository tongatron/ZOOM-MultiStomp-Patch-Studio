# Piano: account e login per ZOOM MultiStomp Studio

Stato: **proposta da approvare** (nessun codice scritto). Data: 2026-10-27, aggiornato con le decisioni dell'utente.
Il testo del sito resta in inglese (CLAUDE.md); questo piano è in italiano.

## Decisioni prese (2026-10-27)

- Login con **email** e password.
- Verifica dell'email **non obbligatoria**: si può usare l'account subito; la mail di benvenuto contiene un link facoltativo "Confirm your email".
- Mail **come PatternMachine oggi**: Gmail SMTP (porta 465, SSL) con password per le app, `mail.json` creato da uno script `set-mail`, invio in background, modalità outbox per i test. Node non ha `smtplib`: lo stesso comportamento si ottiene con un client SMTP minimo su `node:tls` (nessuna dipendenza).
- I **codici di sync anonimi si tolgono subito** (`/api/sync/<hash>` e la finestra Sync del builder).
- **Registrazione aperta a tutti.**
- **Console utenti** per l'admin Giovanni (sezione 5 bis).
- Mittente: **la stessa casella Gmail di PatternMachine**, con nome "ZOOM MultiStomp Studio".
- **Account separati** da PatternMachine (database, utenti e cookie propri).
- **Notifica Telegram a ogni nuovo utente** (dal 2026-10-29 con un bot proprio del sito, non più quello di PatternMachine; lo stesso bot riceve le segnalazioni di "Report a problem").
- **Nessuna copia dei backup fuori dal server**: restano i 30 giorni in `/srv/apps/zoom-ms60b-backups`.
- Al logout la scelta predefinita è **Remove from this browser**.

## 0. Cosa ho trovato

**PatternMachine** (`/Users/tonga/Documents/GitHub/Logic/PatternMachine/server.py`, Python, nessuna dipendenza):

- utenti in `data/users.json` (permessi 600, mai servito): nome, email, hash **PBKDF2-SHA256 600 000 iterazioni** con sale, `pwv` (versione password), ruolo, `created_at`, `last_login`;
- **sessione senza stato**: cookie `v2.<id>.<pwv>.<scadenza>.<HMAC-SHA256>`, 30 giorni, `HttpOnly; SameSite=Lax; Secure` (dietro Cloudflare). Cambiare password incrementa `pwv` e chiude tutte le sessioni;
- **reset password**: token casuale, sul server solo lo SHA-256, valido 1 ora, monouso; risposta identica che l'account esista o no;
- **mail**: Gmail SMTP (465, SSL) con *password per le app*, configurazione in `mail.json` (scritto da `scripts/set-mail.py`, con `--test`) o variabili `PATTERNMACHINE_SMTP_USER/PASS`; invio in background; `PATTERNMACHINE_MAIL_OUTBOX=<cartella>` scrive file `.eml` invece di spedire (test); template HTML unico `mail_html(title, intro, button, url, rows, outro)`;
- **rate limit** in memoria per IP e per azione (login 10, register 10, forgot 5 ogni 15 min), ritardo di 0.4 s sui login sbagliati;
- **CSRF**: `Sec-Fetch-Site` deve essere `same-origin`/`none`, altrimenti confronto `Origin`/`Host`; `safe_next()` contro open redirect;
- pagine di accesso **renderizzate dal server** (form HTML classici: funzionano con i password manager e senza JS);
- notifica Telegram all'admin a ogni registrazione; `scripts/add-user.py` per creare l'admin dal server;
- `PRIVACY-TODO.md` segnala già due difetti da **non** copiare: la mail di benvenuto contiene la password in chiaro, e i file JSON andrebbero sostituiti da SQLite.

**Questo sito oggi**:

- `deploy/server.mjs` (Node, nessuna dipendenza) serve `site/` e `POST /api/sync/<sha256 del codice>`; la fusione è `site/library-merge.js` (vince la modifica più recente, le cancellazioni sono lapidi per 90 giorni), condivisa client/server;
- dati nel browser, con prefisso `PEDAL.id` (`ms60b`, `ms50g`): `-library`, `-deleted`, `-sync`, `-builder` (patch in lavorazione), `-advice`, `-rulepacks`, `-view`, `-usb-backups` (max 30), `-pedal-edit`;
- il service worker (`site/sw.js`) ignora `/api/` ma metterebbe in cache qualunque altra pagina GET, comprese eventuali `/login`;
- **sul server `/srv/apps/zoom-ms60b-data` è vuota** (0 librerie): nessuno usa ancora il codice di sync, quindi non c'è nulla da migrare lato server;
- su `hp-ubuntu` c'è **Node v22.22.3**: il modulo integrato `node:sqlite` è disponibile (stampa solo un avviso "experimental"); `sqlite3` da riga di comando non è installato;
- su `hp-ubuntu` PatternMachine ha già un `mail.json` funzionante (stessa casella Gmail riutilizzabile).

## 1. Architettura

Resta **un solo processo Node** (`deploy/server.mjs`), senza framework e senza dipendenze npm. PatternMachine è in Python, quindi non si importa il codice: si **porta in JavaScript la stessa logica**, con gli stessi formati e le stesse regole, in moduli piccoli dentro `deploy/`:

| Nuovo file | Contenuto (da PatternMachine) |
|---|---|
| `deploy/auth.mjs` | hash PBKDF2 (`crypto.pbkdf2`, 600 000 iterazioni), cookie firmato `v2.<id>.<pwv>.<exp>.<hmac>`, token di reset hashati, `safeNext`, rate limit per azione, controllo `Sec-Fetch-Site`/`Origin` |
| `deploy/mail.mjs` | config da `mail.json` o env, invio in background, modalità `MAIL_OUTBOX`, template `mailHtml()` con i colori del sito |
| `deploy/db.mjs` | apertura SQLite, schema e migrazioni (`PRAGMA user_version`), query preparate |
| `deploy/pages.mjs` | pagine `/login`, `/register`, `/forgot`, `/reset`, `/account` e `/admin` generate dal server con `styles.css` + `theme.css` |
| `deploy/set-mail.mjs` | equivalente di `set-mail.py` (chiede indirizzo e password per le app, scrive `mail.json` 600, `--test indirizzo`) |
| `deploy/add-user.mjs` | equivalente di `add-user.py` (crea utente/cambia password da terminale, `--admin`): serve a creare l'admin Giovanni |
| `site/account.js` | client: stato di login (`/api/me`), pulsante nell'header, avviso "non persistente", sincronizzazione dell'account per ogni pedale |

**Invio mail come PatternMachine.** Stessa configurazione (Gmail, porta 465, password per le app in `mail.json`, oppure `SMTP_USER`/`SMTP_PASS` in env) e stesso comportamento (invio in un task in background, errori solo nel log, `MAIL_OUTBOX=<cartella>` scrive `.eml` per i test). Node non ha un client SMTP integrato, quindi `mail.mjs` contiene un client minimo su `node:tls` (SMTPS, `EHLO`, `AUTH LOGIN`, `MAIL FROM`/`RCPT TO`/`DATA`, messaggio multipart testo + HTML, ~80 righe): fa ciò che fa `smtplib.SMTP_SSL` in PatternMachine, senza dipendenze npm.

**Cosa NON si copia da PatternMachine:**

- il sito resta **aperto a tutti** (niente `_gate`); il login aggiunge solo il salvataggio sul server;
- niente sessione "ospite": chi non è loggato è semplicemente anonimo;
- niente password in chiaro nella mail di benvenuto (la mail conferma l'indirizzo e basta);
- niente file JSON per gli utenti: SQLite.

## 2. Database

**Scelta: SQLite con `node:sqlite`** (integrato in Node 22, zero dipendenze, transazioni vere, un solo file facile da salvare). File: `/srv/apps/zoom-ms60b-data/studio.db`, modalità WAL, `foreign_keys=ON`. È già nella `ReadWritePaths` del servizio systemd. Il server parte con `node --disable-warning=ExperimentalWarning`.

Alternativa più semplice ma peggiore: un file JSON per utente come `projects/<uid>.json` di PatternMachine.

### Schema (versione 1)

```sql
CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);           -- 'session_secret' se non è in env
CREATE TABLE users (
  id TEXT PRIMARY KEY,                    -- 32 hex casuali
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL DEFAULT '',          -- facoltativo, solo per i saluti
  pw_hash TEXT NOT NULL, pw_salt TEXT NOT NULL, pw_iter INTEGER NOT NULL,
  pwv INTEGER NOT NULL DEFAULT 1,         -- +1 a ogni cambio password / "esci ovunque"
  role TEXT NOT NULL DEFAULT 'user',      -- 'user' | 'admin'
  email_verified_at TEXT, created_at TEXT NOT NULL, last_login TEXT
);
CREATE TABLE tokens (                     -- reset password e verifica email
  hash TEXT PRIMARY KEY,                  -- sha256 del token, mai il token
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,                  -- 'reset' | 'verify'
  expires_at INTEGER NOT NULL, used_at INTEGER
);
CREATE TABLE patches (                    -- My patches, una riga per patch
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pedal TEXT NOT NULL,                    -- 'ms60b' | 'ms50g' (PEDAL.id)
  id TEXT NOT NULL,                       -- id della patch nel browser
  data TEXT NOT NULL,                     -- JSON già validato da cleanPatch()
  pos INTEGER NOT NULL,                   -- ordine della lista
  updated_at TEXT NOT NULL,
  deleted_at TEXT,                        -- lapide: stessa logica di library-merge.js
  PRIMARY KEY (user_id, pedal, id)
);
CREATE TABLE docs (                       -- tutto il resto, un documento JSON per tipo
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pedal TEXT NOT NULL,
  kind TEXT NOT NULL,                     -- 'advice' | 'rulepacks' | 'usb-backups' | 'builder' | 'view'
  data TEXT NOT NULL, updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, pedal, kind)
);
```

Date in ISO 8601 UTC (`2026-10-27T10:00:00.000Z`), come `updatedAt` oggi. Limiti per utente e pedale: 300 patch (come oggi), 30 backup USB, rule pack entro 200 KB, corpo richiesta 1 MB.

### Cosa si salva nell'account

| Chiave nel browser | Nell'account | Fusione |
|---|---|---|
| `<p>-library` + `<p>-deleted` | `patches` | `LIBMERGE.merge` (invariata) |
| `<p>-rulepacks` | `docs/rulepacks` | per pack: vince il più recente, unione per id |
| `<p>-usb-backups` | `docs/usb-backups` | unione per id, i 30 più recenti |
| `<p>-advice`, `<p>-view` | `docs` | vince il documento più recente |
| `<p>-builder` | `docs/builder` | vince il più recente (la patch in lavorazione segue l'utente) |
| `<p>-pedal-edit`, `<p>-sync` | **no** | legati a questo browser / alla USB |

Le nuove regole di fusione per i `docs` vanno in `site/library-merge.js` (`mergeDocs`), così restano condivise client/server come oggi.

## 3. API e flusso di autenticazione

Pagine (server, form classici, `noindex`, `X-Frame-Options: DENY`):

- `GET/POST /register` — aperta a tutti: email, password (min 10 caratteri), nome facoltativo. Crea l'account e apre subito la sessione (nessuna verifica obbligatoria), manda la mail di benvenuto **senza password** con il link facoltativo "Confirm your email" (monouso, 24 h) e, se configurato, avvisa l'admin su Telegram come PatternMachine.
- `GET/POST /login` — email + password; `?next=` filtrato da `safeNext`.
- `GET/POST /forgot` — manda il link di reset (1 h, monouso); risposta sempre uguale.
- `GET/POST /reset?token=` — nuova password, `pwv+1` (chiude le altre sessioni), login.
- `GET /verify?token=` — segna l'email come confermata.
- `POST /logout` — cancella il cookie (POST, non GET, per evitare logout da link esterni).
- `GET /account` — email, cambio password, "Sign out everywhere", "Download my data" (JSON), "Delete my account" (con conferma password).

API JSON:

- `GET /api/me` → `{ signedIn: false }` oppure `{ signedIn: true, email, name, verified }`.
- `POST /api/account/sync/<pedal>` con `{ patches, deleted, docs: { kind: { data, updatedAt } } }` → fonde in una transazione e restituisce lo stato fuso (stesso schema di `/api/sync` oggi, più `docs`). `401` se non loggato.
- `GET /api/account/export` → tutti i dati dell'utente.
- `/api/sync/<hash>` (codice anonimo) **si toglie** insieme alla finestra Sync del builder (`#sync-dialog`, `SYNC_KEY`, `codeToId`…); la richiesta risponde `410 Gone` con "Sync codes have been replaced by accounts: sign in to keep your patches." per i browser con una versione vecchia in cache.

Nel browser (`site/account.js`, caricato in tutte le pagine dei due pedali):

- all'avvio legge `/api/me` (con cache in `sessionStorage` per non rallentare le pagine offline);
- se loggato, sincronizza **entrambi i pedali** (`ms60b` e `ms50g`, stessa origine) all'avvio, 2 s dopo ogni modifica, al ritorno sulla scheda e quando torna la rete: è il meccanismo di `syncNow()` di `builder.js`, spostato in un modulo condiviso e reso generico;
- offline continua a funzionare su `localStorage`; la sincronizzazione riprende appena possibile.

## 4. Migrazione al primo login

1. Dopo il login, `account.js` controlla se questo browser ha dati locali che l'account non ha ancora (patch, rule pack, backup USB, per ciascun pedale).
2. Se l'account è **vuoto**: carica tutto senza chiedere ("Your 12 patches from this browser are now in your account.").
3. Se l'account ha già dati: finestra "This browser has 12 patches that are not in your account" con **Add them to my account** (predefinito, fusione con `LIBMERGE`, nulla si perde) o **Not now** (restano solo qui; si può ripetere da `/account`).
4. Se il browser usava un **codice di sync**: la sua libreria è già in `localStorage`, quindi entra con lo stesso passo; la chiave `-sync` rimasta si cancella all'avvio.
5. Sul server non c'è nulla da migrare (`zoom-ms60b-data` è vuota). Al deploy si controlla di nuovo: se nel frattempo comparisse un `<hash>.json`, resta nel backup e il suo contenuto è comunque nel browser di chi lo usava.
6. **Logout**: finestra "Sign out" con due pulsanti: **Remove from this browser** (predefinito, pulsante principale: cancella da questo browser patch, preferenze, rule pack e backup USB di entrambi i pedali, che restano nell'account) e *Keep a copy here*. Prima di cancellare si fa un ultimo sync; se il sync fallisce (offline) la cancellazione non avviene e la finestra lo dice: "Can't reach the server: your latest changes are only in this browser. Sign out anyway and keep them here?".

## 5. Interfaccia (testi in inglese)

**Header** (`.gh-header`, tutte le pagine MS-60B+ e MS-50G+; nella landing solo il link): a destra, dopo "Official Manual ENG/ITA",

- non loggato: pulsante `Sign in` (`btn btn-sm`) che porta a `/login?next=<pagina>`;
- loggato: pulsante con l'iniziale dell'email che apre un menu: email, `Synced 2 min ago` / `Offline: changes saved here`, `Account`, `Sign out`.

**Avviso per chi non è loggato** — barra sottile sotto l'header (stile `flash` di Primer, colore *attention*), su Patch builder, Pedal manager e Tone ideas (la pagina Effects non salva nulla, quindi nessun avviso):

> **Not signed in.** Your patches, settings and pedal backups are stored only in this browser. Clearing browsing data, a private window or another device won't have them. **Sign in** or **create a free account** to keep them safe.

- si può chiudere con `Dismiss`: si riduce a un'etichetta `Saved in this browser only` accanto a "My patches", che resta sempre visibile;
- lo stato "chiuso" vale per la sessione (`sessionStorage`), così l'avviso ricompare alla visita successiva;
- nel Pedal manager, prima di una scrittura sul pedale, il messaggio di backup aggiunge "This backup is kept only in this browser." se non loggato.

**Pagine di accesso**: stessa grafica Primer del sito (card centrata, logo, campi `form-control`), con il link "Continue without an account" che torna alla pagina di provenienza.

**Service worker**: escludere dalla cache `/login`, `/register`, `/forgot`, `/reset`, `/verify`, `/logout`, `/account` (oltre ad `/api/`); bump di `CACHE` e dei `?v=`.

Le pagine `site/ms-50g/*.html` vanno aggiornate a mano come da CLAUDE.md.

## 5 bis. Console utenti (admin)

Come `/admin` di PatternMachine, generata dal server, solo per `role = 'admin'` (gli altri ricevono 403). Il primo admin è **Giovanni**, creato sul server con:

```
node deploy/add-user.mjs --email <la tua email> --name Giovanni --admin
```

(la password si digita senza mostrarla; nessun indirizzo email finisce nel repository). Nel menu dell'account dell'admin compare la voce `Users`.

Pagina `/admin` (testi in inglese):

- **Riepilogo**: utenti totali, nuovi negli ultimi 7/30 giorni, attivi negli ultimi 30 giorni, patch salvate per pedale (MS-60B+ / MS-50G+), spazio del database.
- **Tabella utenti**: email, nome, `admin` come tag, email confermata sì/no, data di registrazione, ultimo accesso, numero di patch per pedale, ultimo sync. Ricerca per email e ordinamento per colonna.
- **Azioni per utente** (mai su se stessi), ognuna è un form POST con controllo CSRF:
  - `Send reset link` (manda la mail di reset; senza mail configurata mostra il link da girare a mano, come PatternMachine);
  - `Sign out everywhere` (`pwv+1`);
  - `Make admin` / `Remove admin`;
  - `Download data` (stesso JSON dell'export dell'utente, per assistenza);
  - `Delete` con pagina di conferma ("Delete the account of …? Their patches stay in their browsers. This can't be undone.").
- **Patch di un utente** (`/admin/user/<id>`): lista in sola lettura delle patch per pedale (nome, effetti, data), per aiutare in caso di problemi; nessuna modifica dei dati dell'utente.
- ~~Stato del servizio~~ (tolto il 2026-10-29: mail, Telegram, ultimo backup e il pulsante `Send test email`; la prova della mail resta `node set-mail.mjs --test <email>`).

Rotte: `GET /admin`, `GET /admin/user/<id>`, `POST /admin/reset`, `/admin/signout`, `/admin/role`, `/admin/delete`. Ogni azione dell'admin si registra in una tabella `admin_log (at, admin_id, action, target_id)`, visibile in fondo alla pagina (ultime 100).

Aggiunta allo schema:

```sql
CREATE TABLE admin_log (
  at TEXT NOT NULL, admin_id TEXT NOT NULL, action TEXT NOT NULL, target_id TEXT
);
```

Test in `tools/auth-test.mjs`: utente normale → 403 su ogni rotta `/admin`; admin non può cancellarsi né togliersi il ruolo; ogni azione scrive in `admin_log`; CSRF cross-site → 403.

## 6. Sicurezza

- **Password**: PBKDF2-SHA256 600 000 iterazioni (come PatternMachine), sale 16 byte, `timingSafeEqual`; minimo 10 caratteri.
- **Sessione**: cookie `zms_session=v2.<uid>.<pwv>.<exp>.<hmac>`, `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=30 giorni`, rinnovato quando mancano meno di 7 giorni. Segreto HMAC da `SESSION_SECRET` (env) o generato in `meta`. Revoca: `pwv+1` (cambio password, reset, "Sign out everywhere").
- **CSRF**: ogni POST passa il controllo `Sec-Fetch-Site`/`Origin` di PatternMachine; in più `SameSite=Lax` e, per le API, `Content-Type: application/json` obbligatorio.
- **Rate limit** (in memoria, per IP da `cf-connecting-ip`, finestra 15 min): login 10 errori per IP e 5 per email; register 5; forgot 5 per IP e 3 per email; verify/reset 20. Ritardo 0.4 s sui login sbagliati. Il limite generale di 90 richieste/min sulle API resta.
- **Token** (reset 1 h, verifica 24 h): 32 byte casuali, sul DB solo lo SHA-256, monouso, pulizia dei token scaduti all'avvio e ogni ora.
- **Niente enumerazione degli account**: login e `/forgot` rispondono sempre allo stesso modo. `/register` invece dice "An account with this email address already exists": senza verifica obbligatoria la registrazione apre subito la sessione, quindi nasconderlo renderebbe confusa la pagina (il limite di 5 registrazioni per IP frena la ricerca di indirizzi).
- **Header**: `X-Frame-Options: DENY` e `Cache-Control: no-store` su pagine di accesso e API; `Content-Security-Policy` stretta sulle pagine di accesso (il sito non usa script esterni, quindi si può estendere dopo).
- **Validazione**: tutto ciò che arriva passa da `cleanPatch`/`cleanState` (già esistenti) e da validatori nuovi per i `docs` (rule pack: stessa validazione di `site/rule-packs.js`).
- **Privacy**: serve una breve pagina `privacy.html` (email, dati salvati, backup 30 giorni, cancellazione dall'account). Nessun analytics.

## 7. Configurazione su hp-ubuntu

Nuove variabili nel servizio (`deploy/zoom-ms60b.service`), tramite `EnvironmentFile=/srv/apps/zoom-ms60b-app/.env` (permessi 600, mai in git, fuori dalla web root):

```
SITE_URL=https://zoommultistompstudio.tongatron.org
DB_FILE=/srv/apps/zoom-ms60b-data/studio.db
SESSION_SECRET=<64 hex, openssl rand -hex 32>
MAIL_FILE=/srv/apps/zoom-ms60b-app/mail.json
TELEGRAM_FILE=/srv/apps/zoom-ms60b-app/telegram.json   # facoltativo
```

`mail.json` si crea con `node deploy/set-mail.mjs` usando la stessa casella Gmail e la stessa password per le app di PatternMachine, con `from_name: "ZOOM MultiStomp Studio"` (lo script la chiede a terminale; nessun segreto nel repository). `telegram.json` (`token`, `chat_id`) si crea allo stesso modo con `deploy/set-telegram.mjs`, con il bot dedicato al sito (creato con @BotFather); messaggio: "New user signed up on ZOOM MultiStomp Studio", email, data. Senza mail configurata: registrazione e login funzionano, "Forgot password" mostra "Password recovery by email is not active."

**Backup**: `backup-sync-data.sh` diventa `backup-data.sh`: prima `node deploy/db-backup.mjs` (fa `VACUUM INTO` in un file temporaneo, copia coerente anche col server acceso), poi lo stesso `tar` giornaliero con 30 giorni di conservazione in `/srv/apps/zoom-ms60b-backups`. Nessuna copia fuori dal server (decisione presa): protegge da errori e fusioni sbagliate, non dalla perdita del disco.

## 8. Test

- `tools/sync-test.mjs`: estendere a `/api/account/sync/<pedal>` (fusione patch + docs, limiti, 401 senza sessione, isolamento tra utenti e tra pedali).
- **nuovo** `tools/auth-test.mjs` (server su porta casuale, DB temporaneo, `MAIL_OUTBOX`): registrazione, login giusto/sbagliato, rate limit, cookie manomesso o scaduto, `pwv` che chiude le sessioni, reset monouso e scaduto, verifica email, CSRF (`Sec-Fetch-Site: cross-site` → 403), `next=//evil` → `/`, export e cancellazione account.
- `tools/e2e-test.mjs` (Playwright): avviso visibile da anonimo e chiudibile; registrazione → migrazione delle patch locali; secondo contesto browser che fa login e vede le stesse patch; logout con la scelta predefinita "Remove from this browser" (il browser torna vuoto, l'account no) e logout offline (niente cancellazione).
- `auth-test.mjs` controlla anche il messaggio Telegram in modalità outbox (`TELEGRAM_OUTBOX`) alla registrazione.
- `package.json` `test`: aggiungere `auth-test.mjs`; CLAUDE.md: aggiungere il comando da lanciare dopo modifiche a `deploy/auth.mjs`/`db.mjs`.

## 9. Fasi e deploy

1. **Server**: `db.mjs`, `auth.mjs`, `mail.mjs`, `pages.mjs`, rotte in `server.mjs`, `auth-test.mjs`. Deploy solo server (le pagine nuove esistono ma nessun link le mostra).
2. **Sync account**: `/api/account/sync`, `mergeDocs` in `library-merge.js`, `site/account.js`, `sync-test.mjs` esteso.
3. **UI**: header, avviso, migrazione, logout, `/account`, MS-50G+, service worker, rimozione dei codici di sync anonimi dal builder e dal server, e2e.
4. **Console admin**: `/admin`, `admin_log`, creazione dell'account admin di Giovanni con `add-user.mjs`.
5. **Pulizia**: `privacy.html`, CLAUDE.md (nuovi comandi e regole), `backup-data.sh`.

Deploy di ogni fase:

```
node tools/sync-test.mjs && node tools/auth-test.mjs && PW_CHANNEL=chrome node tools/e2e-test.mjs
node tools/stamp-update.mjs          # poi commit
rsync -a deploy/*.mjs hp-ubuntu:/srv/apps/zoom-ms60b-app/
# solo la prima volta: .env, mail.json, unità systemd aggiornata, daemon-reload
ssh hp-ubuntu 'sudo systemctl restart zoom-ms60b'
rsync -a --exclude '.DS_Store' site/ hp-ubuntu:/srv/apps/zoom-ms60b/
```

`server.mjs` carica `library-merge.js` dalla web root (`ROOT`): quando cambia `library-merge.js`, va deployato `site/` **prima** del riavvio. Prima della fase 1, un backup manuale di `/srv/apps/zoom-ms60b-data`.

## 10. Domande aperte

Nessuna: tutte le domande hanno una risposta (vedi "Decisioni prese" in cima). Il piano è pronto per la fase 1.

## 11. Stato (2026-10-27)

Fasi 1–5 implementate e testate (`auth-test` 18, `sync-test` 11, e2e 15, `advice-test`), commit su `main`, **non ancora in produzione**.

Checklist del primo deploy su `hp-ubuntu`:

1. Backup manuale: `tar -czf ~/zoom-before-accounts.tar.gz -C /srv/apps zoom-ms60b-data zoom-ms60b-app`.
2. In locale: tutti i test, `node tools/stamp-update.mjs`, commit, push.
3. File del server: `rsync -a deploy/*.mjs deploy/backup-data.sh hp-ubuntu:/srv/apps/zoom-ms60b-app/`.
4. Sito: `rsync -a --exclude '.DS_Store' site/ hp-ubuntu:/srv/apps/zoom-ms60b/` (prima del riavvio: `server.mjs` carica `library-merge.js` dalla web root).
5. Segreti, in `/srv/apps/zoom-ms60b-app/` (permessi 600):
   - `.env` con `SITE_URL=https://zoommultistompstudio.tongatron.org`, `SESSION_SECRET=` (da `openssl rand -hex 32`), `MAIL_FILE=/srv/apps/zoom-ms60b-app/mail.json`, `TELEGRAM_FILE=/srv/apps/zoom-ms60b-app/telegram.json`;
   - `node set-mail.mjs` (casella Gmail e password per le app di PatternMachine), poi `node set-mail.mjs --test <email>`;
   - `node set-telegram.mjs` (token del bot del sito e chat id), poi `node set-telegram.mjs --test`.
6. Unità systemd aggiornata (`deploy/zoom-ms60b.service`: `EnvironmentFile`, `--disable-warning`), `sudo systemctl daemon-reload && sudo systemctl restart zoom-ms60b`.
7. Admin: `cd /srv/apps/zoom-ms60b-app && DATA_DIR=/srv/apps/zoom-ms60b-data node --disable-warning=ExperimentalWarning add-user.mjs --email <la tua email> --name Giovanni --admin`.
8. Crontab: sostituire `backup-sync-data.sh` con `backup-data.sh` nella riga delle 03:30; lanciarlo una volta a mano; cancellare il vecchio `backup-sync-data.sh` dal server.
9. Controlli: registrazione di prova, mail ricevuta, notifica Telegram, `/admin`, (la mail si prova con `node set-mail.mjs --test <email>`).
