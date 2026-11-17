# Piano: tutti i pedali della linea ZOOM MultiStomp

Stato: bozza del 2026-11-17, da approvare prima di scrivere codice.

## 1. Obiettivo e vincoli

- Portare su ZOOM MultiStomp Studio tutti i MultiStomp elencati su <https://zoomcorp.com/it/it/multi-effects/>, con le funzioni principali: **Effects**, **Patch builder**, **Pedal manager**.
- Ogni pagina dei pedali nuovi è **beta**: barra fissa sotto l'header "Beta — Help us" con un pulsante che apre il modulo di contatto (`data-report="contact"` di `site/report.js`, stesso bot Telegram; nessun indirizzo email pubblicato).
- **Non toccare i pedali già presenti** (MS-60B+, MS-50G+, MS-70CDR+): né i loro dati, né le loro regole, né il loro testo. Le sole modifiche ammesse sono quelle condivise e inevitabili (vedi §5), da approvare.
- Landing (`site/index.html`) aggiornata con le foto dei nuovi pedali, ritagliate e convertite in `.webp`.
- Regole del progetto invariate: sito solo in inglese, testo dell'Effects List copiato alla lettera, niente dialoghi nativi, niente layout mobile, `stamp-update` prima di ogni deploy.

## 2. I pedali

Già presenti: MS-60B+ (testato), MS-50G+ e MS-70CDR+ (in test). Da aggiungere:

| Pedale | Tipo | Effetti | Effetti per patch | Memorie | App / file | Dati disponibili |
|---|---|---|---|---|---|---|
| **MS-200D+** | drive (giallo) | 200+ drive | 2 | 250 | Handy Guitar Lab (iOS), `.zptc` | Effects List PDF (15 MB), Patch Memory List, manuale, supplemento v1.20, firmware 1.30; zoom-zt2 `zoom_fx_HGL/zoom_fx/MS200DPLUS/list_sorted.txt` |
| **MS-80IR+** | amp + IR | 23 amp/cab, 12 effetti, 5 Studio Sounds | 1 amp + 1 ambience + 1 effetto | 80 | Handy Guitar Lab (iOS), IR Loader | Effects List PDF, Patch Memory List, manuale, supplemento v1.10, firmware 1.10; zoom-zt2 `MS80IRPLUS/list_sorted.txt` |
| **MS-90LP+** | looper | 8 LOOP FX, 68 ritmi | — | 100 | nessuna app, trasferimento file USB | solo manuale e supplemento v1.10 (nessun Effects List né Patch list) |
| **MS-50G** (1ª gen.) | chitarra | 100 + 72 (Effect Manager) | 6 | 50 | nessuna app, niente `.zptc` | Effects List PDF sul sito di supporto; protocollo SysEx documentato dalla comunità |
| **MS-60B** (1ª gen.) | basso | 58 (da verificare) | 4 (da verificare) | 50 | come sopra | come sopra |
| **MS-70CDR** (1ª gen.) | spaziale | 86 (da verificare) | 6 | 50 | come sopra | come sopra |

I valori "da verificare" vanno confermati sui PDF ufficiali al punto F1.

### Cosa cambia tra le famiglie

- **Famiglia "+" con Handy Guitar Lab (MS-200D+, MS-80IR+):** stesso formato `.zptc` e stesso protocollo SysEx dell'MS-60B+ (zoom-zt2 li tratta insieme). Si riusano `zptc.js`, `pedal-midi.js`, builder e pedal manager; cambiano numero di slot, memorie, `targetMask` e vincoli. È il lavoro meno rischioso.
  - MS-200D+: 2 effetti per patch, 250 memorie (la lista "On the pedal" deve scorrere bene e caricare a pagine).
  - MS-80IR+: la catena non è libera (uno slot amp, uno ambience, uno effetto): il builder deve mostrare slot tipizzati. Il caricamento delle IR personali **non** si fa (lo fa IR Loader di ZOOM); le IR compaiono solo come parametro.
