# Controlli da fare con il pedale

Lista di prove da fare sul pedale vero (e su qualche dispositivo), per chiudere i punti aperti di `docs/NEXT-STEPS.md`, `docs/piano-fullscreen.md` e `docs/zptc-reverse-engineering.md`.
Il testo del sito resta in inglese; questo documento è in italiano.

**Come usarlo.** Spunta `[x]` man mano; sotto ogni voce scrivi il risultato dopo la freccia (`→ …`). Se una prova fallisce, annota che cosa hai visto: basta una riga, di solito è già la risposta che serve. Le sezioni sono in ordine consigliato: **A e B** non scrivono nulla sul pedale, **C** scrive (sempre con backup e rilettura), **D–F** servono a completare il formato e le regole, **G** è il sito, **H** è solo per l'MS-50G+.

Pedale di riferimento: **MS-60B+, firmware 1.20** (il tag verde "Tested on firmware 1.20" del sito dice questo: se cambi firmware, rifai almeno A e C e aggiorna il tag).

---

## Metodo con il MIDI: Claude collegato al pedale, tu guardi il display

Idea: invece di leggere il display e trascrivere i valori a mano, il pedale parla via USB e Claude legge (o scrive) i valori grezzi; tu dici che cosa mostra il display, e il confronto dà la regola di conversione che manca.

Che cosa si può fare, in ordine di sicurezza:

1. **Lettura** (sezione A). Claude legge le memorie e ti chiede "la memoria 12 ha un compressore con DRIVE 5: sul display vedi lo stesso?". Non cambia nulla sul pedale.
2. **Ascolto dal vivo** (sezione B). Con l'*editor mode* acceso giri una manopola e Claude registra che cosa manda il pedale: valore grezzo contro valore sul display, un passo alla volta. È il modo più veloce per chiudere i parametri "non decodificati" (D). **Da verificare**: non è ancora provato che l'MS-60B+ mandi messaggi spontanei quando giri una manopola; `site/pedal-midi.js` oggi li registra solo nel "MIDI log" (non li interpreta). Se il test B1 va bene, si aggiunge una piccola funzione di ascolto al Pedal manager.
3. **Scrittura guidata** (sezione C e D). Claude scrive un patch di prova nella **memoria di prova** (mai altrove) con un valore preciso, e tu dici che cosa vedi. Sempre: backup della memoria, conferma, scrittura, rilettura di verifica (è già così nel Pedal manager).

Come ci si collega, due strade:

- **Strada 1, nessun codice nuovo: Chrome + Pedal manager.** Tu: cavo USB dati, pedale acceso, Handy Guitar Lab chiuso, apri `https://zoom.tongatron.org/pedal-manager.html` in Chrome, premi **Connect the pedal** e consenti il MIDI (il permesso lo può dare solo la persona, io non posso cliccarlo). Claude è già collegato al tuo Chrome (estensione locale) e può leggere e usare la pagina (`PEDALMIDI`, la lista delle memorie, il MIDI log). Nessuna installazione.
- **Strada 2, da terminale** (non necessaria ora): uno script Node o Python con una libreria CoreMIDI (`midi`, `python-rtmidi`). Serve installare un modulo nativo; ha senso solo se il lavoro con il browser diventa scomodo.

Regole di sicurezza (valgono per tutta la lista):

- Si scrive **solo nella memoria di prova** scelta in 0.4, mai in altre.
- Un cambio alla volta, e dopo ogni scrittura si rilegge.
- Se il pedale non risponde o mostra qualcosa di strano: niente retry in serie, si copia il MIDI log e ci si ferma.
- I backup restano (ultimi 30 nel browser, più il `.zptc` scaricato a ogni scrittura).

---

## 0. Preparazione

