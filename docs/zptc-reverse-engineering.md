# Come è stato ricostruito il formato `.zptc` dello Zoom MS-60B+

Questo documento spiega come è nato il generatore di patch (`site/zptc.js`, usato dal Patch Builder e da `tools/zptc.mjs`): da dove arrivano le informazioni, come è stato decifrato il formato e come è stato verificato.

## In breve: nessun file compilato è stato decompilato

Il generatore **non** è stato ottenuto disassemblando o decompilando software: né il firmware del pedale, né l'app Handy Guitar Lab.

Il metodo è il **reverse engineering di un formato dati**, a "scatola nera":

1. si fanno esportare all'app delle patch che differiscono per **una sola** modifica nota;
2. si confrontano i byte dei file e si individua cosa cambia;
3. si scrive un decoder, poi un encoder, e si verifica che rigeneri gli originali **byte per byte**;
4. la prova finale è sul campo: le patch generate vengono importate in Handy Guitar Lab e i valori controllati sul pedale.

L'unico punto di contatto con file compilati è indiretto: i **valori di carico DSP** e gli **ID degli effetti** provengono da [mungewell/zoom-zt2](https://github.com/mungewell/zoom-zt2) (licenza MIT). Quel progetto legge le intestazioni dei moduli effetto `.ZD2` contenuti nel firmware. Qui abbiamo usato solo la tabella pubblicata (`zoom_fx_ms-plus/ms-60bp/effects_sort.txt`), senza toccare il firmware.

## Le fonti e cosa ha fornito ciascuna