- **MS-90LP+:** è un looper, non un multieffetto a catena. Niente Patch builder né `.zptc`. Proposta: solo una pagina **Effects** (gli 8 LOOP FX e i 68 ritmi presi dal manuale) e una Guide; Pedal manager rinviato finché non si conosce il protocollo (probabilmente diverso).
- **Prima generazione (MS-50G, MS-60B, MS-70CDR):** formato patch e comandi SysEx diversi, niente Handy Guitar Lab. Serve un codec nuovo (`site/zoom-ms-gen1.js` + `tools/`) e un pedale simulato nuovo. Il Pedal manager parte **in sola lettura** (leggere memorie, salvarle in My patches, scaricarle); la scrittura arriva solo dopo che un tester ha fatto backup e read-back su un pedale vero, come per l'MS-60B+. Export: un file proprio (`.json` con i byte della patch), non `.zptc`.

## 3. Cosa ha ogni pedale nuovo

Cartella `site/<pedale>/` come `site/ms-70cdr/`:

- `pedal.js` (id, nome, slot, memorie, `targetMask`, URL dei PDF e del manuale inglese, `tested: false`, `beta: true`).
- `effects-data.js` estratto con `tools/extract-effects-list.py` dal PDF ufficiale, testo alla lettera e controllato parola per parola; `firmware-data.js` da zoom-zt2.
- `assets/effects/fx-NNN.png`: le immagini degli effetti, estratte dall'Effects List PDF come per l'MS-70CDR+ (la cartella `~/Downloads/zoom` contiene solo le 8 foto dei pedali, non le immagini degli effetti).
- `advice-rules.js` con fonti per il tipo di strumento (regole minime: limiti del manuale come errori, ordine come tip); `node tools/advice-test.mjs` esteso.
- Pagine: `index.html` (Effects), `builder.html`, `pedal-manager.html`, `guide.html`, `resources.html`, `help.html`. Niente Tone ideas.
- `documentazione/<pedale>/`: copie dei PDF scaricati (Effects List, Patch list, manuale EN, supplementi).

### Funzioni beta

Nei pedali nuovi restano fuori le funzioni beta/avanzate dei pedali attuali (da confermare, vedi §7): Tone ideas, rule pack, Audition, Undo delle scritture sul pedale. Restano: Effects con dettaglio, Patch builder con DSP e Advice di base, My patches con sync dell'account, Pedal manager con lettura, scrittura con backup e read-back, Backups.

### Barra beta "Help us"

Componente condiviso nuovo (`site/beta-bar.js` + regole in `fullscreen.css`), attivato da `<body data-beta>`: barra fissa sotto l'header, testo "Beta — this pedal has not been tested on real hardware yet. Own one? Tell us." e pulsante **Write to us** che apre `report.js` in modalità contact. I pedali esistenti mantengono la loro barra "Testing" attuale.

## 4. Landing e immagini

- Le 8 foto (517 × 528 px, sfondo trasparente) vanno ritagliate al bordo del pedale e convertite in `.webp` in `site/landing/` (`pedal-ms200d.webp`, `pedal-ms80ir.webp`, `pedal-ms90lp.webp`, `pedal-ms50g-gen1.webp`, …). Le foto di MS-50G+, MS-60B e MS-70CDR+ già presenti sulla landing non si sostituiscono.
- Sono piccole rispetto a quelle attuali (854 × 1266): sulla landing vanno in una griglia "More MultiStomp pedals (beta)" sotto le tre schede esistenti, non nell'hero.
- Ogni scheda: foto, nome, tipo, tag **Beta**, 4 icone di effetti, pulsante "Open … studio".
- Aggiornare titolo, description e dati strutturati con `node tools/seo-tags.mjs` (nuove righe nella tabella) e il testo del box "too small" di `fullscreen.js` se cita i pedali.