- [x] 0.1 Firmware 1.20 (Settings del pedale). → il Pedal manager legge "firmware 1.20" dal pedale.
- [x] 0.2 Cavo USB **dati** (non solo ricarica), pedale acceso, Handy Guitar Lab e altre app MIDI chiuse.
- [ ] 0.3 Chrome o Edge su computer; si apre il Pedal manager e si preme **Connect the pedal**; si consente il MIDI. → connesso: "ZOOM MS Plus Series · firmware 1.20 · 100 memories" (il permesso MIDI con SysEx era già concesso).
- [ ] 0.4 Scegli una **memoria di prova** che puoi sacrificare (meglio una vuota o BLANK). → numero: …
- [ ] 0.5 Backup di tutto il pedale prima di cominciare (Backup in Handy Guitar Lab, oppure Read di tutte le memorie e download dei `.zptc`). → fatto il …

## A. Lettura dal pedale (sola lettura)

Chiude "Test reading on the pedal" (NEXT-STEPS 4b.1).

- [x] A1 **Read**: compaiono tutte le memorie con numero, nome, effetti e DSP. → 100 memorie, ognuna con CRC valido.
- [ ] A2 **Nomi ed effetti**: per 5 memorie a caso, nome ed effetti nell'ordine giusto rispetto al display del pedale. → memorie provate: …
- [ ] A3 **Valori**: per 3 patch con effetti diversi, controlla 4 valori per effetto (sito contro display). → 1 di 3: memoria 89 (AMPG SVT), 8 parametri su 8 uguali al display (GAIN 30, VOL 71, CABINET 50, ULTRA OFF, BASS 0, MID-FREQ 4.5K = passo 30, MID 0, TREBLE 0); mancano altre 2 patch con effetti diversi.
- [ ] A4 **DSP**: per le stesse 3 patch, il DSP del sito contro il "Processor" di Handy Guitar Lab. → …
- [ ] A5 **Cambio di banco** (intanto: il numero sul display è quello del Pedal manager, 1–100: la memoria 88 è "Empty" e "Test" è l'89 anche sul display): le memorie intorno al passaggio 10 → 11 (e a quello 99 → 0 se esiste) si leggono con nome e contenuto giusti. → …
- [x] A6 **Patch corrente**: la lettura del patch selezionato (nel sito non c'è un pulsante: la fa Claude con `PEDALMIDI.readCurrent()`) corrisponde a quello che il pedale ha selezionato; cambia patch dal pedale e rileggi. → il patch corrente era "Test", identico byte per byte alla memoria 89 (le 100 memorie confrontate); dopo i cambi fatti dal pedale (90, 89, 88, 89) la rilettura ha sempre seguito il pedale.
- [ ] A7 Se qualcosa fallisce: copia il **MIDI log** e incollalo in questo file o in chat. → …

## B. Ascolto dal vivo (serve solo il pedale acceso e collegato)

- [x] B1 **Il pedale manda messaggi quando giri una manopola?** Accendi l'editor mode (il Pedal manager lo fa alla connessione), giri una manopola su un effetto e guardi il MIDI log: compare un messaggio in ingresso (`in`)? → **No**: girando MID-FREQ dell'AMPG SVT da 220 Hz a 4.5K e salvando nella 89 non è arrivato nessun messaggio spontaneo (solo quelli del cambio patch, B3). Per seguire le manopole si legge il patch corrente a intervalli: vedi B5.
- [ ] B2 (non serve: il pedale non manda messaggi per le manopole; si usa B5) Se sì: gira la stessa manopola dal minimo al massimo, passo per passo. Per ogni passo annota il valore sul display e il valore grezzo nel log. → tabella: …
- [x] B3 Se sì: cambia effetto o slot dal pedale e guarda se arrivano messaggi (che cosa cambia, quali byte). → **Il cambio patch sì** (a ogni cambio, in editor mode): SysEx `F0 52 00 6E 64 26 00 00 <banco> 00 <posto> 00 F7`, poi CC0 = 0, CC32 = banco e Program Change = posto (banco 0–9, posto 0–9: memoria = banco × 10 + posto + 1; visto banco 8 posto 7 = memoria 88). In più un messaggio `64 20 …` (da capire). Il cambio di **effetto** o di **parametro** non è ancora stato provato: vedi B1.
- [x] B5 **Lettura a intervalli del patch corrente** (ogni ~0.4 s, `readCurrent`): serve a vedere il valore grezzo mentre giri la manopola, senza salvare. Prova: giri un parametro di uno scatto (senza salvare) e il valore letto cambia? → **Sì**: il patch corrente (anche con modifiche non salvate) si rilegge in circa 1 secondo; per non perdere passi serve un click ogni ~2 secondi.
- [ ] B4 Se sì: l'azione è abbastanza stabile per aggiungere l'ascolto al Pedal manager (decodifica in tempo reale effetto / parametro / valore)? → …

## C. Scrittura sul pedale (solo nella memoria di prova)

Chiude "Writing" e "Pedal manager" (NEXT-STEPS 4b.2 e 4b.3). Ogni scrittura fa il backup della memoria sostituita, chiede conferma con i due nomi, scrive e rilegge per verificare.

- [ ] C1 Scrivi un patch semplice (per esempio COMPRESSOR + un ampli + DELAY) dalla lista My patches nella memoria di prova. → nome sul display, effetti, valori: …
- [ ] C2 Il pedale suona e il patch si richiama normalmente (cambia memoria e torna). → …
- [ ] C3 **Backups** → ripristina il contenuto precedente della memoria di prova. → torna com'era? …
- [ ] C4 **Send a .zptc file**: invia un file dal computer (uno dei `patches/`) nella memoria di prova. → …
- [ ] C5 **Arrange**: sposta due patch, premi Write, controlla l'ordine sul pedale (poi rimetti a posto dal backup). → …
- [ ] C6 **Nomi**: un nome di 28 caratteri e uno con `! % & ' + , - . = _`. Che cosa mostra il display (troncato? a quanti caratteri)? → …
- [ ] C7 Una memoria occupata da un patch con 6 effetti e un DSP vicino al 100%: scritta e riletta uguale. → …

## D. Parametri da decodificare

Per ognuno: imposta un valore sul pedale (o scrivilo con il Pedal manager), annota che cosa vedi sul display e il valore grezzo che il sito legge (con il MIDI: sezione A o B; senza il MIDI: esporta da Handy Guitar Lab e decodifica con `node tools/zptc.mjs decode file.zptc`). Per ogni parametro bastano **minimo, un valore intermedio e massimo**, più i passi indicati. Gli elenchi vengono dai dati del sito (sezione "Still to check" della pagina Resources).

### D.1 Codifica non verificata (22), il sito usa una regola dedotta per analogia

- [x] D1a **Ampli AMPG SVT, MID-FREQ** (`32 Hz – 6.3 kHz`, 32 passi). → fatto il 2026-10-27: tutti i 32 passi letti sul display del pedale (passata lenta con B5) e messi in `site/zptc.js`: 32, 40, 50, 63, 70, 80, 100, 120, 140, 150, 160, 180, 200, 220, 250, 300, 350, 400, 450, 500, 630, 800, 1.0k, 1.2k, 1.6k, 2.0k, 2.5k, 3.0k, 3.6k, 4.0k, 4.5k, 6.3k (Hz).
- [ ] D1b **SMR400, B-MAN100, AC 370, MID-FREQ** (stessa scala, oggi assunta uguale a quella dell'AMPG SVT). Per ognuno: cambia l'effetto del patch corrente sul pedale, passata lenta del MID-FREQ (un click ogni ~2 secondi, senza salvare) e scrivi i valori in ordine; il lettore controlla i 32 passi. → …
- [ ] D2 **Toni ±15**: SMR400 e TE400SMX, BASS / MID / TREBLE (`-15.0 – 15.0`). → −15, 0, +15 e un passo vicino a 0: …
- [ ] D3 **Toni ±10**: EBH360, BASS / MID / TREBLE (`-10.0 – 10.0`). → …
- [ ] D4 **MODE dei delay** (`SHORT, LONG, ♩`): DELAY, ANALOG DELAY, TAPE ECHO, REVERSE DELAY, MODULATION DELAY, HOLD DELAY; e DUAL DELAY (`TIME, ♩`). → provali tutte le opzioni su uno, poi una per gli altri: …
- [ ] D5 **DI-5 PREAMP, TONE** (`OFF, 1 – 6`). → i 7 valori: …
- [ ] D6 **SUN CB, DIST** (`OFF – 100`). → OFF, 0 (se esiste), 1, 50, 100: …

### D.2 Non decodificati (20), il sito chiede il valore grezzo ("raw")

- [ ] D7 DUAL COMPRESSOR, FREQ (`300 Hz – 1.5 kHz`)
- [ ] D8 160 COMPRESSOR, RATIO (`1.0 – 10.0`)
- [ ] D9 BASS AUTO WAH, SENSE · Z TRON FILTER, SENSE · BASS CRY FILTER, SENSE (`-10 – -1, 1 – 10`: attenzione allo zero che non c'è)
- [ ] D10 ENVELOPE GENERATOR FILTER, TYPE (`HPF2 – LPF4`: tutti i tipi)
- [ ] D11 BASS PARAMETRIC EQ, FREQ (`20 Hz – 20 kHz`) e Q (`0.5 – 16.0`)
- [ ] D12 LOW EQ, FREQ (`20 Hz – 640 Hz`) · HIGH EQ, FREQ (`500 Hz – 20 kHz`) · SPLITTER, FREQ (`80 Hz – 2.5 kHz`)
- [ ] D13 CLEAR DRIVER PREAMP, MID-FREQ (`100 Hz – 1.0 kHz`) · 1073 PREAMP, MID-F (`350 Hz – 3.2 kHz`) · SOLID PREAMP, LO-FREQ (`40 Hz – 600 Hz`) e HI-FREQ (`1.5 kHz – 22.0 kHz`)
- [ ] D14 DJENT PREAMP, LOCUT (`OFF, 20 Hz – 120 Hz`) · BASS STEREO CHORUS, LOCUT e BASS VINTAGE FLANGER, LOCUT (`OFF, 60 Hz – 800 Hz`)
- [ ] D15 BASS MONO PITCH SHIFTER, SHIFT (`-12 – 12, 24`: il valore 24 è un caso a parte)
- [ ] D16 DUAL DELAY, DEPTH (`MN-0 – ST-50`: i due prefissi MN e ST)

Per i frequency (D7, D11–D14) i passi sono probabilmente non lineari: servono almeno 5 punti sparsi (minimo, massimo e tre in mezzo) per capire la curva.

## E. Altri punti aperti del formato `.zptc`

- [ ] E1 **Blocco PRM2**: oggi sono decodificati solo lo slot selezionato e gli slot degli ampli; il resto si copia da un export di riferimento. Esporta 3 patch diversi (slot selezionato diverso, effetti spenti, nomi diversi) e confrontali. → …
- [ ] E2 **"Big Black"**: il primo effetto è stato esportato con ID `0x09000020` invece di `0x01000020` (BLACK OPTICAL COMPRESSOR). Riesporta lo stesso patch da Handy Guitar Lab: l'ID cambia (flag) o resta (difetto dell'export)? → …
- [ ] E3 **Parametro nascosto degli ampli**: parametro 9 = 2 visto solo su FLIPTOP e AMPG SVT. Esporta un patch per ognuno degli 11 ampli e annota il valore. → …
- [ ] E4 **BLEND / BALANCE**: la regola di advice assume che il massimo sia "solo effetto". Verifica a orecchio su due drive. → …
- [ ] E5 **Calibrazione DSP** (`DSP_SCALE = 0.925` da 4 patch): annota il "Processor %" di Handy Guitar Lab per altri 6–10 patch (con synth e più ampli) e confrontalo con la stima del sito. → differenze: …

## F. Advice e Tone ideas

- [ ] F1 **Catene di partenza** (6 stili con starter in Tone ideas): scrivi ognuna nella memoria di prova, suonala e segna i valori da correggere a orecchio. → …
- [ ] F2 **Advice**: per 4 avvisi che il sito dà su patch reali (accumulo dei livelli, ripetizioni del delay, code lunghe di riverbero, …) dì se l'avviso è sensato all'orecchio. → …
- [ ] F3 **Regole nuove** senza fonte per l'MS-60B+: uscita stereo, livello del patch, uso di accordatore e mute. → trovata una fonte? …

## G. Il sito su dispositivi veri

- [ ] G1 **iPad in orizzontale** (Safari): tutte le pagine entrano senza scroll, il tocco funziona (anche il trascinamento per riordinare la catena), la tastiera su schermo non copre i campi. → …
- [ ] G2 **Finestra piccola** (portatile con il browser non a tutto schermo, per esempio 1280 × 600): compare l'avviso, F11 lo fa sparire. → …
- [ ] G3 **Tastiera e lettore di schermo** (VoiceOver): i pannelli sono raggiungibili e scorribili, il focus è visibile, `prefers-reduced-motion` è rispettato. → …
- [ ] G4 **Offline**: installa il sito come app, spegni la rete, apri Effects e Patch builder. → …
- [ ] G5 **Aggiornamento**: dopo un deploy compare "A new version is available" e Reload porta alla versione nuova. → …
- [ ] G6 **Account** (checklist del primo deploy, `docs/piano-login.md` §11): mail di registrazione ricevuta, notifica Telegram, `/admin`, "Send me a test email", ultimo backup visibile nella console. → …
- [ ] G7 **Sincronizzazione**: patch salvato su un computer, visibile su un altro dopo l'accesso; cancellato su uno, sparisce sull'altro. → …

## H. MS-50G+ (solo se hai o ti prestano il pedale)

Da `docs/NEXT-STEPS.md` §0. Il pedale è marcato "Not tested" finché non si fanno almeno 1–3.

- [ ] H1 Esporta da Handy Guitar Lab per MS-50G+ un patch semplice (per esempio COMPRESSOR con valori noti) e mandalo: `ZPTC_PEDAL=ms-50g node tools/zptc.mjs decode file.zptc` dice se header, PRM2 e bit coincidono con l'MS-60B+. → …
- [ ] H2 Importa un patch generato dal builder (COMPRESSOR + un ampli come MS1959 DRIVE + DELAY) e riporta i valori che vedi nell'app e sul pedale. → …
- [ ] H3 "Processor %" di qualche patch per calibrare `DSP_SCALE` (oggi preso dall'MS-60B+). → …
- [ ] H4 Ampli (PREAMP): il byte 20 di PRM2 richiede i bit per slot degli ampli come sull'MS-60B+? Compaiono parametri nascosti negli export? → …
- [ ] H5 I 24 add-on di Handy Guitar Lab (★) non hanno ID: esporta un patch che ne usa uno. → …
- [ ] H6 Range non decodificati (valori "raw"): LOW-PASS FILTER SENSE / RESO, ENVELOPE GENERATOR FILTER TYPE, PARAMETRIC EQ FREQ / Q, MATCH30 DRIVE VOL, DUAL DELAY DEPTH, SLAP BACK DELAY TIME. → …
- [ ] H7 Advice per chitarra: oggi solo controlli oggettivi; le regole di ordine, stile e suono vogliono fonti per la chitarra. → …

---

## Registro dei risultati

| Data | Voce | Esito | Note (display, valore grezzo, file) |
|---|---|---|---|
| | | | |
