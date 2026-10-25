// Catalogo effetti Zoom MS-60B+ — fonte: Effects List ufficiale ZOOM (Z2I-5216-01, 2024).
// Ordine = ordine della Effects List; l'indice corrisponde a assets/effects/fx-NNN.png.
// Formato: [nome, categoria, modello di riferimento, descrizione, tag, parametri]
// Parametri: [nome sul display, descrizione, range]
// Tag: fs = controllato da footswitch, st = uscita stereo, sync = tempo sync (metronomo), dry = mix con segnale pulito

const VOL = ['VOL', 'Volume in uscita.', '0 – 100'];
const MIX = ['MIX', 'Quantità di effetto miscelata al suono originale.', '0 – 100'];
const DRY = ['DRY', 'Volume del segnale non processato.', '0 – 100'];
const BAL = ['BALANCE', 'Bilanciamento tra suono originale ed effetto.', '0 – 100'];
const TAIL = ['TAIL', 'ON: la coda continua dopo lo spegnimento. OFF: si interrompe subito.', 'OFF, ON'];
const CAB = ['CABINET', 'Bilanciamento tra segnale dopo il preamp e dopo il cabinet.', '0 – 100'];
const DLY_MODE = ['MODE', 'Range del tempo di ritardo. Con il metronomo il tempo è sincronizzato al tempo.', 'SHORT, LONG, ♩'];
const REPEAT = ['REPEAT', 'Numero di ripetizioni.', '0 – 100'];
const PREDLY = ['PRE DLY', 'Ritardo tra suono originale e inizio del riverbero.', '1 – 100'];
const DECAY = ['DECAY', 'Durata del riverbero.', '1 – 30'];
const FS_LATCH = ['ON/OFF', 'Funzione del footswitch.', 'LATCH, UNLATCH'];
const GEQ = ['50 Hz', '120 Hz', '400 Hz', '500 Hz', '800 Hz', '4.5 kHz', '10 kHz'].map(band => [band.replace(' ', ''), `Taglia o enfatizza la banda a ${band}.`, '-12.0 – 12.0']);