## 5. File condivisi da toccare (unica eccezione al "non modificare")

Aggiungere un pedale oggi richiede di toccare: `deploy/pedals.mjs`, `site/account.js` (`PEDALS`), `site/sw.js`, `tools/seo-tags.mjs`, `tools/stamp-update.mjs`, `tools/check-sources.mjs`, `tools/firmware-audit.mjs`, `tools/fullscreen-test.mjs`, `tools/auth-test.mjs`, `deploy/admin-pages.mjs`, `README.md`, `CLAUDE.md`, e il **menu dei pedali scritto a mano in ogni pagina HTML** (anche quelle dei pedali esistenti).

Proposta, primo passo del lavoro: un solo elenco `site/pedals.js` (id, nome, tipo, stato) letto da menu, account, service worker e test; nelle pagine esistenti cambia solo il menu, che viene generato da quell'elenco. Contenuto e comportamento dei pedali esistenti restano identici, verificato da `fullscreen-test`, `e2e-test` e `pedal-manager-test` prima e dopo.

## 6. Fasi

- **F0 — Fondamenta (nessun pedale nuovo visibile).** `site/pedals.js` e menu generato; barra beta; pedali nuovi nel sync account e nella console admin; test esistenti tutti verdi.
- **F1 — Dati.** Scaricare i PDF in `documentazione/`, estrarre effetti e immagini, confrontare con zoom-zt2, confermare i numeri della tabella §2.
- **F2 — MS-200D+.** Effects, Patch builder (2 slot), Pedal manager (250 memorie), guide, help, resources, landing. Test: advice, midi (pedale simulato con 250 memorie e 2 slot), fullscreen, e2e.
- **F3 — MS-80IR+.** Come F2 con slot tipizzati amp / ambience / effetto e regole dei limiti come errori.
- **F4 — MS-90LP+.** Pagina Effects (LOOP FX e ritmi dal manuale) e Guide; niente builder né pedal manager.
- **F5 — Prima generazione, sola lettura.** Codec gen1 + pedale simulato; Effects e Patch builder con export proprio; Pedal manager che legge e salva.
- **F6 — Prima generazione, scrittura.** Solo dopo un test su pedale vero da parte di un tester (backup + read-back).
- Ogni fase: `stamp-update`, test, commit, deploy, verifica del dominio ufficiale.

## 7. Decisioni (2026-11-17)

1. Funzioni beta nei pedali nuovi: **solo Pedal audition** (`audition.js`). Niente Tone ideas, rule pack, Undo delle scritture sul pedale.
2. Prima generazione (MS-50G, MS-60B, MS-70CDR senza "+", modelli diversi dai tre "+" già sul sito, che restano come sono): **da decidere**.
3. MS-90LP+: solo Effects + Guide. Approvato.
4. Menu generato da `site/pedals.js`: approvato; ogni pedale nella sua sottocartella `site/<folder>/`.
5. Barra beta "Beta — this pedal has not been tested on real hardware yet. Own one? Tell us." con **Write to us**: approvata.

## 8. F0 fatto (2026-11-17)

