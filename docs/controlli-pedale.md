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

- **Strada 1, nessun codice nuovo: Chrome + Pedal manager.** Tu: cavo USB dati, pedale acceso, Handy Guitar Lab chiuso, apri `https://zoommultistompstudio.tongatron.org/pedal-manager.html` in Chrome, premi **Connect the pedal** e consenti il MIDI (il permesso lo può dare solo la persona, io non posso cliccarlo). Claude è già collegato al tuo Chrome (estensione locale) e può leggere e usare la pagina (`PEDALMIDI`, la lista delle memorie, il MIDI log). Nessuna installazione.
- **Strada 2, da terminale** (non necessaria ora): uno script Node o Python con una libreria CoreMIDI (`midi`, `python-rtmidi`). Serve installare un modulo nativo; ha senso solo se il lavoro con il browser diventa scomodo.

Regole di sicurezza (valgono per tutta la lista):

- Si scrive **solo nella memoria di prova** scelta in 0.4, mai in altre.
- **Il pedale salva da solo quello che si tocca** (visto il 2026-10-28, con l'editor mode rimasto acceso): leggendo il display, nelle 5 memorie guardate sono cambiati byte interni di PRM2 e, sulla 62, due valori (THRSHLD −22 → −24, FREQ grezzo 16 → 15) per una manopola sfiorata. Prima di leggere il display a mano premi **Disconnect** nel Pedal manager (spegne l'editor mode), non solo cambiare pagina, e non toccare le manopole. Dopo ogni sessione rileggi le memorie e confrontale con l'ultima lettura. La 62 è stata ripristinata dal backup della lettura precedente (riletta uguale byte per byte, 2026-10-28); delle altre 4 memorie guardate restano cambiati solo byte interni di PRM2, effetti e valori sono quelli di prima.
- Un cambio alla volta, e dopo ogni scrittura si rilegge.
- Se il pedale non risponde o mostra qualcosa di strano: niente retry in serie, si copia il MIDI log e ci si ferma.
- I backup restano (ultimi 30 nel browser, più il `.zptc` scaricato a ogni scrittura).

---

## 0. Preparazione

- [x] 0.1 Firmware 1.20 (Settings del pedale). → il Pedal manager legge "firmware 1.20" dal pedale.
- [x] 0.2 Cavo USB **dati** (non solo ricarica), pedale acceso, Handy Guitar Lab e altre app MIDI chiuse.
- [x] 0.3 Chrome o Edge su computer; si apre il Pedal manager e si preme **Connect the pedal**; si consente il MIDI. → connesso il 2026-10-28: "ZOOM MS Plus Series · firmware 1.20 · 100 memories"; rilettura completa delle 100 memorie senza errori.
- [x] 0.4 Scegli una **memoria di prova** che puoi sacrificare (meglio una vuota o BLANK). → numero: **100** (vuota, scelta il 2026-10-28).
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

