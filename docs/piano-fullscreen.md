# Piano: vista a schermo intero (ogni pagina in una schermata)

Stato: **promossa a interfaccia di tutto il sito, MS-60B+ e MS-50G+ (2026-10-27)**: vedi la fase 6. Le pagine classiche e il laboratorio non ci sono più (restano nella cronologia di git, fino al commit `b2ecd1c`); `site/_fullscreen/` contiene solo reindirizzamenti dai vecchi indirizzi di prova. Il resto del documento racconta com'è nata la versione di prova e il suo percorso (gli indirizzi `_fullscreen/` e le pagine "classiche" citati sotto sono quelli di allora).
Il testo del sito resta in inglese (CLAUDE.md); questo piano è in italiano.

## Decisioni prese (2026-10-27)

- **"Senza scroll" = regola 1**: la pagina non scorre mai, una lista lunga può scorrere dentro il suo pannello. La struttura B "a pagine" (regola 2) è quindi uscita dal confronto; al suo posto il laboratorio prova **B · Pedalboard**, che rispetta la regola 1.
- **Struttura scelta: A · Panels.**

## Versione full screen (`site/_fullscreen/`)

Otto pagine MS-60B+, servite su `https://zoom.tongatron.org/_fullscreen/`:

| Pagina | Pannelli |
|---|---|
| `index.html` (Effects) | filtri \| lista (con la casella di ricerca sotto la testata) \| dettaglio fisso (`<dialog data-docked>`, opzione di `app.js`; senza frecce avanti/indietro, con "Add to patch" subito dopo la descrizione) |
| `builder.html` | catena \| patch (nome, DSP con barra sottile, Save e Download piccoli; una freccia nella testata chiude il box e la scelta resta nel browser) e My patches \| Advice (sempre attivo, senza interruttore; in cima gli avvisi della patch, es. "Check on the pedal"). Sotto i 1280 px due colonne: Advice sotto la catena |
| `pedal-manager.html` | My patches \| On the pedal \| connessione, Backups, MIDI log |
| `tones.html` | filtro in alto; By style \| By bassist |
| `resources.html` | manuali, Effects List, note e "About the patch files" \| Still to check |
| `technical-notes.html` | indice \| testo (da `technical-notes.md`) |
| `privacy.html` | indice \| testo (caricato da `site/privacy.html`, così le due versioni non divergono) |
| `guide.html` (pulsante **Guide**, in alto a destra, subito prima del menu dell'utente) | indice \| guida con gli how-to: Quick start, Find an effect, Build a patch, Read the advice, Save/share/compare, **How to load it on the pedal** (spostato dal pannello My patches del builder), Pedal manager, Tone ideas, account, scorciatoie, **Resources** (il link alla pagina Resources non è più nella barra di stato) |

- `fullscreen.css` (guscio + pannelli), `fullscreen.js` (`PEDAL.base = '../'` e l'indice dei documenti).
- Testi uguali alle pagine classiche; cambiano solo i contenitori. Barra in alto (senza il tag "Full screen") con il selettore del pedale (mostra il pedale scelto, "MS-60B+ bass", con la freccia; elenca i due pedali Zoom; l'MS-50G+ apre per ora la vista classica), Effects, Patch builder e Pedal manager, la sezione attiva in una pillola blu (Tone ideas si apre dal builder, con un pulsante nella catena), poi il pulsante Guide a destra, subito prima dell'account (icona sola sotto 900 px). Barra di stato: a sinistra Privacy, Source on GitHub e il pulsante tongatron.org (B3 di tongatron.org/pulsanti: pallino giallo con alone, sfondo della barra, nessuna animazione, evidenziato al passaggio del mouse); a destra l'attribuzione ZOOM e "Last update" (le pagine sono in `tools/stamp-update.mjs`). Resources si apre dalla Guida; il link "Classic view" non c'è più.
- `noindex`, niente service worker (`pwa.js` non caricato), nessun link dal sito classico.
- `app.js`: il dettaglio docked (`data-docked`) si apre senza sfondo, resta aperto, mostra il primo effetto, segna l'effetto nella lista e lascia frecce, `/` ed Esc alla ricerca. Non ha pulsanti avanti/indietro né "Turn advice off" e mette "Add to patch" dopo la descrizione. `builder.js` tratta l'interruttore Advice come facoltativo: dove non c'è (full screen) l'advice è sempre acceso, qualunque cosa sia salvata. Il sito classico non cambia.
- Test: `node tools/fullscreen-test.mjs` (Playwright): ogni pagina a 1440×820, 1280×680 e 1024×700 senza tagli né comandi fuori schermo e con la barra in alto senza sovrapposizioni (anche a 800 px), il builder anche con 6 effetti e la barra "Not signed in", il selettore del pedale (primo, mostra il pedale scelto, due pedali nell'elenco, Esc e clic fuori lo chiudono), gli avvisi della patch nel pannello Advice e Save/Download piccoli, con 30 patch salvate l'ultima raggiungibile in My patches (builder e Pedal manager), a 390×700 solo scroll verticale, e poi: barra di stato (ordine, tongatron.org B3 con solo l'evidenziazione al passaggio, nessun Resources/Classic view), nessun tag "Full screen" e Guide prima dell'account, ricerca nel pannello della lista, dettaglio senza frecce e con "Add to patch" sotto la descrizione, advice non spegnibile (anche se la pagina classica l'ha salvato spento), colonne del builder, barra DSP sottile, freccia del box Patch. 56/56 al 2026-10-27.
- Il laboratorio (`lab.html`, `a/`, `b/`, `shell.css`, `lab-shims.js`) resta come archivio del confronto.

## Laboratorio (`site/_fullscreen/lab.html`)

- **A · Panels** (`a/index.html`, `a/builder.html`, `a/a.css`): Effects = filtri | lista | dettaglio fisso (il dialog diventa un pannello non modale, frecce per sfogliare); Builder = catena | Advice | patch e My patches.
- **B · Pedalboard** (`b/index.html`, `b/builder.html`, `b/b.css`): Effects = filtri a chip in una barra, galleria a tutta larghezza, dettaglio in overlay come oggi; Builder = striscia patch (nome, DSP, Save, Download, avvisi), 6 slot affiancati come pedali con i parametri dello slot scelto sotto, Advice e My patches in cassetti laterali.
- **Guscio comune** `shell.css`: barra unica in alto (48 px), barra di stato (28 px) con attribuzione ZOOM, `100dvh` senza scroll, pannelli con scroll interno; sotto 760 × 560 px la pagina torna a scorrere.
- **Adattatori** `lab-shims.js`: fanno girare `app.js` e `builder.js` nei nuovi layout senza modificarli (dettaglio non modale, uno slot per volta, slot liberi, cassetti). Se una struttura viene scelta, vanno trasformati in opzioni vere degli script.
- **Script condivisi**: unica modifica, il prefisso `PEDAL.base` per le immagini degli effetti (`app.js`, `builder.js`, `pedal-manager.js`, `tones.js`); vuoto nel sito attuale, che non cambia (e2e 15/15).
- **Controllo automatico** nel laboratorio: per ogni layout, pagina e dimensione (1440×820, 1280×680, 1024×700, 390×700) segnala contenuti tagliati, comandi fuori schermo e aree di lavoro troppo basse.
- **Risultato al 2026-10-27**: tutto entra a 1440×820, 1280×680 e 1024×700, anche con 6 effetti e la barra "Not signed in". Unico limite: in B con 6 effetti a 1024×700 restano 130 px ai parametri (il laboratorio lo segnala sotto i 140 px). Sul telefono entrambi tornano allo scroll (fase 4).

Obiettivo: una copia di prova del sito in `site/_fullscreen/` (servita su `https://zoom.tongatron.org/_fullscreen/`) in cui **nessuna pagina scorre**: tutto sta in una schermata e le sezioni sono riorganizzate per farcela. Il sito attuale resta com'è finché non si decide se promuovere la nuova struttura.

## Situazione di partenza (misurata il 2026-10-27)

Altezza totale delle pagine, in schermate (`scrollHeight / altezza finestra`):

| Pagina | 1440×900 | 1280×800 | 390×844 (telefono) |
|---|---|---|---|
| Effects (`index.html`) | 13.8 | 15.6 | 24.5 |
| Patch builder | 1.6 | 1.8 | 3.1 |
| Pedal manager | 1.2 | 1.3 | 1.8 |
| Tone ideas | 2.9 | 3.3 | 7.2 |
| Resources | 3.1 | 3.5 | 4.9 |
| Technical notes | 6.9 | 7.8 | 12.5 |
| Privacy | 1.8 | 2.1 | 2.9 |
| Landing | 4.3 | 4.9 | 8.4 |
| MS-50G+ Effects | 17.5 | 19.8 | 30.1 |

La **cornice** (header 57 px + repo-head 183–329 px + tab 45 px + footer 131–171 px) occupa **416 px su 800 (52%)** prima ancora del contenuto. Primo intervento, valido per qualunque struttura: una sola barra in alto (~48 px) e una barra di stato in basso (~24 px), cioè **72 px (9%)**.

Nota: "1280×800" è lo schermo; dentro il browser (barra indirizzi, segnalibri) la finestra utile di un portatile è spesso **1280×650–700**. I target vanno misurati su `innerWidth × innerHeight`.

## Decisione fondamentale: cosa vuol dire "senza scroll"

1. **La pagina non scorre mai** (`body` alto `100dvh`, `overflow: hidden`), ma un pannello che contiene una lista lunga (97 effetti, My patches, MIDI log, testo lungo) può scorrere **al suo interno**. I comandi principali (catena, parametri, export, navigazione) restano sempre visibili.
2. **Nessuno scroll in assoluto**: il contenuto che non entra si divide in **pagine** (◀ ▶, frecce da tastiera, swipe). Anche le liste e i testi lunghi.

Raccomandazione: **1 come regola, 2 dove il contenuto è limitato per natura** (la catena ha al massimo 6 effetti, i consigli sono pochi, le card delle risorse sono poche). Paginare 97 effetti o le Technical notes è possibile ma rende più lenta la ricerca e la lettura; va provato nel laboratorio prima di sceglierlo.

## Strutture candidate

### A · Pannelli (app shell, stile IDE/DAW)

Barra in alto, barra di stato in basso, in mezzo una griglia di pannelli a dimensione fissa; solo le liste scorrono dentro il pannello.

- **Effects**: categorie e caratteristiche | lista/griglia (scorre) | **pannello dettaglio fisso a destra** al posto del dialog.
- **Builder**: catena orizzontale da 6 slot in alto, parametri dello slot selezionato sotto, Advice in basso (scorre); a destra patch/DSP/export e My patches (scorre).
- **Pedal manager**: già a due pannelli (My patches | On the pedal); Backups e MIDI log in un cassetto.
- **Tone ideas**: elenco stili/bassisti | idea selezionata.
- **Resources**: griglia di card; "Still to check" scorre nel suo pannello.
- **Technical notes / Privacy**: indice a sinistra | testo che scorre nel pannello di lettura.

Pro: il minimo di JS nuovo, regge 97 effetti, familiare. Contro: lo scroll resta, solo spostato nei pannelli; sul telefono serve una navigazione a un pannello per volta.

### B · Schermate (paginazione, zero scroll)

Ogni area che non entra si sfoglia a pagine.

- **Effects**: griglia che calcola quante schede entrano (`ResizeObserver`, es. 5×3 = 15 → circa 7 pagine), pager in basso, filtri come chip in riga; dettaglio in overlay.
- **Builder**: 6 slot grandi come una pedaliera, parametri fissi, Advice a pagine di 3; My patches in un cassetto laterale.
- **Testi lunghi**: colonne CSS sfogliate in orizzontale (come un e-reader).

Pro: davvero senza scroll, vicino al pedale, buono per prove e palco. Contro: più JS (paginazione, ricalcolo al resize, ricerca che salta tra pagine), accessibilità delle pagine nascoste, testi lunghi scomodi.

### C · Console (dal prototipo Stage di `site/designs/stage.html`)

Il sito diventa uno strumento: display LCD con 6 slot, 4 manopole grandi, 6 footswitch; gli effetti si sfogliano come sul pedale (categoria ▲▼, effetto ◀▶); il resto in overlay.

Pro: identità forte, ottimo al tocco. Contro: è una riscrittura, le pagine di testo non c'entrano con la metafora, lontana dal sito attuale.

### Raccomandazione di partenza

**A come base, con elementi di B** dove il contenuto è limitato: catena a 6 slot fissi, Advice a pagine, card delle risorse. C resta un riferimento visivo per il builder su tablet. La scelta finale si fa nel laboratorio (fase 1), con le pagine vere.

## Come valutare (laboratorio)

Sul modello di `site/designs/index.html` (iframe in scala, note e preferito salvati nel browser):

- `site/_fullscreen/lab.html`: mostra **A** e **B** (e C se serve) sulle due pagine critiche, **Effects** e **Builder**, con i dati e gli script veri, a dimensioni fisse: 1440×820, 1280×680, 1024×700 (iPad orizzontale), 390×700 (telefono).
- Un **controllo automatico** per ogni riquadro: rosso se `scrollHeight > innerHeight` o `scrollWidth > innerWidth`, oppure se un comando chiave (Add effect, Export, Save) esce dalla finestra.
- Criteri di scelta, uno per riga nella scheda di ogni prototipo:
  - entra nel target più piccolo (1280×680) senza tagliare comandi;
  - numero di clic per il giro tipico: trova effetto → aggiungi → regola → esporta;
  - leggibilità: testo ≥ 13 px, target al tocco ≥ 44 px su tablet;
  - quanto JS va cambiato (gli script condivisi restano quelli di `site/`);
  - costo di manutenzione: ogni pagina va replicata anche per l'MS-50G+.

## Scelte tecniche (valide per qualunque struttura)

- **Cartella**: `site/_fullscreen/` con le proprie pagine HTML e un `fullscreen.css` caricato dopo `styles.css` e `theme.css`; gli script condivisi si caricano da `../` (come fa `site/ms-50g/`). Nessuna copia degli script: una correzione vale per entrambe le versioni.
- **Stessa origine**: stesso `localStorage` (`ms60b-*`), stesso cookie `zms_session`, stessa sync dell'account. La versione di test lavora sulle patch vere; dato che gli script sono gli stessi non scrive niente di diverso.
- **Id e classi da non toccare**: gli script cercano gli elementi per id (`app.js`, `builder.js`, `pedal-manager.js`, `tones.js`); `account.js` aggancia il menu a `.gh-header` e l'avviso a `<body data-account-notice>`; `tools/stamp-update.mjs` aggiorna `<time class="gh-updated">`. Si spostano i contenitori, non i componenti.
- **Percorsi delle immagini**: oggi sono relativi e fissi (`assets/effects/fx-NNN.png` in `app.js:23`, `builder.js:24`, `pedal-manager.js:77`, `tones.js:16`). Da `_fullscreen/` si rompono: aggiungere un prefisso opzionale (es. `PEDAL.base`, vuoto di default, `'../'` nelle pagine di test) invece di copiare le immagini.
- **Layout**: `html, body { height: 100dvh; overflow: hidden }`, griglia `auto 1fr auto`; ogni pannello `min-height: 0; overflow: auto; overscroll-behavior: contain`, con `tabindex="0"` e `aria-label` perché si possa scorrere da tastiera.
- **Soglia**: sotto una dimensione minima la pagina non ha layout. Deciso: 800 × 640 px, con un avviso al posto della pagina (era un ripiego con scroll, tolto il 2026-10-27).
- **Footer**: diventa la barra di stato (Data © ZOOM Effects List, Privacy, Last update, GitHub). L'attribuzione a ZOOM resta sempre visibile. La descrizione del `repo-head` va in un popover "About" o sparisce.
- **Telefono**: un pannello per volta con una barra di schede in basso (Effects: lista → dettaglio; Builder: Chain | Params | Advice | Patches).
- **Test interno, non indicizzato**: `<meta name="robots" content="noindex">`, niente link dal sito principale finché non si decide (solo un link "Classic view" dal test verso il sito attuale), pagine fuori da `CORE` in `sw.js`. `pwa.js` registra `sw.js` accanto a sé, quindi funziona anche da `_fullscreen/`.

## TODO

### Fase 0 — Decisioni (con te)

- [x] Significato di "senza scroll": regola 1 (pannelli che scorrono), deciso il 2026-10-27.
- [x] Viewport target (`innerWidth × innerHeight`) e soglia: 800 × 640 px, misurata.
- [ ] Pagine incluse: Effects, Builder, Pedal manager, Tone ideas, Resources, Technical notes, Privacy. Landing sì o no (è una pagina di presentazione, lo scroll lì è naturale).
- [ ] Solo MS-60B+ all'inizio, MS-50G+ dopo la scelta (proposta).
- [ ] Link alla versione di test: nessuno (URL diretto) o un link discreto nella barra di stato del sito attuale.

### Fase 1 — Laboratorio

- [x] `site/_fullscreen/lab.html` con iframe in scala ai viewport target e controllo automatico di overflow.
- [x] Prototipo A · Panels su Effects e Builder (pagine vere, `shell.css` + `a/a.css`).
- [x] Prototipo B · Pedalboard su Effects e Builder (al posto della paginazione, dopo la decisione sulla regola 1).
- [ ] (Opzionale) C collegando `site/designs/stage.html`.
- [x] Deploy del laboratorio su `zoom.tongatron.org/_fullscreen/lab.html` (2026-10-27).
- [x] Scelta: A · Panels (2026-10-27).

### Fase 2 — Guscio comune

- [x] Barra unica in alto (`.gh-header`): marchio, sezioni, ricerca, account.
- [x] Scelta del pedale nella barra: selettore con MS-60B+ e MS-50G+ che mostra il pedale scelto (2026-10-27). L'MS-50G+ porta alla vista classica finché non esiste la sua versione full screen (fase 6): allora basta cambiare il link nel menu.
- [x] Barra di stato al posto del footer, con `gh-updated` e attribuzione ZOOM.
- [x] Componenti `fs-pane` / `fs-pane-body` (testata + corpo che scorre) e `fs-toc`; cassetti e paginazione non servono con Panels.
- [x] Prefisso dei percorsi delle immagini negli script condivisi (`PEDAL.base`); il sito attuale non cambia (e2e 15/15).
- [x] L'unico adattatore che serviva a Panels (dettaglio docked) è ora un'opzione di `app.js` (`data-docked`); il builder non ne ha bisogno.
- [x] `noindex`, link "Classic view", `?v=` nuovi, pagine aggiunte a `tools/stamp-update.mjs`.

### Fase 3 — Pagine MS-60B+ (una per volta, ognuna con il suo controllo a tutti i viewport)

- [x] Effects: filtri | lista | dettaglio fisso.
- [x] Patch builder: catena | patch e My patches | Advice (2026-10-27: Advice a destra, patch al centro, box Patch richiudibile); dialog alti al massimo quanto la finestra.
- [x] Pedal manager: My patches | On the pedal | connessione, Backups e MIDI log (pannelli invece di cassetti).
- [x] Tone ideas: By style | By bassist.
- [x] Resources: manuali e note | "Still to check".
- [x] Technical notes: indice | testo.
- [x] Privacy: indice | testo, caricato dalla pagina classica.

### Fase 4 — Schermi piccoli

- [x] Tablet in orizzontale (1024×700): colonne ridotte, controllato dal test.
- [ ] Tablet in verticale (768×1000) e target al tocco 44 px: da provare su un iPad vero.
- [x] Telefono: non si fa (nessuna versione mobile, vedi la fase 6).
- [x] Sotto 800 × 640 px l'avviso al posto della pagina (il test controlla tutte le pagine, i bordi della soglia e la dimensione mostrata).

### Fase 5 — Test

- [x] `tools/fullscreen-test.mjs` (Playwright): ogni pagina × viewport senza tagli, comandi chiave e aree di lavoro visibili, builder con 6 effetti, dettaglio docked (31/31).
- [ ] `tools/e2e-test.mjs` con una base configurabile per farlo girare anche su `/_fullscreen/` (gli id sono gli stessi).
- [ ] Tastiera e lettore di schermo: pannelli raggiungibili e scorribili, focus visibile, `prefers-reduced-motion`.

### Fase 6 — Promozione al sito principale (decisa il 2026-10-27: la vista a schermo intero sostituisce quella classica, MS-60B+ e MS-50G+)

Piano:

1. **Rilievo.** Pagine classiche = stesse pagine della versione full screen (stessi id e script). Differenze da portare: `<head>` SEO (description, Open Graph, manifest, icone), `pwa.js`/service worker, testo della privacy (oggi la pagina full screen lo carica da quella classica), percorsi (`PEDAL.base`), MS-50G+ (solo Effects, Patch builder, Resources; nessun Pedal manager né Tone ideas; banner "Not tested").
2. **MS-60B+ in radice.** Le pagine di `site/_fullscreen/` prendono il posto di quelle classiche (`index`, `builder`, `tones`, `pedal-manager`, `resources`, `technical-notes`, `privacy`) più `guide.html`; `fullscreen.css` e `fullscreen.js` passano in `site/`. Il `<head>` è quello classico (indicizzabile, manifest, icone) più `fullscreen.css`; si aggiunge `pwa.js`. La privacy diventa testo statico nella pagina (niente `fetch`).
3. **MS-50G+.** `site/ms-50g/{index,builder,resources,guide}.html` nello stesso layout: menu del pedale con le due voci (la stessa pagina dell'altro pedale quando esiste), navigazione senza Pedal manager né Tone ideas, riga "Not tested" sotto la barra, dati e link del pedale (127 effetti, manuale e PDF MS-50G+), Guida adattata (niente Pedal manager né Tone ideas).
4. **Telefono.** (Superato lo stesso giorno: vedi "Nessuna versione mobile".) Prima soluzione: sotto i 760 × 560 px le pagine scorrevano e il dettaglio di un effetto si apriva come finestra.
5. **Indirizzi vecchi.** `site/_fullscreen/` diventa una cartella di piccoli reindirizzamenti verso le pagine nuove (come `usb.html`); laboratorio (`lab.html`, `a/`, `b/`, `shell.css`, `lab-shims.js`) rimosso, resta nella cronologia di git.
6. **Pulizia.** `PEDAL.base` non serve più; `sw.js` (elenco `CORE`, versione della cache), `stamp-update.mjs`, README, CLAUDE.md, `privacy.html` (nuova preferenza: Patch box aperto/chiuso).
7. **Test.** `tools/fullscreen-test.mjs` gira sulle pagine in radice e su quelle MS-50G+ (adattamento ai due pedali, menu, banner); `e2e-test.mjs`, `sync-test.mjs`, `auth-test.mjs`, `advice-test.mjs` restano verdi.
8. **Deploy** (solo quando lo chiede l'utente): `node tools/stamp-update.mjs`, commit, rsync via Tailscale; sul server vanno tolti i file del laboratorio.

Stato:

- [x] 1 Rilievo
- [x] 2 MS-60B+ in radice (`index`, `builder`, `tones`, `pedal-manager`, `resources`, `technical-notes`, `privacy`, `guide`)
- [x] 3 MS-50G+ (`ms-50g/` `index`, `builder`, `resources`, `guide`)
- [x] 4 Telefono: tolto, vedi sotto
- [x] 5 Indirizzi vecchi: `_fullscreen/*.html` reindirizzano (anche `?add=` e `#effetto`)
- [x] 6 Pulizia: `PEDAL.base` e l'interruttore Advice tolti dal codice, `sw.js` (cache v15, `guide.html`, `privacy.html`), `stamp-update.mjs`, `privacy.html`, CLAUDE.md
- [x] 7 Test: `fullscreen-test.mjs` 80/80 (due pedali, avviso sotto 800 × 640 px, reindirizzamenti), e2e 15/15, sync 11/11, auth 18/18, advice 52/52, midi 9/9
- [ ] 8 Deploy (su richiesta): `node tools/stamp-update.mjs`, commit, rsync, poi sul server togliere `_fullscreen/lab.html`, `a/`, `b/`, `shell.css`, `lab-shims.js`, `fullscreen.css`, `fullscreen.js` (rsync senza `--delete` non li rimuove)
- [x] **Nessuna versione mobile (decisione del 2026-10-27).** Il ripiego con scroll e la finestra per il dettaglio sono stati tolti. Sotto 800 × 640 px (la dimensione minima a cui tutte le pagine entrano, misurata) `fullscreen.js` mostra un avviso al posto della pagina: dice che la finestra è troppo piccola e quanto è grande, suggerisce uno schermo più grande o il tutto schermo (F11) e spiega cosa fa il sito. La regola è in CLAUDE.md. Il tablet in verticale (768 px di larghezza) vede quindi l'avviso; in orizzontale (1024 × 768) la pagina intera.
- [ ] Da provare dal vivo su un iPad in orizzontale (target al tocco, tastiera, Safari).
