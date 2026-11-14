# Deploy del sito

Questa guida documenta il flusso usato per pubblicare il pedal manager e gli aggiornamenti ai profili dei tre pedali.

## Riferimenti

- Repository GitHub: [tongatron/ZOOM-MultiStomp-Patch-Studio](https://github.com/tongatron/ZOOM-MultiStomp-Patch-Studio)
- Sito pubblico ufficiale: [ZOOM MultiStomp Studio](https://zoommultistompstudio.tongatron.org)
- Site secondario per UI proposals: [zoom-ms60b-ui-proposals.tongatron.chatgpt.site](https://zoom-ms60b-ui-proposals.tongatron.chatgpt.site) — non è il target di produzione.
- Configurazione Sites: [`../.openai/hosting.json`](../.openai/hosting.json)
- Sorgenti applicative: [`../site/`](../site/)
- Copia statica pubblicata: [`../dist/`](../dist/)
- Audit firmware: [`../firmware/README.md`](../firmware/README.md)
- Note sui prossimi test hardware: [`NEXT-STEPS.md`](NEXT-STEPS.md)

## Regola di pubblicazione

Il dominio canonico per tutti gli utenti è `https://zoommultistompstudio.tongatron.org`. Ogni modifica destinata agli utenti deve essere sincronizzata sul server `hp-ubuntu` con `rsync` verso `/srv/apps/zoom-ms60b/`.

Il Site `zoom-ms60b-ui-proposals.tongatron.chatgpt.site` è una pubblicazione separata per proposte e verifiche UI: non sostituisce il deploy sul dominio ufficiale.

## Stato dell'ultimo deploy

L'ultimo deploy sul dominio ufficiale è stato completato il 14 novembre 2026.

- Commit: `ea3239f`
- Messaggio: `deploy version 1.1 to production`
- Stato: sincronizzato su `hp-ubuntu`
- URL di produzione: [zoommultistompstudio.tongatron.org](https://zoommultistompstudio.tongatron.org)

## Procedura completa

### 1. Preparare sorgenti e copia pubblicata

Il progetto non usa un bundler: `site/` contiene i sorgenti e `dist/` è la directory statica indicata da `static.directory` in [`../.openai/hosting.json`](../.openai/hosting.json).

Quando si modifica un file JavaScript o un profilo in `site/`, replicare il file nella posizione corrispondente in `dist/` prima del deploy. Nell'ultimo ciclo sono stati sincronizzati:

```text
site/zptc.js                    -> dist/zptc.js
site/pedal-manager.js           -> dist/pedal-manager.js
site/ms-50g/pedal.js            -> dist/ms-50g/pedal.js
site/ms-60b/pedal.js            -> dist/ms-60b/pedal.js
site/ms-70cdr/pedal.js          -> dist/ms-70cdr/pedal.js
```

Controllare poi lo stato:

```sh
git status --short --branch
git diff --check
```

### 2. Eseguire i test

I controlli eseguiti prima della pubblicazione sono:

```sh
npm run test:firmware
node tools/zptc.mjs roundtrip patches/0*
node tools/advice-test.mjs
node tools/midi-test.mjs
node --check tools/firmware-audit.mjs
node --check site/zptc.js
node --check site/pedal-manager.js
git diff --check
```

Risultato dell'ultimo ciclo:

- firmware audit: 97 effetti MS-60B+, 103 MS-50G+, 149 MS-70CDR+, tutti passati;
- codec `.zptc`: 7 patch passati in round-trip;
- advice engine: 52 test passati;
- MIDI: 13 test passati;
- sintassi JavaScript e diff: nessun errore.

### 3. Creare il commit

Aggiungere solo le modifiche previste e registrare il commit:

```sh
git add .gitignore README.md package.json docs site dist tools/zptc.mjs \
  tools/firmware-audit.mjs firmware
git commit -m "feat: add pedal profiles and firmware audit"
```

Annotare lo SHA completo:

```sh
git rev-parse HEAD
```

### 4. Fare push

Pubblicare il commit sul repository GitHub:

```sh
git push origin main
```

Il Site secondario usa inoltre un repository sorgente collegato al progetto. Sincronizzarlo solo se richiesto esplicitamente; non sostituisce il deploy ufficiale.

Per un deploy del Site secondario:

1. leggere il `project_id` da [`../.openai/hosting.json`](../.openai/hosting.json);
2. ottenere dal connettore Sites una credenziale temporanea di scrittura per il branch `main`;
3. usare il remote e il token soltanto nella sessione corrente;
4. fare push dello stesso SHA completo nel repository sorgente Sites;
5. non salvare mai il token in file, log, `.git/config` o nella repo.

Il push Sites dell'ultimo ciclo ha aggiornato `main` da `e3da671` a `325cdde`.

### 5. Deploy ufficiale su hp-ubuntu

Prima di ogni deploy, anche parziale, aggiornare il timestamp delle pagine:

```sh
node tools/stamp-update.mjs
```

Dopo i test e il commit, sincronizzare sempre la copia realmente servita agli utenti:

```sh
rsync -a --exclude '.DS_Store' site/ giovanni@100.81.62.48:/srv/apps/zoom-ms60b/
```

Per modifiche al server o al servizio, usare anche la procedura `ssh` documentata in `CLAUDE.md`. Per sole modifiche statiche non è necessario riavviare il servizio.

Verificare infine il dominio ufficiale, non il Site secondario:

```sh
curl -sS https://zoommultistompstudio.tongatron.org/updates.js?v=updates2-<data> \\
  | rg "version:|released:"
```

### 6. Creare l'archivio statico per il Site secondario

L'archivio deve essere costruito dallo stesso commit appena pubblicato e deve contenere sia `.openai/hosting.json` sia `dist/` alla radice dell'archivio:

```sh
SITE_SHA="$(git rev-parse HEAD)"
tar -czf "/private/tmp/zoom-ms60b-site-${SITE_SHA}.tar.gz" \
  .openai/hosting.json dist
tar -tzf "/private/tmp/zoom-ms60b-site-${SITE_SHA}.tar.gz" | head
```

Non includere credenziali o firmware proprietario nell'archivio. I binari firmware sono esclusi dalla repo e il relativo flusso statico è descritto in [`../firmware/README.md`](../firmware/README.md).

### 7. Salvare la versione Sites

Nel connettore Sites usare il progetto esistente, il commit SHA completo e il percorso assoluto dell'archivio:

- progetto: `appgprj_6aea6782b0088191b3d06a99a378c39e`;
- commit: SHA completo prodotto da `git rev-parse HEAD`;
- archive: `/private/tmp/zoom-ms60b-site-<sha>.tar.gz`.

Il salvataggio restituisce un `version_id` opaco. Nell'ultimo ciclo ha creato la versione `4` con 474 file nell'archivio.

### 8. Fare deploy del Site secondario

Usare il `version_id` appena restituito per il deploy pubblico della versione salvata. Non usare direttamente un commit SHA o un deployment ID come `version_id`.

Il deploy del Site secondario restituisce:

```text
status: succeeded
url: https://zoom-ms60b-ui-proposals.tongatron.chatgpt.site
```

Se lo stato iniziale è `pending`, `building`, `publishing` o `finalizing`, interrogare lo stato del deployment fino a `succeeded` oppure `failed`. In caso di errore conservare il messaggio restituito insieme a commit, versione e deployment ID.

### 9. Verifica finale

Controllare che il repository sia pulito e allineato:

```sh
git status --short --branch
```

Aprire quindi il [sito ufficiale](https://zoommultistompstudio.tongatron.org) e verificare almeno:

- caricamento del pedal manager;
- selezione del profilo MS-60B+;
- visualizzazione di firmware e modello MIDI;
- import/export di un `.zptc`;
- assenza di errori nella console del browser.

Per MS-50G+ e MS-70CDR+ mantenere i test USB come non verificati localmente finché i tester esterni non forniscono le prove descritte in [`NEXT-STEPS.md`](NEXT-STEPS.md).

