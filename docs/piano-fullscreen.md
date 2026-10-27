# Piano: versione di test `_fullscreen` (ogni pagina in una schermata)

Stato: **laboratorio pronto, struttura da scegliere**. Data: 2026-10-27.
Il testo del sito resta in inglese (CLAUDE.md); questo piano è in italiano.

## Decisioni prese (2026-10-27)

- **"Senza scroll" = regola 1**: la pagina non scorre mai, una lista lunga può scorrere dentro il suo pannello. La struttura B "a pagine" (regola 2) è quindi uscita dal confronto; al suo posto il laboratorio prova **B · Pedalboard**, che rispetta la regola 1.

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
- **Soglia di ripiego**: sotto una dimensione minima (da decidere, es. altezza < 560 px) la pagina torna a scorrere, invece di tagliare i contenuti.
- **Footer**: diventa la barra di stato (Data © ZOOM Effects List, Privacy, Last update, GitHub). L'attribuzione a ZOOM resta sempre visibile. La descrizione del `repo-head` va in un popover "About" o sparisce.
- **Telefono**: un pannello per volta con una barra di schede in basso (Effects: lista → dettaglio; Builder: Chain | Params | Advice | Patches).
- **Test interno, non indicizzato**: `<meta name="robots" content="noindex">`, niente link dal sito principale finché non si decide (solo un link "Classic view" dal test verso il sito attuale), pagine fuori da `CORE` in `sw.js`. `pwa.js` registra `sw.js` accanto a sé, quindi funziona anche da `_fullscreen/`.

## TODO

### Fase 0 — Decisioni (con te)

- [x] Significato di "senza scroll": regola 1 (pannelli che scorrono), deciso il 2026-10-27.
- [ ] Viewport target (`innerWidth × innerHeight`) e soglia di ripiego.
- [ ] Pagine incluse: Effects, Builder, Pedal manager, Tone ideas, Resources, Technical notes, Privacy. Landing sì o no (è una pagina di presentazione, lo scroll lì è naturale).
- [ ] Solo MS-60B+ all'inizio, MS-50G+ dopo la scelta (proposta).
- [ ] Link alla versione di test: nessuno (URL diretto) o un link discreto nella barra di stato del sito attuale.

### Fase 1 — Laboratorio

- [x] `site/_fullscreen/lab.html` con iframe in scala ai viewport target e controllo automatico di overflow.
- [x] Prototipo A · Panels su Effects e Builder (pagine vere, `shell.css` + `a/a.css`).
- [x] Prototipo B · Pedalboard su Effects e Builder (al posto della paginazione, dopo la decisione sulla regola 1).
- [ ] (Opzionale) C collegando `site/designs/stage.html`.
- [ ] Prova sul portatile, sull'iPad e (per confronto) sul telefono; deploy del laboratorio per provarlo da `zoom.tongatron.org/_fullscreen/lab.html`.
- [ ] Valutazione con i criteri sopra, note nel laboratorio, scelta.

### Fase 2 — Guscio comune

- [ ] Barra unica in alto (`.gh-header`): marchio, scelta pedale, sezioni, ricerca, account.
- [ ] Barra di stato al posto del footer, con `gh-updated` e attribuzione ZOOM.
- [ ] Componenti `pane` (testata + corpo che scorre), `drawer`, `pager`.
- [x] Prefisso dei percorsi delle immagini negli script condivisi (`PEDAL.base`); il sito attuale non cambia (e2e 15/15).
- [ ] Trasformare gli adattatori di `lab-shims.js` della struttura scelta in opzioni di `app.js` / `builder.js`.
- [ ] `noindex`, link "Classic view", `?v=` nuovi, pagine aggiunte a `tools/stamp-update.mjs`.

### Fase 3 — Pagine MS-60B+ (una per volta, ognuna con il suo controllo a tutti i viewport)

- [ ] Effects: filtri | lista | dettaglio fisso (il dialog resta per il telefono).
- [ ] Patch builder: catena a 6 slot, parametri, Advice, colonna patch/My patches; dialog (picker, compare, rule pack editor) alti al massimo quanto la finestra.
- [ ] Pedal manager: due pannelli, Backups e MIDI log in cassetto; avviso "not connected" sempre visibile.
- [ ] Tone ideas: elenco | dettaglio.
- [ ] Resources: card in griglia, "Still to check" in pannello.
- [ ] Technical notes: indice | testo.
- [ ] Privacy: sezioni in colonne o indice | testo.

### Fase 4 — Schermi piccoli

- [ ] Tablet (1024×700 e 768×1000): colonne ridotte, target al tocco 44 px.
- [ ] Telefono: un pannello per volta, barra di schede in basso.
- [ ] Ripiego allo scroll sotto la soglia.

### Fase 5 — Test

- [ ] `tools/fullscreen-test.mjs` (Playwright, come `tools/e2e-test.mjs`): per ogni pagina × viewport, `scrollHeight ≤ innerHeight`, `scrollWidth ≤ innerWidth`, comandi chiave dentro la finestra, dialog che entrano.
- [ ] `tools/e2e-test.mjs` con una base configurabile per farlo girare anche su `/_fullscreen/` (gli id sono gli stessi).
- [ ] Tastiera e lettore di schermo: pannelli raggiungibili e scorribili, focus visibile, `prefers-reduced-motion`.

### Fase 6 — MS-50G+, pubblicazione, decisione

- [ ] Pagine `site/_fullscreen/ms-50g/` (stesse regole di `site/ms-50g/`: niente consigli da basso).
- [ ] Deploy (`node tools/stamp-update.mjs`, commit, rsync via Tailscale) e prova su portatile, iPad e telefono.
- [ ] Decidere: promuovere la nuova struttura al sito principale, tenerla come vista alternativa o archiviarla. Se si promuove: aggiornare CLAUDE.md, `privacy.html` se cambia qualcosa di ciò che è salvato (non previsto) e i test.