- `site/pedals.js`: l'elenco dei pedali (id, cartella, nome, tipo, etichetta, `beta`).
- `node tools/pedals.mjs` scrive il menu dei pedali di tutte le pagine (l'altro pedale si apre sulla stessa pagina quando esiste, altrimenti su Effects) e, nelle pagine dei pedali `beta: true`, la barra `.fs-note.fs-beta` subito sotto l'header, con il pulsante che apre Contact us di `report.js`. `--check` non cambia nulla e fallisce se una pagina non è aggiornata o se `deploy/pedals.mjs`, `PEDALS` di `site/account.js`, `CORE` di `site/sw.js` o `PEDAL.id` dei `pedal.js` non corrispondono.
- Unico cambiamento visibile sui pedali esistenti: nei menu di builder, guide, resources, help e pedal manager il link agli altri pedali porta alla stessa pagina (prima a volte portava a Effects); nella guida dell'MS-70CDR+ l'etichetta "Testing" del menu ha lo stesso colore delle altre pagine.
- Stile della barra in `fullscreen.css` (`?v=fs42-20261117` in tutte le pagine). Provata su una copia del sito con l'MS-70CDR+ marcato beta: barra visibile, il pulsante apre Contact us con il nome del pedale.
- Un pedale nuovo si aggiunge con una riga in `site/pedals.js`, in `deploy/pedals.mjs` e in `PEDALS` di `site/account.js`, con le sue pagine in `CORE` di `site/sw.js`, e poi lanciando `node tools/pedals.mjs`.
- Test: `e2e-test` e `sync-test` passano. `fullscreen-test` (builder a 800 × 640: "Download .zptc off screen") e `pedal-manager-test` ("a local edit offers to update the linked pedal memory") falliscono, ma falliscono uguali anche senza queste modifiche: vanno sistemati a parte.

## 9. F1 in corso (2026-11-17)

- PDF ufficiali scaricati da zoomcorp.com in `documentazione/ms-200dplus/` (Effects List, Patch list, manuale EN, supplemento v1.20, Handy Guitar Lab), `documentazione/ms-80irplus/` (FX list, Patch list, manuale EN, supplemento v1.10, Handy Guitar Lab) e `documentazione/ms-90lpplus/` (manuale IT e supplemento v1.10; il manuale inglese esiste solo in HTML: <https://zoomcorp.com/manuals/ms-90lpplus-en/>).
- **MS-80IR+:** `python3 tools/extract-effects-list.py documentazione/ms-80irplus/E_MS-80IRplus_FX-list.pdf --images DIR` dà 23 AMP, 5 STUDIO AMBIENCE, 8 TOOL, 4 DELAY con testo e immagini; la sezione USER IR produce 4 voci sbagliate (testo esplicativo, non effetti): da trattare a mano.
- **MS-200D+:** impaginazione diversa, quindi nuova modalità `--layout 200d` dell'estrattore (quella di default non cambia: l'MS-50G+ dà ancora 127 effetti). `python3 tools/extract-effects-list.py documentazione/ms-200dplus/E_MS-200Dplus_EffectsList.pdf --layout 200d --images DIR` dà **217 effetti** (BOOSTER 23, OVERDRIVE 60, DISTORTION 51, FUZZ 44, PREAMP 22, TOOL 17), ognuno con nome, descrizione, riga CHARACTER (campo `character`; i 17 TOOL non l'hanno), parametri e immagine. Le 10 ★ (compressori, limiter, EXCITER) sono segnate `handyGuitarLab: true`. Controllo parola per parola: le 10.533 parole delle pagine 3–44 del PDF (senza titoli, numeri di pagina, ★ ed etichette del disegno delle manopole) corrispondono esattamente a quelle estratte. Come è letto il PDF: le colonne dei parametri si spostano (le schede TOOL non hanno il disegno delle manopole), quindi il nome del parametro è ciò che sta a sinistra della colonna della descrizione; le etichette delle manopole (HelveticaNeue, Hiragino) sono escluse; quattro nomi sono a 9.8 pt (EAGLE, FIREBALL, KRAMPUS, BLACK OPTICAL COMPRESSOR); una descrizione lunga è centrata sul nome, quindi ogni paragrafo va al nome più vicino. Immagini larghe 203–204 px e alte 203–275 px (le schede non sono tutte uguali): da uniformare prima di `assets/effects/`.
- zoom-zt2 `MS200DPLUS/list_sorted.txt` ha solo 73 voci: gli id firmware degli altri effetti vanno cercati (firmware 1.30 o export da Handy Guitar Lab) prima del Patch builder (F2).
- Prossimo: completare l'estrazione MS-200D+, controllo parola per parola sui PDF, poi `site/ms-200d/effects-data.js` e `assets/effects/`.