| Fonte | Tipo | Cosa ci ha dato |
|---|---|---|
| Effects List ufficiale ZOOM (`documentazione/E_MS-60Bplus_FX-list.pdf`) | Documentazione | Nome, ordine e range di ogni parametro dei 97 effetti. **Nulla sul formato file.** |
| Guida Handy Guitar Lab (`documentazione/E_HandyGuitarLab_for_MS-60Bplus.pdf`) | Documentazione | Conferma che l'app importa ed esporta file `.zptc` (pag. 20–21), Pool, Copy to Device. |
| [zoom-zt2](https://github.com/mungewell/zoom-zt2) `decode_preset.py` | Codice open source | Ipotesi di partenza sulla struttura PTCF dei pedali G1Four (blocchi `TXJ1`/`TXE1`/`EDTB`/`PPRM`, layout dei bit). |
| zoom-zt2 `effects_sort.txt` (MS-60B+) | Dati open source | ID a 32 bit, nome breve sul display, file ZD2, versione e % DSP dei 97 effetti. |
| Export di prova in `patches/` | Dati sperimentali | Conferma di ogni campo per l'MS-60B+ (la struttura differisce da quella G1Four). |
| Screenshot di Handy Guitar Lab | Verifica | Valori letti dall'app dopo l'import e indicatore "Processor %". |

La documentazione tecnica ZOOM descrive gli **effetti**, non il **formato**: il formato è stato ricostruito.

## Metodo: analisi differenziale

Sono state esportate da Handy Guitar Lab sette patch, costruite apposta:

| File | Contenuto | Differenza rispetto al precedente |
|---|---|---|
| `01base.zptc` | DYNAMIC COMPRESSOR: SENSE 5, ATTACK FAST, TONE 50, VOL 80 | — (riferimento) |
| `02tone51` | TONE 51 | un solo parametro, +1 |
| `03vol100` | VOL 100 | un altro parametro |
| `04effettooff` | effetto OFF | stato on/off |
| `05TESTA.zptc` | nome "TEST A" | nome patch |
| `06FLIP.zptc` | + FLIPTOP | secondo effetto, un ampli |
| `07Big Black .zptc` | patch reale con 5 effetti | controllo su un caso reale |

Confrontando i dump esadecimali (`xxd`) a coppie, ogni modifica tocca pochissimi byte:

| Confronto | Offset | Prima → dopo | Interpretazione |
|---|---|---|---|
| 01 → 02 (TONE 50→51) | `0x62` | `80` → `c0` | si accende 1 bit: il LSB di TONE |
| 02 → 03 (VOL 80→100) | `0x64` | `40` → `90` | cambiano i bit di VOL |
| 03 → 04 (effetto OFF) | `0x5c` | `21` → `20` | bit 0 del blocco effetto = ON/OFF |
| 04 → 05 (nome) | `0xa4…` | `TEST ` → `TEST A` | blocco `NAME` in chiaro |
| 05 → 06 (+FLIPTOP) | dimensione e conteggio | `0xc4`→`0xe0`, `2`→`3` | un blocco effetto in più (24 byte) |

Il fatto che TONE+1 accenda un bit **in mezzo a un byte** (`0x80`→`0xc0`) indica subito che i parametri sono **impacchettati a bit**, non allineati ai byte.

## La struttura del file

Tutti gli interi sono little-endian.

```
offset  contenuto
0x00    "PTCF"                         magic
0x04    u32  dimensione totale del file
0x08    u32  versione (2)
0x0C    u32  numero di slot (effetti + 1)
0x10    10 byte  00 00 08 00 00 00 00 00 00 00   (costanti in tutte le esportazioni)
0x1A    10 char  nome breve, ASCII, completato con spazi
0x24    slot × u32  ID effetto per slot (lo slot 0 vale 0)

poi una sequenza di blocchi  [tag 4 char][u32 lunghezza][dati]:
  "TXJ1"  testo (vuoto)
  "TXE1"  descrizione (vuota)
  "EDTB"  slot × 24 byte, un blocco per effetto
  "PRM2"  32 byte di parametri della patch
  "NAME"  32 byte: nome completo (28 char + 4 byte a zero)
```

**Lo slot 0.** Ogni file contiene uno slot in più del numero di effetti: ID 0, acceso, parametri a zero. Gli screenshot di Handy Guitar Lab hanno chiarito cos'è: il riquadro **BLANK** che l'app mostra all'inizio della catena. Il generatore lo riproduce identico.

### Il blocco effetto (EDTB, 24 byte)

I 24 byte vanno letti come **un unico intero little-endian a 192 bit**. Dal bit meno significativo:

| Bit | Campo |
|---|---|
| 0 | ON/OFF |
| 1–29 | ID effetto (29 bit, es. `0x01000010` = DYNAMIC COMPRESSOR) |
| 30–89 | parametri 1–5, **12 bit** ciascuno |
| 90–113 | parametri 6–8, **8 bit** ciascuno |
| 114–161 | parametri 9–12, 12 bit ciascuno |
| 162–191 | non usati (sempre 0 negli export) |

Le larghezze 5×12 / 3×8 / 4×12 arrivano dall'ipotesi zoom-zt2 per i G1Four. Sono state confermate qui: con quel layout, tutti gli effetti di tutti gli export si decodificano nei valori attesi, ad esempio il Graphic EQ a 8 parametri.

Esempio con `01base`, blocco all'offset `0x5c`:

```
21 00 00 42 01 04 80 0c 40 01 00 …
bit 0        = 1              → ON
bit 1–29     = 0x01000010     → DYNAMIC COMPRESSOR (ID dalla tabella zoom-zt2)
param 1 (12) = 5              → SENSE 5
param 2 (12) = 1              → ATTACK = FAST (indice 1 di "SLOW, FAST")
param 3 (12) = 50             → TONE 50
param 4 (12) = 80             → VOL 80
```

TONE inizia al bit 54, cioè al bit 6 del byte 6 del blocco (offset `0x62`). Passando da 50 a 51 si accende proprio quel bit: `0x80 | 0x40 = 0xc0`, esattamente quanto osservato nel confronto.

### Da valore visualizzato a valore memorizzato

Il formato memorizza interi senza segno. La conversione dipende dal range documentato nella Effects List:

| Range | Regola | Esempio | Stato |
|---|---|---|---|
| Lista di opzioni (`SLOW, FAST`) | indice | FAST → 1 | verificato |
| Intero `a – b` | `valore − a` | TONE 50 → 50 | verificato |
| `-12.0 – 12.0`, `-20.0 – 20.0` | passi da 0,5: `(valore − min) / 0,5` | EQ +1,5 dB → 27; BASS +4,0 → 48 | verificato |
| `±15.0`, `±10.0` (altri ampli) | stessa regola, per analogia | — | **da verificare** |
| `OFF, 1 – 6`, `OFF – 100` | OFF = 0, poi `n − min + 1` | — | **da verificare** |
| Frequenze continue, Q, `-10 – -1, 1 – 10` | sconosciuta | — | si inserisce il valore grezzo |

La regola dei passi da 0,5 è stata dedotta dal Graphic EQ della patch "Big Black". I valori memorizzati 16, 28, 33, 36 e 24 diventano −4, +2, +4,5, +6 e 0 dB solo se 24 corrisponde a 0 dB e il passo è 0,5. È stata poi confermata importando GEN TEST2 sul pedale.

### Il blocco PRM2

Non è decifrato del tutto. Due campi sono stati identificati per confronto:

- **byte 10, bit 5–7**: lo slot selezionato in modifica. In `06FLIP` vale `0x4c` invece di `0x2c` perché era selezionato FLIPTOP (slot 2).
- **byte 20**: un bit per ogni slot che contiene un ampli. In `06FLIP` vale `0x08` (bit 3 = slot 2 + 1); in "Big Black" vale `0x40` (AMPG SVT nello slot 5).

Il resto viene copiato da `01base` (template). Alcuni campi di "Big Black" non sono ancora spiegati: il byte 0 e i byte 11–12.

### Parametri nascosti

Gli ampli hanno un **nono parametro**, non documentato, che vale sempre 2 negli export (FLIPTOP, AMPG SVT). Il generatore lo imposta allo stesso valore.

## Verifica

1. **Round-trip byte per byte.** `node tools/zptc.mjs roundtrip patches/*` decodifica ogni export e lo ricodifica: tutti e 7 i file sono identici agli originali.
2. **Encoder da valori leggibili.** Partendo dai soli valori visualizzati (es. TONE 50, ATTACK FAST), l'encoder riproduce esattamente `01base.zptc` e `06FLIP.zptc`.
3. **Prova sul pedale.** Due patch generate (GEN TEST1 con un compressore; GEN TEST2 con compressore, overdrive, EQ grafico e FLIPTOP) sono state importate in Handy Guitar Lab e copiate nel pedale. Tutti i 28 valori corrispondono, compresi decimali, valori negativi e interruttori.
4. **Builder del sito.** La patch GEN TEST2 composta dall'interfaccia produce gli stessi byte del file già testato; un `.zptc` importato e riesportato resta identico.

## Il carico DSP

ZOOM non pubblica il "peso" degli effetti. La tabella di zoom-zt2 contiene una percentuale per effetto, letta dai file ZD2. Confrontata con l'indicatore **Processor** di Handy Guitar Lab, risulta sistematicamente più alta di circa l'8%:

| Patch | Somma zoom-zt2 | Handy Guitar Lab |
|---|---|---|
| GEN TEST1 | 5,66 | 5% |
| GEN TEST2 | 66,27 | 61% |
| Big Black (esportata) | 92,88 | 86% |
| Big Black (originale) | 103,74 | 96% |

Il rapporto è costante (≈ 0,925). Il sito moltiplica quindi i valori per `DSP_SCALE = 0.925` (in `site/firmware-data.js`): con questa correzione la somma degli effetti coincide con l'indicatore dell'app entro ±1%. Il builder blocca il download sopra il 100%, dove il pedale mostrerebbe PROCESS OVERFLOW.

## Anomalie note

- **Export "Big Black".** Nella patch originale il primo effetto è BLACK OPTICAL COMPRESSOR (ID `0x01000020`). Il file esportato contiene invece `0x09000020`, con parametri a zero, e reimportato l'app stessa lo mostra come effetto sconosciuto (⚠). I due ID differiscono di un solo bit (bit 27): potrebbe essere un flag, oppure un difetto dell'export di Handy Guitar Lab. Va verificato con un nuovo export.

## Come estendere la decodifica

Per decifrare un parametro ancora "grezzo" o "da verificare":

1. esporta la stessa patch due o tre volte, cambiando **solo** quel parametro e annotando i valori sul display;
2. `node tools/zptc.mjs decode file.zptc` mostra il valore grezzo (`raw`) di ogni parametro;
3. ricava la regola da valore visualizzato a valore grezzo e aggiungila alla funzione `codec()` in `site/zptc.js`;
4. rilancia il round-trip, genera una patch di prova e verificala sul pedale prima di togliere l'etichetta "da verificare".

## File del progetto

| File | Ruolo |
|---|---|
| `site/zptc.js` | Codec condiviso: decode, encode, round-trip, conversione dei valori |
| `site/builder.html`, `site/builder.js` | Patch Builder: catena, parametri, DSP, salvataggio, import, download |
| `site/effects-data.js` | Effetti e parametri dalla Effects List (testi originali in inglese) |
| `site/firmware-data.js` | ID, nome sul display, DSP (zoom-zt2) e `DSP_SCALE` |
| `tools/zptc.mjs` | CLI: `decode`, `encode`, `roundtrip` |
| `patches/` | Export di riferimento e patch generate usate per le verifiche |