const EFFECTS_DATA = [
  // DYNAMICS
  ['DYNAMIC COMPRESSOR', 'DYNAMICS', 'MXR Dyna Comp', 'Compressore classico con controlli aggiuntivi di tono e velocità di attacco.', [], [
    ['SENSE', 'Sensibilità dell\'effetto.', '0 – 10'], ['ATTACK', 'Velocità di attacco del compressore.', 'SLOW, FAST'], ['TONE', 'Tono.', '0 – 100'], VOL]],
  ['BLACK OPTICAL COMPRESSOR', 'DYNAMICS', 'Demeter COMP-1 Compulator', 'Compressore ottico con regolazione separata di bassi e alti.', [], [
    ['COMP', 'Profondità della compressione.', '0 – 100'], ['LO', 'Volume delle basse frequenze.', '0 – 100'], ['HI', 'Volume delle alte frequenze.', '0 – 100'], VOL]],
  ['OPTICAL COMPRESSOR', 'DYNAMICS', null, 'Compressore ottico dall\'inviluppo morbido e naturale.', [], [
    ['DRIVE', 'Profondità della compressione.', '0 – 10'], ['LO', 'Volume delle basse frequenze.', '0 – 100'], ['HI', 'Volume delle alte frequenze.', '0 – 100'], VOL]],
  ['DUAL COMPRESSOR', 'DYNAMICS', null, 'Compressore a due bande con impostazioni separate per basse e alte frequenze.', [], [
    ['FREQ', 'Punto di crossover tra banda bassa e alta.', '300 Hz – 1.5 kHz'], ['LOCOMP', 'Compressione della banda bassa.', '0 – 50'], ['HICOMP', 'Compressione della banda alta.', '0 – 50'], VOL]],
  ['MULTIBAND COMPRESSOR', 'DYNAMICS', 'MultiComp (MODE: MB)', 'Compressore multibanda con soglie indipendenti per basse e alte frequenze.', [], [
    ['COMP', 'Profondità della compressione.', '0 – 100'], ['LOTHR', 'Soglia di intervento sulle basse frequenze.', '0 – 100'], ['HITHR', 'Soglia di intervento sulle alte frequenze.', '0 – 100'], VOL]],
  ['GLAM COMPRESSOR', 'DYNAMICS', null, 'Compressore che diventa più "glam" aumentando SHAPE, con mix del segnale pulito.', ['dry'], [
    ['COMP', 'Profondità della compressione.', '0 – 100'], ['SHAPE', 'Enfatizza alte e basse frequenze.', '0 – 10'], VOL, DRY]],
  ['160 COMPRESSOR', 'DYNAMICS', 'dbx 160A', 'Compressore incisivo con soglia, ratio e tipo di knee.', [], [
    ['THRSHLD', 'Soglia di intervento dell\'effetto.', '-60 – 0'], ['RATIO', 'Rapporto di compressione.', '1.0 – 10.0'], ['KNEE', 'Tipo di knee.', 'SOFT, HARD'], VOL]],
  ['1176 LIMITER', 'DYNAMICS', 'UREI 1176LN', 'Limiter veloce che contiene i picchi sopra un livello di riferimento.', [], [
    ['INPUT', 'Livello di ingresso.', '0 – 80'], ['RATIO', 'Rapporto di compressione.', '4:1, 8:1, 12:1, 20:1'], ['RELEASE', 'Tempo di rilascio.', '10 – 70'], ['OUTPUT', 'Livello di uscita.', '0 – 80']]],
  ['ZOOM NOISE REDUCTION', 'DYNAMICS', 'Originale ZOOM', 'Riduce il rumore nelle pause senza alterare il tono.', [], [
    ['DETECT', 'Punto di rilevamento del segnale di controllo.', 'GTRIN, EFXIN'], ['DEPTH', 'Profondità della riduzione.', '0 – 100'], ['THRSHLD', 'Sensibilità dell\'effetto.', '0 – 100'], ['DECAY', 'Rilascio dell\'inviluppo.', '0 – 100']]],
  ['SLOW ATTACK', 'DYNAMICS', null, 'Rallenta l\'attacco di ogni nota per un fraseggio simile al violino.', [], [
    ['TIME', 'Tempo di attacco.', '1 – 50'], ['CURVE', 'Curva della variazione di volume in attacco.', '0 – 10'], ['TONE', 'Tono.', '0 – 100'], VOL]],

  // FILTER
  ['BASS AUTO WAH', 'FILTER', null, 'Auto-wah per basso con mix del segnale originale.', ['dry'], [
    ['SENSE', 'Sensibilità dell\'effetto.', '-10 – -1, 1 – 10'], ['RESO', 'Risonanza.', '0 – 10'], DRY, VOL]],
  ['ENVELOPE FILTER', 'FILTER', 'MXR Envelope Filter', 'Filtro a inviluppo con soglia, attacco e direzione.', [], [
    ['THRSHLD', 'Sensibilità dell\'effetto.', '0 – 100'], ['ATTACK', 'Velocità di attacco.', '0 – 100'], ['MODE', 'Direzione di movimento del filtro.', 'UP, DOWN'], VOL]],
  ['AUTO FILTER', 'FILTER', null, 'Filtro risonante con inviluppo molto netto.', ['dry'], [
    ['MODE', 'Direzione di movimento del filtro.', 'UP, DOWN'], ['SENSE', 'Sensibilità dell\'effetto.', '1 – 10'], ['PEAK', 'Q del filtro.', '0 – 10'], DRY]],
  ['Z TRON FILTER', 'FILTER', 'Q-Tron (modo LP)', 'Envelope filter in stile Q-Tron in modalità passa-basso.', ['dry'], [
    ['SENSE', 'Sensibilità dell\'effetto.', '-10 – -1, 1 – 10'], ['RESO', 'Risonanza.', '0 – 10'], DRY, VOL]],
  ['BASS CRY FILTER', 'FILTER', null, 'Talking modulator adatto al range del basso.', ['dry'], [
    ['RANGE', 'Range di frequenze processato.', '1 – 10'], ['RESO', 'Risonanza.', '0 – 10'], ['SENSE', 'Sensibilità dell\'effetto.', '-10 – -1, 1 – 10'], BAL]],
  ['ENVELOPE GENERATOR FILTER', 'FILTER', null, 'Filtro il cui movimento è controllato dal footswitch.', ['fs', 'dry'], [
    ['FREQ1', 'Frequenza con footswitch spento.', '0 – 100'], ['FREQ2', 'Frequenza con footswitch acceso.', '0 – 100'], ['RESO', 'Risonanza.', '0 – 100'], ['TYPE', 'Tipo di filtro.', 'HPF2 – LPF4'], ['SPEED', 'Velocità della modulazione.', '0 – 100'], BAL, VOL]],
  ['SEQUENCE FILTER', 'FILTER', 'Z.Vex Seek-Wah', 'Filtro a step sequenziali con pattern selezionabili.', [], [
    ['STEP', 'Numero di step della sequenza.', '2 – 8'], ['PATTERN', 'Pattern dell\'effetto.', '1 – 8'], ['SPEED', 'Velocità della modulazione.', '1 – 50'], ['RESO', 'Risonanza.', '0 – 10']]],
  ['BASS GRAPHIC EQ', 'FILTER', null, 'Equalizzatore grafico a 7 bande pensato per il basso.', [], [...GEQ, VOL]],
  ['STEREO BASS GRAPHIC EQ', 'FILTER', null, 'Equalizzatore grafico stereo a 7 bande per il basso.', ['st'], [...GEQ, VOL]],
  ['BASS PARAMETRIC EQ', 'FILTER', null, 'Equalizzatore parametrico a 1 banda per il basso.', [], [
    ['FREQ', 'Frequenza dell\'equalizzatore.', '20 Hz – 20 kHz'], ['Q', 'Larghezza di banda (Q).', '0.5 – 16.0'], ['GAIN', 'Guadagno.', '-20.0 – 20.0'], VOL]],
  ['LOW EQ', 'FILTER', null, 'EQ per le basse frequenze: shelving o passa-alto.', [], [
    ['TYPE', 'Tipo di filtro.', 'SHELF, HPF'], ['FREQ', 'Frequenza del filtro.', '20 Hz – 640 Hz'], ['GAIN', 'Guadagno (disattivo con TYPE = HPF).', '-12.0 – 12.0'], VOL]],
  ['HIGH EQ', 'FILTER', null, 'EQ per le alte frequenze: shelving o passa-basso.', [], [
    ['TYPE', 'Tipo di filtro.', 'SHELF, LPF'], ['FREQ', 'Frequenza del filtro.', '500 Hz – 20 kHz'], ['GAIN', 'Guadagno (disattivo con TYPE = LPF).', '-12.0 – 12.0'], VOL]],
  ['SPLITTER', 'FILTER', null, 'Divide il segnale in due bande (bassi/alti) e ne regola liberamente il mix.', [], [
    ['FREQ', 'Punto di crossover tra le due bande.', '80 Hz – 2.5 kHz'], ['LO', 'Livello della banda bassa.', '0 – 100'], ['HI', 'Livello della banda alta.', '0 – 100'], VOL]],
  ['EXCITER', 'FILTER', null, 'Exciter flessibile con correzione di fase su bassi e alti.', ['fs'], [
    ['BASS', 'Correzione di fase sulle basse frequenze.', '0 – 100'], ['TREBLE', 'Correzione di fase sulle alte frequenze.', '0 – 100'], VOL, FS_LATCH]],

  // DRIVE
  ['EP DRIVE', 'DRIVE', 'Maestro Echoplex (preamp)', 'Preamp drive con colore vintage da eco a nastro.', [], [
    ['GAIN', 'Guadagno.', '0 – 100'], ['BASS', 'Basse frequenze.', '-10 – 10'], ['TREBLE', 'Alte frequenze.', '-10 – 10'], VOL]],
  ['RC DRIVE', 'DRIVE', null, 'Booster che va dal clean boost al leggero overdrive.', [], [
    ['GAIN', 'Guadagno.', '0 – 100'], ['BASS', 'Basse frequenze.', '0 – 100'], ['TREBLE', 'Alte frequenze.', '0 – 100'], VOL]],
  ['BASS TS DRIVE', 'DRIVE', 'Ibanez TS808', 'Tube Screamer per basso con bilanciamento tra pulito e distorto.', ['dry'], [
    ['GAIN', 'Guadagno.', '0 – 100'], ['TONE', 'Tono.', '0 – 100'], BAL, VOL]],
  ['BASS OVERDRIVE', 'DRIVE', 'BOSS ODB-3', 'Overdrive per basso con bilanciamento pulito/effetto.', ['dry'], [
    ['GAIN', 'Guadagno.', '0 – 100'], ['TONE', 'Tono.', '0 – 100'], BAL, VOL]],
  ['BLUEBERRY DRIVE', 'DRIVE', 'Mad Professor Blueberry Bass Overdrive', 'Overdrive caldo con blend del segnale originale.', ['dry'], [
    ['GAIN', 'Guadagno.', '0 – 100'], ['TONE', 'Tono.', '0 – 100'], ['BLEND', 'Bilanciamento tra originale ed effetto.', '0 – 100'], VOL]],
  ['DARK OVERDRIVE', 'DRIVE', 'Darkglass Microtubes B3K', 'Drive moderno con controllo di attacco sulle alte.', ['dry'], [
    ['GAIN', 'Guadagno.', '0 – 100'], ['ATTACK', 'Volume delle alte frequenze.', 'CUT, FLAT, BOOST'], ['BLEND', 'Bilanciamento tra originale ed effetto.', '0 – 100'], VOL]],
  ['SQUEAK DISTORTION', 'DRIVE', 'ProCo RAT', 'Distorsione aggressiva con mix del segnale pulito.', ['dry'], [
    ['GAIN', 'Guadagno.', '0 – 100'], ['FILTER', 'Tono.', '0 – 100'], VOL, DRY]],
  ['VOODOO-B DISTORTION', 'DRIVE', 'Roger Mayer Voodoo-Bass', 'Distorsione con blend tra originale ed effetto.', ['dry'], [
    ['GAIN', 'Guadagno.', '0 – 100'], ['TONE', 'Tono.', '0 – 100'], ['BLEND', 'Bilanciamento tra originale ed effetto.', '0 – 100'], VOL]],
  ['BASS OCTAVE FUZZ', 'DRIVE', null, 'Fuzz che aggiunge un\'ottava superiore.', ['dry'], [
    ['BOOST', 'Guadagno.', '0 – 100'], ['TONE', 'Tono.', '0 – 100'], ['FUZZ', 'Quantità di fuzz nel mix.', '0 – 100'], DRY]],
  ['NEW YORK MUFF FUZZ', 'DRIVE', 'Electro-Harmonix Big Muff Pi', 'Fuzz corposo con bilanciamento pulito/effetto.', ['dry'], [
    ['SUSTAIN', 'Guadagno.', '0 – 100'], ['TONE', 'Tono.', '0 – 100'], BAL, VOL]],
  ['BASS FUZZ SMILE', 'DRIVE', 'Fuzz Face', 'Fuzz vintage con bilanciamento pulito/effetto.', ['dry'], [
    ['GAIN', 'Guadagno.', '0 – 100'], ['TONE', 'Tono.', '0 – 100'], BAL, VOL]],
  ['BASS METAL DRIVE', 'DRIVE', 'BOSS Metal Zone', 'Distorsione high-gain con bilanciamento pulito/effetto.', ['dry'], [
    ['GAIN', 'Guadagno.', '0 – 100'], ['TONE', 'Tono.', '0 – 100'], BAL, VOL]],
  ['TS+BOOST DRIVE', 'DRIVE', null, 'TS Drive e Booster combinati, con ordine di collegamento selezionabile.', [], [
    ['GAIN', 'Guadagno del TS Drive.', '0 – 100'], ['TONE', 'Tono del TS Drive.', '0 – 100'], ['VOL', 'Volume del TS Drive.', '0 – 100'], ['COMP', 'Tipo di clipping del TS Drive.', '0 – 2'], ['BOOST', 'Guadagno del Booster.', '0 – 100'], ['BASS', 'Basse frequenze del Booster.', '0 – 100'], ['TREBLE', 'Alte frequenze del Booster.', '0 – 100'], ['ORDER', 'Ordine di collegamento tra TS Drive e Booster.', 'BOOST-OD, OD-BOOST']]],

  // PREAMP
  ['BASS DRIVER PREAMP', 'PREAMP', 'SansAmp Bass Driver DI', 'Preamp/DI classico con EQ a 3 bande, presence e blend.', ['dry'], [
    ['BASS', 'Basse frequenze.', '0 – 100'], ['TREBLE', 'Alte frequenze.', '0 – 100'], ['PRESENC', 'Frequenze super-alte.', '0 – 100'], ['BLEND', 'Bilanciamento tra originale ed effetto.', '0 – 100'], ['GAIN', 'Guadagno.', '0 – 100'], VOL, ['MID-FREQ', 'Frequenza centrale dei medi.', '500 Hz, 1.0 kHz'], ['MID', 'Medie frequenze.', '0 – 100']]],
  ['D.I PLUS PREAMP', 'PREAMP', 'MXR Bass D.I.+', 'Preamp con canale clean e canale distorto.', ['dry'], [
    ['BASS', 'Basse frequenze.', '0 – 100'], ['MID', 'Medie frequenze.', '0 – 100'], ['TREBLE', 'Alte frequenze.', '0 – 100'], ['COLOR', 'EQ preimpostato sul canale clean.', 'OFF, ON'], ['CHANNEL', 'Canale clean o distorto.', 'CLEAN, DIST'], ['BLEND', 'Bilanciamento originale/effetto del canale distorto.', '0 – 100'], ['GAIN', 'Guadagno del canale distorto.', '0 – 100'], VOL]],
  ['DARK PREAMP', 'PREAMP', 'Darkglass Microtubes B7K', 'Preamp moderno con EQ a 4 bande e boost selezionabile.', ['dry'], [
    ['BASS', 'Basse frequenze.', '0 – 100'], ['LO-MID', 'Medio-basse.', '0 – 100'], ['HI-MID', 'Medio-alte.', '0 – 100'], ['TREBLE', 'Alte frequenze.', '0 – 100'], ['BLEND', 'Bilanciamento tra originale ed effetto.', '0 – 100'], ['GAIN', 'Guadagno.', '0 – 100'], VOL, ['BOOST', 'Bande enfatizzate.', 'OFF, LO, HI, LO+HI']]],
  ['CLEAR DRIVER PREAMP', 'PREAMP', 'Originale ZOOM', 'Distorsione definita con EQ a fase lineare: miscelata al pulito non crea problemi di fase.', ['dry'], [
    ['BASS', 'Basse frequenze.', '0 – 100'], ['MID-FREQ', 'Frequenza centrale dei medi.', '100 Hz – 1.0 kHz'], ['MID', 'Medie frequenze.', '0 – 100'], ['TREBLE', 'Alte frequenze.', '0 – 100'], ['PRESENC', 'Frequenze super-alte.', '0 – 100'], ['BLEND', 'Bilanciamento tra originale ed effetto.', '0 – 100'], ['GAIN', 'Guadagno.', '0 – 100'], VOL]],
  ['1073 PREAMP', 'PREAMP', 'Preamp microfonico vintage a trasformatori', 'Carattere da preamp microfonico vintage con EQ a 3 bande a frequenze selezionabili.', [], [
    ['GAIN', 'Guadagno.', '20 – 50'], ['BASS-F', 'Frequenza dei bassi.', '55 Hz, 220 Hz'], ['BASS', 'Basse frequenze.', '-50 – 50'], ['MID-F', 'Frequenza dei medi.', '350 Hz – 3.2 kHz'], ['MID', 'Medie frequenze.', '-50 – 50'], ['TRBL-F', 'Frequenza degli alti.', '10 kHz, 16 kHz'], ['TREBLE', 'Alte frequenze.', '-50 – 50'], VOL]],
  ['SOLID PREAMP', 'PREAMP', 'Preamp microfonico a stato solido da console', 'Preamp a stato solido con controllo delle armoniche.', [], [
    ['GAIN', 'Guadagno.', '0 – 100'], ['HARMNIC', 'Quantità di armoniche.', '0 – 100'], ['LOTYPE', 'Tipo di filtro sui bassi.', 'SHELF, PEQ'], ['LO-FREQ', 'Frequenza dei bassi.', '40 Hz – 600 Hz'], ['LO', 'Basse frequenze.', '-50 – 50'], ['HI-FREQ', 'Frequenza degli alti.', '1.5 kHz – 22.0 kHz'], ['HI', 'Alte frequenze.', '-50 – 50'], VOL]],
  ['DI-5 PREAMP', 'PREAMP', 'Avalon Design U5', 'DI/preamp per il segnale diretto del basso con preset di tono.', [], [
    ['GAIN', 'Guadagno.', '0 – 100'], ['TONE', 'Preset di tono.', 'OFF, 1 – 6'], ['HICUT', 'Taglia le alte frequenze.', 'OFF, ON'], VOL]],
  ['SB PREAMP 1', 'PREAMP', null, 'Preamp con equalizzatore a 3 bande.', [], [
    ['BASS', 'Basse frequenze.', '0 – 10'], ['MID', 'Medie frequenze.', '-10 – 10'], ['TREBLE', 'Alte frequenze.', '0 – 10'], VOL]],
  ['BBB PREAMP', 'PREAMP', 'Xotic Bass BB Preamp', 'Preamp/overdrive con EQ a 2 bande.', [], [
    ['GAIN', 'Guadagno.', '0 – 100'], ['BASS', 'Basse frequenze.', '-10 – 10'], ['TREBLE', 'Alte frequenze.', '-10 – 10'], VOL]],
  ['SUPER LOW PREAMP', 'PREAMP', 'Originale ZOOM', 'Amp model per frequenze estremamente basse, con sub-ottava.', ['dry'], [
    ['GAIN', 'Guadagno (influenza anche ENHANCE).', '0 – 100'], ['ENHANCE', 'Enfatizza le basse frequenze.', '0 – 100'], ['SUB', 'Volume dell\'ottava inferiore.', '0 – 100'], ['LO', 'Basse frequenze.', '0 – 100'], ['MID', 'Medie frequenze.', '0 – 100'], ['HI', 'Alte frequenze.', '0 – 100'], BAL, VOL]],
  ['DJENT PREAMP', 'PREAMP', 'Originale ZOOM', 'Bassi puliti e alti molto distorti: ideale per Djent con bassi a 5+ corde.', [], [
    ['BASS', 'Basse frequenze.', '0 – 100'], ['LO-MID', 'Medio-basse.', '0 – 100'], ['HI-MID', 'Medio-alte.', '0 – 100'], ['TREBLE', 'Alte frequenze.', '0 – 100'], ['HIBOOST', 'Boost sulle alte frequenze.', 'OFF, ON'], ['LOCUT', 'Frequenza di taglio dei bassi.', 'OFF, 20 Hz – 120 Hz'], ['GAIN', 'Guadagno.', '0 – 100'], VOL]],

  // MODULATION
  ['CLONE CHORUS', 'MODULATION', 'Electro-Harmonix Small Clone', 'Chorus analogico dal carattere vintage.', [], [
    ['DEPTH', 'Profondità della modulazione.', '1, 2'], ['RATE', 'Velocità della modulazione.', '0 – 100'], ['TONE', 'Tono.', '0 – 100'], MIX]],
  ['CHORUS ONE', 'MODULATION', 'BOSS CH-1 Super Chorus', 'Chorus classico e brillante.', [], [
    ['DEPTH', 'Profondità della modulazione.', '0 – 100'], ['RATE', 'Velocità della modulazione.', '0 – 100'], ['TONE', 'Tono.', '0 – 100'], MIX]],
  ['TRI CHORUS', 'MODULATION', 'tc electronic Corona Tri-Chorus', 'Chorus a tre voci per un movimento ampio.', [], [
    ['DEPTH', 'Profondità della modulazione.', '0 – 100'], ['SPEED', 'Velocità della modulazione.', '0 – 100'], ['TONE', 'Tono.', '0 – 100'], MIX]],
  ['BASS STEREO CHORUS', 'MODULATION', null, 'Chorus stereo per basso dal suono limpido, con taglio dei bassi sull\'effetto.', ['st'], [
    ['DEPTH', 'Profondità della modulazione.', '0 – 100'], ['RATE', 'Velocità della modulazione.', '1 – 50'], ['LOCUT', 'Taglio dei bassi sul suono effettato.', 'OFF, 60 Hz – 800 Hz'], MIX]],
  ['BASS VINTAGE FLANGER', 'MODULATION', 'MXR M-117R', 'Flanger analogico con taglio dei bassi sull\'effetto.', [], [
    ['DEPTH', 'Profondità della modulazione.', '0 – 100'], ['RATE', 'Velocità della modulazione.', '0 – 50'], ['RESO', 'Risonanza.', '-10 – 10'], ['LOCUT', 'Taglio dei bassi sul suono effettato.', 'OFF, 60 Hz – 800 Hz']]],
  ['KICK FLANGER', 'MODULATION', null, 'Flanger controllato dal footswitch, con reset dell\'LFO.', ['fs'], [
    ['PRE DLY', 'Pre-delay del suono effettato.', '0 – 100'], ['DEPTH', 'Profondità della modulazione.', '0 – 100'], ['RATE', 'Velocità della modulazione.', '0 – 100'], ['RESO', 'Risonanza.', '0 – 100'], MIX, ['RESET-F', 'Frequenza di reset dell\'LFO.', '0 – 100'], FS_LATCH]],
  ['BASS DETUNE', 'MODULATION', null, 'Leggero pitch shift miscelato al pulito per un chorus naturale.', [], [
    ['CENT', 'Detune in centesimi di semitono.', '-50 – 50'], ['PRE DLY', 'Pre-delay del suono effettato.', '0 – 50'], ['TONE', 'Tono.', '0 – 10'], MIX]],
  ['ORANGE TREMOLO', 'MODULATION', null, 'Variazione ciclica del volume con forma d\'onda selezionabile.', [], [
    ['WAVE', 'Forma d\'onda della modulazione.', 'TRIANGLE, TUBE, SQUARE'], ['DEPTH', 'Profondità della modulazione.', '0 – 100'], ['RATE', 'Velocità della modulazione.', '0 – 100'], VOL]],
  ['PHASER', 'MODULATION', null, 'Phaser classico a 4 o 8 stadi.', [], [
    ['COLOR', 'Carattere dell\'effetto.', '4 STG, 8 STG, INV 4, INV 8'], ['DEPTH', 'Profondità della modulazione.', '0 – 100'], ['RATE', 'Velocità della modulazione.', '1 – 50'], ['RESO', 'Risonanza.', '0 – 100']]],
  ['BASS PHASER', 'MODULATION', null, 'Phaser calibrato sulle frequenze del basso.', [], [
    ['COLOR', 'Colore del suono.', '1, 2'], ['DEPTH', 'Profondità della modulazione.', '0 – 100'], ['RATE', 'Velocità della modulazione.', '0 – 100'], ['RESO', 'Risonanza.', '0 – 100']]],
  ['THE VIBE', 'MODULATION', null, 'Vibe dalle ondulazioni caratteristiche, in modalità vibrato o chorus.', [], [
    ['SPEED', 'Velocità della modulazione.', '0 – 50'], ['DEPTH', 'Profondità della modulazione.', '0 – 100'], ['MODE', 'Vibrato o chorus.', 'VIBRT, CHORS'], VOL]],

  // PITCH SHIFT
  ['BASS OCTAVER', 'PITCH SHIFT', null, 'Aggiunge un\'ottava sotto il suono originale.', ['dry'], [
    ['OCT', 'Livello dell\'ottava inferiore.', '0 – 100'], ['LO', 'Basse frequenze.', '0 – 10'], ['HI', 'Alte frequenze.', '0 – 10'], DRY]],
  ['BASS ANALOG OCTAVER', 'PITCH SHIFT', null, 'Octaver analogico con una e due ottave sotto e modulazione.', ['dry'], [
    ['OCT1', 'Livello dell\'ottava inferiore.', '0 – 100'], ['OCT2', 'Livello di due ottave sotto.', '0 – 100'], ['MOD', 'Modulazione applicata all\'ottava inferiore.', '0 – 100'], DRY]],
  ['POLYPHONIC OCTAVER', 'PITCH SHIFT', null, 'Octaver polifonico: funziona anche con gli accordi.', ['dry'], [
    ['LO', 'Basse frequenze.', '0 – 100'], ['HI', 'Alte frequenze.', '0 – 100'], ['WET', 'Quantità di effetto nel mix.', '0 – 100'], ['DRY', 'Quantità di segnale originale nel mix.', '0 – 100']]],
  ['BASS MONO PITCH SHIFTER', 'PITCH SHIFT', null, 'Pitch shifter monofonico progettato per note singole sul basso.', ['dry'], [
    ['SHIFT', 'Trasposizione in semitoni (0 = detune).', '-12 – 12, 24'], ['FINE', 'Regolazione fine in cent.', '-25 – 25'], ['TONE', 'Tono.', '0 – 10'], BAL]],
  ['HARMONY PITCH SHIFTER', 'PITCH SHIFT', null, 'Armonizzatore intelligente che segue tonalità e scala.', [], [
    ['SCALE', 'Intervallo armonico aggiunto (maggiore / minore).', '-6, -5, -4, -3, -m, m, 3, 4, 5, 6'], ['KEY', 'Tonica della scala.', 'C – B'], ['TONE', 'Tono.', '0 – 10'], MIX]],
  ['POLYPHONIC PITCH SHIFTER', 'PITCH SHIFT', null, 'Pitch shifter polifonico: funziona anche con gli accordi.', ['dry'], [
    ['SHIFT', 'Trasposizione in semitoni.', '-24 – 24'], ['TONE', 'Tono.', '0 – 100'], ['WET', 'Quantità di effetto nel mix.', '0 – 100'], ['DRY', 'Quantità di segnale originale nel mix.', '0 – 100']]],

  // SYNTH
  ['BASS SYNTHESIZER', 'SYNTH', 'Originale ZOOM', 'Synth bass con filtro a inviluppo e ottava inferiore.', ['dry'], [
    ['MODE', 'Direzione di movimento del filtro.', 'UP, DOWN'], ['SENSE', 'Sensibilità del trigger.', '0 – 100'], ['ATTACK', 'Velocità di attacco.', '0 – 100'], ['RANGE', 'Modulazione della frequenza di taglio.', '0 – 100'], ['RESO', 'Risonanza.', '0 – 100'], ['OCT', 'Livello dell\'ottava inferiore.', '0 – 100'], BAL, VOL]],
  ['Z-SYNTHESIZER', 'SYNTH', null, 'Synth bass con la "ciccia" di un synth analogico e forma d\'onda selezionabile.', ['dry'], [
    ['FREQ', 'Frequenza di taglio del passa-basso.', '0 – 10'], ['RANGE', 'Modulazione della frequenza di taglio.', '0 – 20'], ['DECAY', 'Velocità della modulazione del tono.', '0 – 100'], ['RESO', 'Risonanza.', '0 – 20'], ['WAVE', 'Forma d\'onda.', 'SAW, SQUARE'], ['TONE', 'Tono.', '0 – 10'], BAL, VOL]],
  ['BASS TALK SYNTHESIZER', 'SYNTH', null, 'Synth "parlante" che produce vocali, come un talking modulator.', ['dry'], [
    ['TYPE', 'Variazione vocalica.', 'IA, UE, UA, OA'], ['SENSE', 'Sensibilità del trigger.', '0 – 100'], ['ATTACK', 'Velocità di attacco.', '0 – 100'], ['RESO', 'Risonanza.', '0 – 100'], ['TONE', 'Tono.', '0 – 10'], ['OCT', 'Livello dell\'ottava inferiore.', '0 – 100'], BAL, VOL]],

  // DELAY
  ['DELAY', 'DELAY', null, 'Delay lungo fino a 4000 ms.', ['sync'], [
    ['TIME', 'Tempo di ritardo (ms).', '1 – 4000'], DLY_MODE, REPEAT, MIX]],
  ['ANALOG DELAY', 'DELAY', null, 'Simulazione di delay analogico fino a 4000 ms.', ['sync'], [
    ['TIME', 'Tempo di ritardo (ms).', '1 – 4000'], DLY_MODE, REPEAT, MIX]],
  ['TAPE ECHO', 'DELAY', null, 'Eco a nastro: cambiando TIME cambia anche l\'intonazione delle ripetizioni.', ['sync'], [
    ['TIME', 'Tempo di ritardo (ms).', '1 – 2000'], DLY_MODE, REPEAT, MIX]],
  ['DUAL DELAY', 'DELAY', 'Eventide TimeFactor DigitalDelay', 'Due delay combinati con tempi e ripetizioni indipendenti, mono o stereo.', ['sync', 'st', 'dry'], [
    ['TIMEA', 'Tempo del Delay A (ms).', '0 – 1490'], ['TIMEB', 'Tempo del Delay B (ms).', '0 – 1490'], ['MODE', 'Range del tempo; con il metronomo è sincronizzato al tempo.', 'TIME, ♩'], BAL, ['REP A', 'Ripetizioni del Delay A.', '0 – 110'], ['REP B', 'Ripetizioni del Delay B.', '0 – 110'], ['DLYMX', 'Mix tra Delay A e B.', '0 – 100'], ['DEPTH', 'Profondità della modulazione e uscita mono (MN) o stereo (ST).', 'MN-0 – ST-50']]],
  ['REVERSE DELAY', 'DELAY', null, 'Delay al contrario fino a 2000 ms.', ['sync', 'dry'], [
    ['TIME', 'Tempo di ritardo (ms).', '10 – 2000'], DLY_MODE, REPEAT, BAL]],
  ['MODULATION DELAY', 'DELAY', null, 'Delay con modulazione delle ripetizioni.', ['sync'], [
    ['TIME', 'Tempo di ritardo (ms).', '1 – 2000'], DLY_MODE, REPEAT, MIX]],
  ['HOLD DELAY', 'DELAY', null, 'Premi il footswitch per attivarlo, rilascialo per congelare le ripetizioni.', ['fs', 'sync', 'st'], [
    ['TIME', 'Tempo di ritardo (ms).', '1 – 4000'], DLY_MODE, REPEAT, ['HI-DMP', 'Attenuazione degli alti sulle ripetizioni.', '0 – 10'], ['TONE', 'Tono.', '0 – 100'], MIX, ['P-P', 'Uscita mono o ping-pong.', 'MONO, P-P'], TAIL]],

  // REVERB
  ['ROOM REVERB', 'REVERB', null, 'Simula l\'acustica di una stanza.', [], [PREDLY, DECAY, MIX, TAIL]],
  ['BRIGHT ROOM REVERB', 'REVERB', null, 'Riverbero di stanza dal carattere brillante.', [], [PREDLY, DECAY, ['TONE', 'Tono.', '0 – 10'], MIX]],
  ['SPRING REVERB', 'REVERB', null, 'Simula un riverbero a molla.', [], [PREDLY, DECAY, MIX, TAIL]],
  ['HALL REVERB', 'REVERB', null, 'Simula l\'acustica di una sala da concerto.', [], [PREDLY, DECAY, MIX, TAIL]],
  ['BRIGHT HALL REVERB', 'REVERB', null, 'Riverbero di sala dal carattere brillante.', [], [PREDLY, DECAY, ['TONE', 'Tono.', '0 – 10'], MIX]],
  ['AIR REVERB', 'REVERB', null, 'Riproduce l\'ambienza di una stanza per dare profondità spaziale.', [], [
    ['SIZE', 'Dimensione dello spazio.', '1 – 100'], ['REFLECT', 'Quantità di riflessioni dalle pareti.', '0 – 10'], MIX, TAIL]],

  // SFX
  ['LOOP ROLL', 'SFX', null, 'Campiona e ripete ciò che suoni tramite il footswitch.', ['fs', 'dry'], [
    ['TIME', 'Durata del loop (ms).', '10 – 4000'], ['DUTY', 'Durata del suono campionato.', '25 – 100'], BAL, FS_LATCH]],
  ['PHASER+DISTORTION', 'SFX', 'Roland Jet Phaser', 'Phaser e distorsione combinati per il classico suono "jet".', [], [
    ['MODE', 'Modalità del suono jet.', '1 – 4'], ['RATE', 'Velocità della modulazione.', '0 – 50'], ['RESO', 'Risonanza.', '0 – 10'], VOL]],
  ['FRETLESS SIMULATOR', 'SFX', null, 'Trasforma il suono di qualsiasi basso in un fretless.', [], [
    ['SENSE', 'Sensibilità dell\'effetto.', '0 – 30'], ['COLOR', 'Contenuto armonico: valori alti = carattere più marcato.', '1 – 10'], ['TONE', 'Tono.', '1 – 50'], VOL]],
  ['BOMBER', 'SFX', null, 'Genera suoni di esplosione, anche in modalità trigger.', ['fs'], [
    ['DECAY', 'Durata dell\'esplosione.', '1 – 100'], ['TONE', 'Tono.', '0 – 10'], MIX, ['ON/OFF', 'Funzione del footswitch.', 'LATCH, TRIGGER']]],
  ['LINE SELECTOR', 'SFX', null, 'Instrada il segnale all\'effetto successivo (ON) o direttamente alle uscite (OFF).', ['fs'], [
    ['EFX LVL', 'Livello inviato all\'effetto successivo (NEXT EFFECT).', '0 – 150'], ['OUT LVL', 'Livello inviato alle uscite (OUTPUT).', '0 – 150']]],

  // BASS AMP
  ['FLIPTOP', 'BASS AMP', 'Ampeg B-15N', 'Testata vintage dal suono rotondo, con ULTRA e BRIGHT.', [], [
    ['GAIN', 'Guadagno.', '0 – 100'], VOL, CAB, ['ULTRA', 'Enfatizza alte e/o basse frequenze.', 'OFF, HI, LOW, BOTH'], ['BRIGHT', 'Carattere delle alte frequenze.', 'OFF, ON'], ['BASS', 'Basse frequenze.', '-20.0 – 20.0'], ['MID', 'Medie frequenze.', '-20.0 – 20.0'], ['TREBLE', 'Alte frequenze.', '-20.0 – 20.0']]],
  ['AMPG SVT', 'BASS AMP', 'Ampeg SVT', 'Il classico valvolare da palco, con medi a frequenza variabile.', [], [
    ['GAIN', 'Guadagno.', '0 – 100'], VOL, CAB, ['ULTRA', 'Enfatizza alte e/o basse frequenze.', 'OFF, LOW, HI, BOTH, CUT'], ['BASS', 'Basse frequenze.', '-20.0 – 20.0'], ['MID-FREQ', 'Frequenza centrale dei medi.', '32 Hz – 6.3 kHz'], ['MID', 'Medie frequenze.', '-20.0 – 20.0'], ['TREBLE', 'Alte frequenze.', '-20.0 – 20.0']]],
  ['AG 750', 'BASS AMP', 'Aguilar DB 750', 'Testata moderna e profonda con DEEP e BRIGHT.', [], [
    ['GAIN', 'Guadagno.', '0 – 100'], VOL, CAB, ['DEEP', 'Carattere delle basse frequenze.', 'OFF, ON'], ['BRIGHT', 'Carattere delle alte frequenze.', 'OFF, ON'], ['BASS', 'Basse frequenze.', '0 – 100'], ['MID', 'Medie frequenze.', '0 – 100'], ['TREBLE', 'Alte frequenze.', '0 – 100']]],
  ['SMR400', 'BASS AMP', 'SWR SM-400', 'Testata hi-fi con controllo ENHANCE e medi a frequenza variabile.', [], [
    ['GAIN', 'Guadagno.', '0 – 100'], VOL, CAB, ['ENHANCE', 'Controllo di tono che varia frequenza e livello.', '0 – 100'], ['BASS', 'Basse frequenze.', '-15.0 – 15.0'], ['MID-FREQ', 'Frequenza centrale dei medi.', '32 Hz – 6.3 kHz'], ['MID', 'Medie frequenze.', '-15.0 – 15.0'], ['TREBLE', 'Alte frequenze.', '-15.0 – 15.0']]],
  ['EBH360', 'BASS AMP', 'EBS HD360', 'Testata dal suono definito con CHARA e BRIGHT.', [], [
    ['GAIN', 'Guadagno.', '0 – 100'], VOL, CAB, ['CHARA', 'Enfatizza alte e basse frequenze.', 'OFF, ON'], ['BASS', 'Basse frequenze.', '-10.0 – 10.0'], ['MID', 'Medie frequenze.', '-10.0 – 10.0'], ['TREBLE', 'Alte frequenze.', '-10.0 – 10.0'], ['BRIGHT', 'Carattere delle alte frequenze.', '0 – 100']]],
  ['MINI MARK-B', 'BASS AMP', 'Markbass Minimark 802', 'Combo compatto con filtri SHAPE (scoop) e VINTAGE.', [], [
    ['GAIN', 'Guadagno.', '0 – 100'], VOL, CAB, ['SHAPE', 'Enfatizza bassi e alti, taglia i medi.', '0 – 100'], ['VINTAGE', 'Tono vintage.', '0 – 100']]],
  ['TE400SMX', 'BASS AMP', 'Trace Elliot AH400SMX', 'Testata con preset per stile di esecuzione (plettro, slap, dita).', [], [
    ['GAIN', 'Guadagno.', '0 – 100'], VOL, CAB, ['STYLE', 'Preset di tono per lo stile di esecuzione.', 'PICK, SLAP, FINGER'], ['SHAPE', 'Preset che enfatizzano bassi e alti tagliando i medi.', 'OFF, 1, 2'], ['BASS', 'Basse frequenze.', '-15.0 – 15.0'], ['MID', 'Medie frequenze.', '-15.0 – 15.0'], ['TREBLE', 'Alte frequenze.', '-15.0 – 15.0']]],
  ['B-MAN100', 'BASS AMP', 'Fender Bassman 100', 'Testata vintage con DEEP e medi a frequenza variabile.', [], [
    ['GAIN', 'Guadagno.', '10 – 100'], ['VOL', 'Volume in uscita.', '10 – 100'], ['CABINET', 'Bilanciamento tra segnale dopo il preamp e dopo il cabinet.', '10 – 100'], ['DEEP', 'Carattere delle basse frequenze.', 'OFF, ON'], ['BASS', 'Basse frequenze.', '10 – 100'], ['MID-FREQ', 'Frequenza centrale dei medi.', '32 Hz – 6.3 kHz'], ['MID', 'Medie frequenze.', '10 – 100'], ['TREBLE', 'Alte frequenze.', '10 – 100']]],
  ['AC 370', 'BASS AMP', 'Acoustic 370', 'Testata anni \'70 dal suono potente, con BRIGHT e medi variabili.', [], [
    ['GAIN', 'Guadagno.', '0 – 100'], VOL, CAB, ['BRIGHT', 'Carattere delle alte frequenze.', 'OFF, ON'], ['BASS', 'Basse frequenze.', '0 – 100'], ['MID-FREQ', 'Frequenza centrale dei medi.', '32 Hz – 6.3 kHz'], ['MID', 'Medie frequenze.', '0 – 100'], ['TREBLE', 'Alte frequenze.', '0 – 100']]],
  ['SUN CB', 'BASS AMP', 'Stato solido vintage anni \'70', 'Stato solido vintage con canale clean (DIST = OFF) o distorto.', [], [
    ['DIST', 'Guadagno; OFF passa al canale clean.', 'OFF – 100'], VOL, CAB, ['INPUT', 'Canale di ingresso.', 'NORMAL, BRIGHT'], ['HIBOOST', 'Boost sulle alte frequenze.', 'OFF, ON'], ['BASS', 'Basse frequenze.', '0 – 100'], ['MID', 'Medie frequenze.', '0 – 100'], ['TREBLE', 'Alte frequenze.', '0 – 100']]],
  ['MONOTONE', 'BASS AMP', 'Combo a stato solido da jazz', 'Combo a stato solido ideale per il jazz.', [], [
    VOL, CAB, ['MODE', 'Carattere del tono.', 'DARK, NORMAL, BRIGHT'], ['BASS', 'Basse frequenze.', '0 – 100'], ['MID', 'Medie frequenze.', '0 – 100'], ['TREBLE', 'Alte frequenze.', '0 – 100'], ['PRESENC', 'Frequenze super-alte.', '0 – 100']]]
];