- [x] C1 Scrivi un patch semplice (per esempio COMPRESSOR + un ampli + DELAY) dalla lista My patches nella memoria di prova. → 2026-10-28: "Peter Hook" (DYNAMIC COMPRESSOR → CLONE CHORUS → AMPG SVT, DSP 59.4%) nella 100. La pagina lo ha riletto identico; nome, effetti e valori sul display uguali al sito. Le altre 99 memorie non sono cambiate (nome, effetti, DSP uguali a prima).
- [x] C2 Il pedale suona e il patch si richiama normalmente (cambia memoria e torna). → 2026-10-28: provato sulla 100 ("Peter Hook"), suona e si richiama uguale.
- [x] C3 **Backups** → ripristina il contenuto precedente della memoria di prova. → 2026-10-28: "Empty" rimesso nella 100, riletto identico; rilette le 100 memorie, nome, effetti e DSP di tutte come prima delle scritture. Nota: il backup è l'intero slot di 848 byte, mentre un patch ne usa quanti dice l'header (168 per un Empty); i byte oltre sono resti dello slot, e il confronto copre i byte validi.
- [ ] C4 **Send a .zptc file**: invia un file dal computer (uno dei `patches/`) nella memoria di prova. → …
- [ ] C5 **Arrange**: sposta due patch, premi Write, controlla l'ordine sul pedale (poi rimetti a posto dal backup). → …
- [ ] C6 **Nomi**: un nome di 28 caratteri e uno con `! % & ' + , - . = _`. Che cosa mostra il display (troncato? a quanti caratteri)? → …
- [x] C7 Una memoria occupata da un patch con 6 effetti e un DSP vicino al 100%: scritta e riletta uguale. → 2026-10-28, **trovato un difetto del codec**. Patch di prova BLACK OPTICAL COMPRESSOR → BLUEBERRY DRIVE → AMPG SVT → BASS GRAPHIC EQ → CLONE CHORUS → HALL REVERB, DSP stimato 96.5%. (1) Scritto come lo genera il sito, con lo slot 0 BLANK davanti (7 voci): la pagina lo ha riletto "identico", ma sul pedale gli slot 1–5 erano giusti e il sesto non si raggiungeva; dopo la navigazione la memoria è risultata riscritta dal pedale con 6 voci e 5 effetti (HALL REVERB perso, 308 byte, DSP 86.5%). Il pedale tiene al massimo 6 voci: la 53 (6 effetti, scritta da Handy Guitar Lab) ha 6 voci e nessun BLANK. (2) Scritto senza BLANK (`_noBlank`, 6 voci): riletto identico, sul pedale i 6 slot ci sono e il sesto mostra HALL REVERB con i valori attesi. Dopo la navigazione il pedale ha cambiato 1 byte (cursore di modifica, `selected` = 5), effetti e valori intatti. Non verificati: il suono a ~97% e il "Processor %" di Handy Guitar Lab (E5). (3) Dopo la correzione del codec (`ZPTC.forPedal`, commit bcc32df): lo stesso file originale a 7 voci, inviato dal Pedal manager, viene scritto a 6 voci e il sesto slot si raggiunge sul pedale (confermato 2026-10-28). Anche stavolta il pedale ha poi cambiato 1 solo byte, il cursore (byte 246: 0 → 5), con effetti e valori intatti, **senza che l'utente salvasse**: con l'editor mode acceso (il Pedal manager lo accende alla connessione) il pedale riscrive da solo la memoria quando si naviga tra gli slot. È anche ciò che ha tolto il 6º effetto al patch a 7 voci (la sua copia di lavoro ha 6 voci). Non provato senza editor mode.
- [x] C8 **Scrittura sulla memoria che il pedale ha in uso** (il pedale riscrive da solo la memoria quando si naviga, vedi C7: può cancellare una scrittura del sito?). → 2026-10-28: scritto "Marker A" (3 effetti) nella 100 mentre il pedale la teneva caricata. Il patch corrente letto subito dopo era ancora il vecchio ("C7 Test 6fx"), ma il display mostrava già "Marker A"; dopo aver navigato tra gli slot senza salvare la 100 conteneva ancora "Marker A", effetti e valori intatti. Il pedale ha cambiato solo il cursore (byte 190: 44 → 76) e un altro byte di PRM2 (byte 191: 0 → 6, non so cosa sia). Nessuna scrittura persa in questa prova. Non provato: navigare subito dopo la scrittura, prima che il pedale ricarichi la memoria.

## D. Parametri da decodificare

Per ognuno: imposta un valore sul pedale (o scrivilo con il Pedal manager), annota che cosa vedi sul display e il valore grezzo che il sito legge (con il MIDI: sezione A o B; senza il MIDI: esporta da Handy Guitar Lab e decodifica con `node tools/zptc.mjs decode file.zptc`). Per ogni parametro bastano **minimo, un valore intermedio e massimo**, più i passi indicati. Gli elenchi vengono dai dati del sito (sezione "Still to check" della pagina Resources).

### D.1 Codifica non verificata (22), il sito usa una regola dedotta per analogia

- [x] D1a **Ampli AMPG SVT, MID-FREQ** (`32 Hz – 6.3 kHz`, 32 passi). → fatto il 2026-10-27: tutti i 32 passi letti sul display del pedale (passata lenta con B5) e messi in `site/zptc.js`: 32, 40, 50, 63, 70, 80, 100, 120, 140, 150, 160, 180, 200, 220, 250, 300, 350, 400, 450, 500, 630, 800, 1.0k, 1.2k, 1.6k, 2.0k, 2.5k, 3.0k, 3.6k, 4.0k, 4.5k, 6.3k (Hz).
- [ ] D1b **SMR400, B-MAN100, AC 370, MID-FREQ** (stessa scala, oggi assunta uguale a quella dell'AMPG SVT). Per ognuno: cambia l'effetto del patch corrente sul pedale, passata lenta del MID-FREQ (un click ogni ~2 secondi, senza salvare) e scrivi i valori in ordine; il lettore controlla i 32 passi. → 2026-10-28, controllo a campione sul display, tutti uguali al previsto con la scala dell'AMPG SVT: B-MAN100 passo 17 (400 Hz, mem. 53) e passo 21 (800 Hz, mem. 29), AC 370 passo 17 (400 Hz, mem. 31), SMR400 passo 14 (250 Hz, mem. 62). Passata completa dei 32 passi non fatta: `verifiedOn` in `site/zptc.js` resta solo l'AMPG SVT.
- [ ] D2 **Toni ±15**: SMR400 e TE400SMX, BASS / MID / TREBLE (`-15.0 – 15.0`). → 2026-10-28: SMR400 (mem. 62) BASS +4, MID −5, TREBLE 0: uguali al display. Mancano −15, +15 e il TE400SMX.
- [ ] D3 **Toni ±10**: EBH360, BASS / MID / TREBLE (`-10.0 – 10.0`). → …
- [ ] D4 **MODE dei delay** (`SHORT, LONG, ♩`): DELAY, ANALOG DELAY, TAPE ECHO, REVERSE DELAY, MODULATION DELAY, HOLD DELAY; e DUAL DELAY (`TIME, ♩`). → provali tutte le opzioni su uno, poi una per gli altri: …
- [ ] D5 **DI-5 PREAMP, TONE** (`OFF, 1 – 6`). → i 7 valori: …
- [ ] D6 **SUN CB, DIST** (`OFF – 100`). → OFF, 0 (se esiste), 1, 50, 100: …

### D.2 Non decodificati (20), il sito chiede il valore grezzo ("raw")

- [ ] D7 DUAL COMPRESSOR, FREQ (`300 Hz – 1.5 kHz`) → 2026-10-29: raw 9 = 1.5 kHz (mem. 40), il massimo dell'intervallo, quindi la scala ha probabilmente 10 passi. Mancano gli altri punti.
- [ ] D8 160 COMPRESSOR, RATIO (`1.0 – 10.0`) → 2026-10-28: raw 30 = 4.0 sul display (mem. 62, valore non toccato). Coerente con 1.0 + raw × 0.1, ma è un solo punto. 2026-10-29: raw 41 = 5.1 (mem. 36): due punti (30 e 41) su 1.0 + raw × 0.1; il tratto alto, fino a 10.0 (raw 90 se la regola vale), non è verificato.
- [ ] D9 BASS AUTO WAH, SENSE · Z TRON FILTER, SENSE · BASS CRY FILTER, SENSE (`-10 – -1, 1 – 10`: attenzione allo zero che non c'è) → 2026-10-29: BASS AUTO WAH, SENSE raw 11 = 2 (mem. 80) e raw 14 = 5 (mem. 73): torna con valore mostrato = raw − 9 per i valori positivi (raw 10 = 1, raw 19 = 10). La metà negativa (raw 0–9 = −10…−1?) non è verificata; Z TRON FILTER e BASS CRY FILTER non provati.
- [ ] D10 ENVELOPE GENERATOR FILTER, TYPE (`HPF2 – LPF4`: tutti i tipi)
- [ ] D11 BASS PARAMETRIC EQ, FREQ (`20 Hz – 20 kHz`) e Q (`0.5 – 16.0`) → 2026-10-28: Q raw 0 = 0.5. FREQ: 250 Hz letta sulla 62 (slot 4) o sulla 53 (slot 6), raw 15 o 16: la 62 è cambiata mentre la si leggeva (16 → 15), quindi il punto è da rifare. Valori grezzi già presenti nelle 100 memorie: FREQ 4 (mem. 70), 15 (62), 16 (51, 53); Q 0 (51), 1 (52), 2 (55), 27 (70). 2026-10-29, dal foglio Excel: Q raw 0 = 0.5 (mem. 51), raw 1 = 0.6 (mem. 52), raw 2 = 0.7 (mem. 55), cioè 0.5 + raw × 0.1 nel tratto basso (il resto, fino a 16.0, non è noto). FREQ raw 16 = 300 Hz (mem. 51): se la 250 Hz vista il 28 era raw 15, torna 15 = 250 Hz e 16 = 300 Hz (da confermare). Mem. 70, slot 2, riletta sul display (2026-10-29): FREQ raw 4 = 50 Hz, Q raw 27 = 3.2, e 3.2 = 0.5 + 27 × 0.1: la regola di Q vale anche con un punto alto. La prima lettura (300 Hz e 0.5) era con ogni probabilità dello slot 4, l'altro BASS PARAMETRIC EQ della memoria (FREQ raw 16, Q raw 0, come la 51). FREQ: raw 4 = 50 Hz, raw 16 = 300 Hz; la scala non è lineare, servono altri punti.
- [ ] D12 LOW EQ, FREQ (`20 Hz – 640 Hz`) · HIGH EQ, FREQ (`500 Hz – 20 kHz`) · SPLITTER, FREQ (`80 Hz – 2.5 kHz`) → 2026-10-29: LOW EQ, FREQ raw 0 = 20 Hz (mem. 51), raw 4 = 60 Hz (mem. 61), raw 18 = 200 Hz (mem. 26): i tre punti tornano con 20 Hz + raw × 10 Hz (il massimo, 640 Hz, sarebbe raw 62). HIGH EQ e SPLITTER non provati.
- [ ] D13 CLEAR DRIVER PREAMP, MID-FREQ (`100 Hz – 1.0 kHz`) · 1073 PREAMP, MID-F (`350 Hz – 3.2 kHz`) · SOLID PREAMP, LO-FREQ (`40 Hz – 600 Hz`) e HI-FREQ (`1.5 kHz – 22.0 kHz`) → 2026-10-29: 1073 PREAMP, MID-F raw 2 = 1.6 kHz (mem. 25); CLEAR DRIVER PREAMP, MID-FREQ raw 12 = 300 Hz (mem. 63) e raw 13 = 350 Hz (mem. 59); SOLID PREAMP, LO-FREQ raw 25 = 80 Hz e HI-FREQ raw 20 = 3.5 kHz (mem. 27). Punti isolati: la scala non si ricava ancora (ipotesi da verificare per il 1073: 4 posizioni, 350 Hz, 700 Hz, 1.6 kHz, 3.2 kHz).
- [ ] D14 DJENT PREAMP, LOCUT (`OFF, 20 Hz – 120 Hz`) · BASS STEREO CHORUS, LOCUT e BASS VINTAGE FLANGER, LOCUT (`OFF, 60 Hz – 800 Hz`) → 2026-10-29: DJENT PREAMP raw 5 = 60 Hz (mem. 15); BASS STEREO CHORUS raw 3 = 180 Hz (mem. 23); BASS VINTAGE FLANGER raw 1 = 60 Hz (mem. 52) e raw 8 = 500 Hz (mem. 26). Per il flanger raw 1 è il minimo dell'intervallo, quindi raw 0 dovrebbe essere OFF (non verificato). Scale ancora da ricavare: servono altri punti (e OFF).
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

**Per chi sta lontano e non può usare Claude:** la pagina `site/ms-50g/help.html` (pulsante **Help us** nella barra "Not tested yet") dà le prove H1–H6 passo per passo, con il tempo stimato (preparazione e prove 1–3 circa 50 minuti, tutto circa 4 ore), per chi ha solo il pedale e l'app Handy Guitar Lab su iPhone/iPad. La pagina dice che cosa servirebbe, non dà ordini: **Contact us** (per ora un `mailto:` a giovanni.bindi@icloud.com) sta subito dopo la descrizione e chiede quanto tempo la persona può dedicare, così le prove si organizzano insieme; i file arrivano per email. I patch delle prove 4–6 hanno il nome uguale al valore letto sul display: `ZPTC_PEDAL=ms-50g node tools/zptc.mjs decode file.zptc` dà il valore grezzo da mettere accanto.
Dal MS-60B+ vale anche qui, da confermare: Q del PARAMETRIC EQ = 0.5 + grezzo × 0.1; FREQ non lineare (grezzo 4 = 50 Hz, 16 = 300 Hz); il pedale tiene 6 voci (vedi C7); con l'editor mode il pedale riscrive da solo le memorie.

- [ ] H1 Esporta da Handy Guitar Lab per MS-50G+ un patch semplice (per esempio COMPRESSOR con valori noti) e mandalo: `ZPTC_PEDAL=ms-50g node tools/zptc.mjs decode file.zptc` dice se header, PRM2 e bit coincidono con l'MS-60B+. → …
- [ ] H2 Importa un patch generato dal builder (COMPRESSOR + un ampli come MS1959 DRIVE + DELAY) e riporta i valori che vedi nell'app e sul pedale. → …
- [ ] H3 "Processor %" di qualche patch per calibrare `DSP_SCALE` (oggi preso dall'MS-60B+). → …
- [ ] H4 Ampli (PREAMP): il byte 20 di PRM2 richiede i bit per slot degli ampli come sull'MS-60B+? Compaiono parametri nascosti negli export? → …
- [ ] H5 I 24 add-on di Handy Guitar Lab (★) non hanno ID: esporta un patch che ne usa uno. → …
- [ ] H6 Range non decodificati (valori "raw"): LOW-PASS FILTER SENSE / RESO, ENVELOPE GENERATOR FILTER TYPE, PARAMETRIC EQ FREQ / Q, MATCH30 DRIVE VOL, DUAL DELAY DEPTH, SLAP BACK DELAY TIME. → …
- [ ] H7 Advice per chitarra: oggi solo controlli oggettivi; le regole di ordine, stile e suono vogliono fonti per la chitarra. → …
- [ ] H8 Sei effetti (prova 3 della pagina `help.html`): un patch del builder con 6 effetti ha 7 voci (BLANK davanti); sul MS-60B+ via MIDI il pedale ha perso il sesto effetto (C7). Con Handy Guitar Lab sul MS-50G+ restano tutti e sei? Se no, i file con 6 effetti vanno scritti senza BLANK anche per la chitarra (`ZPTC.forPedal`). → …

---

## Registro dei risultati

| Data | Voce | Esito | Note (display, valore grezzo, file) |
|---|---|---|---|
| 2026-10-29 | Rilettura dopo le letture sul display (foglio Excel) | 90 memorie uguali, 9 con solo byte interni di PRM2 (2, 23, 26, 51, 52, 55, 59, 61, 70), la 27 con un valore cambiato | 27, slot 1 BASS GRAPHIC EQ, banda 50 Hz: raw 18 → 17 (manopola sfiorata); ripristinata lo stesso giorno dalla lettura del 28 ottobre (backup della 27 con 17 salvato e scaricato, poi scritta e riletta identica, Pedal manager scollegato dopo). Una seconda rilettura è fallita: il pedale è sparito dalle porte MIDI di Chrome (nessuna risposta dalle memorie 1–11), la lettura salvata è rimasta intatta e in quel tentativo non è stato scritto nulla. |
