// Contenuti del sito g8astore.it. I dati delle sedi e i prezzi Mac arrivano da Brain (brain.json).
import brain from "./brain.json";

export const SITE = "https://www.g8astore.it";
export const BRAND = "g8astore";

export type Shop = (typeof brain.shops)[number];
export type MacModel = (typeof brain.macModels)[number];

export const shops: Shop[] = brain.shops;
export const macModels: MacModel[] = brain.macModels.filter((m) => m.repairs.length > 0);
export const shopBySlug = (slug: string) => shops.find((s) => s.slug === slug)!;

export const totalReviews = shops.reduce((a, s) => a + (s.reviews || 0), 0);
export const avgRating = (() => {
  const rated = shops.filter((s) => s.rating && s.reviews);
  if (!rated.length) return null;
  const w = rated.reduce((a, s) => a + s.rating! * s.reviews!, 0) / rated.reduce((a, s) => a + s.reviews!, 0);
  return Math.round(w * 10) / 10;
})();
export const fmtRating = (r: number | null) => (r == null ? "" : r.toFixed(1).replace(".", ","));

export const waNumber = (raw: string) => {
  const d = (raw || "").replace(/\D+/g, "");
  if (d.startsWith("39")) return d;
  if (d.startsWith("00")) return d.slice(2);
  return `39${d}`;
};
export const waLink = (shop: Shop, msg: string) => `https://wa.me/${waNumber(shop.whatsapp)}?text=${encodeURIComponent(msg)}`;
export const telLink = (shop: Shop) => `tel:+${waNumber(shop.phone)}`;
export const phoneDisplay = (shop: Shop) => {
  const d = waNumber(shop.phone).slice(2);
  return d.replace(/^(0\d{2,3})(\d{3})(\d+)$/, "$1 $2 $3");
};
export const ratingText = (s: Shop) =>
  s.rating && s.reviews ? `${fmtRating(s.rating)} su Google, ${s.reviews} recensioni` : null;

/** "Lun-Ven: 09.00-13.00 / 15.00-19.00\nSab: 09.00-13.00" → "Lun–Ven 9–13, 15–19; Sab 9–13" */
export function compactHours(hours: string | null) {
  if (!hours) return null;
  return hours
    .split("\n")
    .filter((l) => !/chius/i.test(l))
    .map((l) =>
      l
        .replace(/(\d{2})\.00/g, (_, h) => String(Number(h)))
        .replace(/(\d{2})\.(\d{2})/g, (_, h, m) => `${Number(h)}.${m}`)
        .replace(/\s*\/\s*/g, ", ")
        .replace(/(\w)-(\w)/g, "$1–$2")
        .replace(/:\s*/, " ")
    )
    .join("; ");
}

export const mapsLink =(shop: Shop) =>
  shop.placeId
    ? `https://www.google.com/maps/search/?api=1&query=g8astore&query_place_id=${shop.placeId}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`G8A Store ${shop.address} ${shop.zip} ${shop.city}`)}`;

// Comuni vicini a ogni negozio: rendono ogni pagina città davvero locale.
export const nearby: Record<string, string[]> = {
  gallarate: ["Cardano al Campo", "Samarate", "Cassano Magnago", "Arsago Seprio", "Cavaria con Premezzo", "Somma Lombardo"],
  "busto-arsizio": ["Castellanza", "Olgiate Olona", "Fagnano Olona", "Marnate", "Legnano", "Gorla Minore"],
  "jerago-con-orago": ["Besnate", "Oggiona con Santo Stefano", "Solbiate Arno", "Albizzate", "Cavaria con Premezzo", "Crosio della Valle"],
  bollate: ["Garbagnate Milanese", "Novate Milanese", "Baranzate", "Arese", "Senago", "Cormano"],
  lecco: ["Valmadrera", "Malgrate", "Galbiate", "Pescate", "Abbadia Lariana", "Civate"],
};

// ---------- Riparazioni ----------
export type Problem = {
  slug: string;
  name: string; // "Sostituzione batteria"
  short: string; // riga breve per le card
  icon: string;
  photo: string; // nome file in /img
  intro: string; // apertura della pagina
  symptoms: string[];
  causes: string[];
  steps: [string, string][]; // come lavoriamo, passo per passo
  includes: string[];
  time: string;
  faq: [string, string][];
  macKind?: "batteria" | "schermo";
};

const P = {
  schermo: {
    slug: "schermo", name: "Sostituzione schermo", short: "Display rotto, righe o macchie.", icon: "screen", photo: "notebook-windows",
    intro: "Uno schermo rotto non vuol dire buttare il computer. Individuiamo il pannello esatto del tuo modello, ti diamo prezzo e tempi prima di ordinarlo e lo montiamo noi, controllando che immagine, colori e luminosità siano perfetti.",
    symptoms: ["Vetro o display crepato", "Righe colorate o verticali", "Macchie scure o zone bianche", "Schermo nero con il computer acceso", "Immagine che sfarfalla o si spegne muovendo il coperchio"],
    causes: ["Caduta o urto sul coperchio", "Pressione sullo schermo con il notebook chiuso nello zaino", "Cavo video usurato vicino alle cerniere", "Guasto della retroilluminazione"],
    steps: [["Verifica gratuita", "Colleghiamo un monitor esterno per capire se il guasto è dello schermo, del cavo o della scheda."], ["Pannello esatto", "Leggiamo il codice del pannello del tuo modello per ordinare quello compatibile."], ["Montaggio", "Smontiamo la cornice e sostituiamo il pannello senza toccare i tuoi dati."], ["Test finale", "Controlliamo pixel, colori, luminosità e apertura del coperchio."]],
    includes: ["Pannello nuovo compatibile con il tuo modello", "Manodopera e test completo", "Garanzia sull'intervento", "Nessun intervento sui tuoi file"],
    time: "Da 1 a 5 giorni lavorativi, in base alla disponibilità del pannello.",
    faq: [["Le righe sono sempre colpa dello schermo?", "Non sempre: a volte è il cavo video o la scheda. Lo verifichiamo gratis prima di proporti l'intervento."], ["Posso usare il computer nel frattempo?", "Sì, con un monitor esterno. Se ti serve, ti diciamo come collegarlo."], ["Conviene ripararlo?", "Su notebook recenti quasi sempre sì. Se il costo supera il valore del computer, te lo diciamo prima."]],
    macKind: "schermo",
  },
  batteria: {
    slug: "batteria", name: "Sostituzione batteria", short: "Torna a durare come una volta.", icon: "battery", photo: "notebook-buio",
    intro: "Se il notebook si scarica in un'ora o funziona solo attaccato alla corrente, la batteria è arrivata a fine vita. La sostituiamo con un ricambio compatibile di qualità, controlliamo il circuito di ricarica e ti restituiamo un computer che dura di nuovo.",
    symptoms: ["Si scarica in poco tempo", "Funziona solo con il caricabatterie collegato", "La percentuale salta o si blocca", "Il touchpad o la scocca si sollevano (batteria gonfia)", "Avviso di Windows o macOS sulla salute della batteria"],
    causes: ["Normale usura: le batterie perdono capacità dopo 2-4 anni", "Notebook tenuto sempre in carica al 100%", "Calore eccessivo durante l'uso", "Cicli di scarica completa ripetuti"],
    steps: [["Controllo della batteria", "Misuriamo capacità reale e cicli di carica e verifichiamo che il problema non sia il caricabatterie."], ["Ricambio compatibile", "Scegliamo la batteria giusta per il tuo modello e ti diciamo prezzo e tempi prima di procedere."], ["Sostituzione sicura", "Smontiamo il notebook e sostituiamo la batteria; quella vecchia la smaltiamo noi."], ["Calibrazione e test", "Carichiamo, testiamo la durata e controlliamo che il sistema la riconosca correttamente."]],
    includes: ["Batteria nuova compatibile", "Smaltimento della batteria vecchia", "Test di ricarica e durata", "Garanzia sul ricambio"],
    time: "In giornata con ricambio disponibile, altrimenti 2-4 giorni.",
    faq: [["La batteria è gonfia: è pericoloso?", "Sì, va sostituita subito. Spegni il notebook, non caricarlo e portalo in negozio il prima possibile."], ["Quanto dura una batteria nuova?", "Con un uso normale 2-4 anni. Ti diamo qualche consiglio per farla durare di più."], ["Perdo i miei dati?", "No, la sostituzione della batteria non tocca il disco."]],
    macKind: "batteria",
  },
  tastiera: {
    slug: "tastiera", name: "Tastiera e touchpad", short: "Tasti che non vanno, liquidi versati.", icon: "keyboard", photo: "lavoro-notebook",
    intro: "Tasti che non scrivono, che scrivono da soli o un touchpad che non risponde rendono il notebook inutilizzabile. Puliamo o sostituiamo la tastiera e il touchpad del tuo modello e controlliamo che non ci siano danni da liquidi sulla scheda.",
    symptoms: ["Tasti che non scrivono o scrivono da soli", "Tasti staccati o duri", "Retroilluminazione spenta", "Touchpad che non risponde o salta"],
    causes: ["Liquidi versati", "Briciole e polvere sotto i tasti", "Usura dei tasti più usati", "Cavo della tastiera danneggiato"],
    steps: [["Diagnosi", "Verifichiamo se è un problema di tastiera, di cavo o di software."], ["Pulizia o ricambio", "Se basta, puliamo; altrimenti ordiniamo la tastiera con il layout italiano corretto."], ["Sostituzione", "Su molti modelli la tastiera è fissata alla scocca: la sostituiamo con cura."], ["Test tasto per tasto", "Controlliamo ogni tasto, la retroilluminazione e il touchpad."]],
    includes: ["Tastiera o touchpad compatibili", "Layout italiano", "Test di ogni tasto", "Garanzia sull'intervento"],
    time: "1-4 giorni in base al ricambio.",
    faq: [["Ho versato del liquido: cosa faccio?", "Spegni subito, stacca il caricabatterie, non asciugare con il phon e portalo in negozio: prima interveniamo, più è probabile salvare la scheda."], ["Posso usare una tastiera esterna nel frattempo?", "Sì, una tastiera USB funziona finché non ripariamo."]],
  },
  lento: {
    slug: "pc-lento", name: "Computer lento", short: "Torna veloce, spesso senza cambiarlo.", icon: "gauge", photo: "scrivania-notebook",
    intro: "Un computer lento è il problema più comune e quasi sempre si risolve senza comprarne uno nuovo. Controlliamo disco, memoria, temperature e programmi in avvio: spesso un SSD e una pulizia del sistema lo rendono più veloce di quando era nuovo.",
    symptoms: ["Minuti per accendersi", "Programmi che si bloccano", "Ventola sempre al massimo", "Disco al 100% in Gestione attività", "Browser lento anche con poche schede"],
    causes: ["Disco meccanico (HDD) vecchio o rovinato", "Poca memoria RAM", "Troppi programmi all'avvio", "Polvere e surriscaldamento", "Virus o programmi indesiderati"],
    steps: [["Diagnosi gratuita", "Misuriamo disco, RAM e temperature e controlliamo i programmi in avvio."], ["Proposta chiara", "Ti diciamo cosa serve davvero: pulizia, SSD, RAM o tutte e tre, con il prezzo."], ["Intervento", "Montiamo i componenti e copiamo il sistema: ritrovi file e programmi come prima."], ["Prova finale", "Verifichiamo i tempi di avvio e le temperature prima di riconsegnarlo."]],
    includes: ["Diagnosi gratuita", "Pulizia di sistema e avvio", "Copia completa su SSD se lo monti", "Test delle prestazioni"],
    time: "In giornata per pulizia e upgrade SSD con ricambio disponibile.",
    faq: [["Conviene sistemarlo o cambiarlo?", "Te lo diciamo dopo la diagnosi gratuita. Se l'intervento costa troppo rispetto al valore del computer, ti mostriamo le alternative."], ["Perdo i miei file?", "No: copiamo i dati prima di qualsiasi intervento sul disco."]],
  },
  accensione: {
    slug: "non-si-accende", name: "Non si accende", short: "Diagnosi completa: alimentazione, scheda, disco.", icon: "power", photo: "scheda-madre",
    intro: "Premi il tasto e non succede niente, oppure si accende e resta lo schermo nero. Non farti prendere dal panico: nella maggior parte dei casi il guasto è riparabile e i dati sono salvi. Troviamo il componente guasto e ti diamo il prezzo esatto prima di ripararlo.",
    symptoms: ["Nessuna luce premendo il tasto", "Si accende ma lo schermo resta nero", "Si spegne da solo dopo pochi secondi", "Bip o lampeggi all'avvio", "Si riavvia di continuo"],
    causes: ["Caricabatterie o alimentatore guasto", "Batteria completamente scarica o rotta", "Memoria RAM o disco difettosi", "Guasto della scheda madre", "Surriscaldamento"],
    steps: [["Verifica alimentazione", "Controlliamo caricabatterie, alimentatore e batteria."], ["Test dei componenti", "Proviamo RAM, disco e scheda fino a trovare il pezzo guasto."], ["Preventivo", "Ti diciamo cosa si è rotto, quanto costa e quanto tempo serve."], ["Riparazione e test", "Ripariamo e lasciamo il computer acceso sotto controllo prima di riconsegnarlo."]],
    includes: ["Diagnosi gratuita", "Salvataggio dati se serve", "Riparazione del componente guasto", "Test di stabilità"],
    time: "Diagnosi in 24-48 ore; riparazione in base al ricambio.",
    faq: [["La diagnosi si paga?", "No, è gratuita. Se decidi di non riparare non paghi nulla."], ["Si possono salvare i dati anche se non si accende?", "Quasi sempre sì: il disco di solito è integro e i dati si recuperano."]],
  },
  ricarica: {
    slug: "non-carica", name: "Non carica", short: "Connettore, caricabatterie o scheda.", icon: "plug", photo: "notebook-caffe",
    intro: "Se la spia di ricarica non si accende o il notebook carica solo muovendo il cavo, il problema può essere il caricabatterie, il connettore o il circuito di ricarica. Lo verifichiamo e sostituiamo solo il pezzo che serve.",
    symptoms: ["La spia di ricarica non si accende", "Carica solo muovendo il cavo", "Connettore allentato o storto", "Batteria ferma a una percentuale"],
    causes: ["Caricabatterie guasto o non originale", "Connettore di alimentazione usurato", "Cavo interno danneggiato", "Guasto del circuito di ricarica"],
    steps: [["Prova caricabatterie", "Testiamo il tuo caricabatterie e uno nostro sicuramente funzionante."], ["Controllo connettore", "Verifichiamo connettore e cavo interno."], ["Riparazione mirata", "Sostituiamo solo il componente guasto."], ["Test di carica", "Verifichiamo carica, spia e riconoscimento della batteria."]],
    includes: ["Diagnosi gratuita", "Ricambio del componente guasto", "Test di carica completo", "Garanzia sull'intervento"],
    time: "1-3 giorni.",
    faq: [["Posso comprare un caricabatterie qualsiasi?", "Meglio di no: potenza e connettore devono essere quelli giusti. Ti consigliamo quello compatibile."]],
  },
  cerniere: {
    slug: "cerniere", name: "Cerniere e scocca", short: "Cerniere rotte, scocca aperta.", icon: "hinge", photo: "notebook-windows",
    intro: "Quando le cerniere si allentano o si rompono, a ogni apertura si rischia di danneggiare schermo e cavo video. Ripariamo cerniere e supporti prima che il danno si allarghi.",
    symptoms: ["Lo schermo non sta su", "La scocca si apre vicino alle cerniere", "Rumore o scricchiolio aprendo il coperchio", "Coperchio storto"],
    causes: ["Supporti delle viti rotti nella scocca", "Cerniere indurite con il tempo", "Cadute o aperture brusche"],
    steps: [["Valutazione", "Controlliamo cerniere, supporti e cavo video."], ["Ricambio", "Ordiniamo cerniere o scocca del tuo modello se servono."], ["Riparazione", "Ricostruiamo i supporti o sostituiamo le parti rotte."], ["Test", "Verifichiamo apertura, chiusura e schermo."]],
    includes: ["Cerniere o parti di scocca", "Controllo del cavo video", "Test di apertura e chiusura", "Garanzia sull'intervento"],
    time: "2-5 giorni in base al ricambio.",
    faq: [["Posso continuare a usarlo così?", "Meglio limitare le aperture: la cerniera rotta può tirare il cavo video e rompere lo schermo."]],
  },
  surriscaldamento: {
    slug: "surriscaldamento", name: "Surriscaldamento e ventola", short: "Pulizia interna e pasta termica.", icon: "thermo", photo: "socket-cpu",
    intro: "Ventola sempre al massimo, computer che scotta o si spegne da solo quando lavora: quasi sempre è polvere e pasta termica secca. Apriamo il computer, lo puliamo a fondo e riportiamo temperature e rumore alla normalità.",
    symptoms: ["Ventola rumorosa", "Si spegne quando lavora", "Scotta sotto o sulla tastiera", "Rallenta dopo pochi minuti di uso"],
    causes: ["Polvere nel dissipatore e nelle ventole", "Pasta termica secca", "Ventola usurata", "Prese d'aria coperte"],
    steps: [["Misura temperature", "Controlliamo le temperature a riposo e sotto sforzo."], ["Pulizia interna", "Apriamo e puliamo dissipatore, ventole e prese d'aria."], ["Pasta termica", "Sostituiamo la pasta termica del processore e, se serve, della scheda video."], ["Test sotto sforzo", "Verifichiamo che temperature e rumore siano tornati normali."]],
    includes: ["Pulizia interna completa", "Pasta termica nuova", "Verifica ventola", "Test sotto sforzo"],
    time: "In giornata nella maggior parte dei casi.",
    faq: [["Ogni quanto va pulito?", "Per notebook e PC usati ogni giorno consigliamo una pulizia ogni 1-2 anni."]],
  },
  upgrade: {
    slug: "upgrade-ssd-ram", name: "Upgrade SSD e RAM", short: "Più veloce con poca spesa.", icon: "drive", photo: "processore",
    intro: "Il modo più economico per ridare vita a un computer: un SSD al posto del vecchio disco e più memoria RAM. Verifichiamo cosa si può potenziare sul tuo modello, montiamo i componenti e copiamo tutto il sistema, così riaccendi e ritrovi tutto come prima.",
    symptoms: ["Disco meccanico (HDD) lento", "Memoria piena con poche schede aperte", "Spazio su disco esaurito", "Avvio molto lento"],
    causes: ["Disco meccanico ormai superato", "RAM insufficiente per i programmi di oggi", "Disco troppo piccolo"],
    steps: [["Verifica compatibilità", "Controlliamo slot, tipo di memoria e disco supportati dal tuo modello."], ["Proposta", "Ti proponiamo SSD e RAM adatti con il prezzo."], ["Montaggio e copia", "Montiamo i componenti e copiamo sistema, programmi e file."], ["Test", "Verifichiamo velocità e stabilità."]],
    includes: ["SSD e/o RAM compatibili", "Copia completa di sistema e file", "Test di velocità", "Garanzia sui componenti"],
    time: "In giornata con ricambio disponibile.",
    faq: [["Il mio computer si può potenziare?", "Dipende dal modello: alcuni notebook hanno memoria saldata. Lo verifichiamo gratis prima di proporti l'intervento."]],
  },
  virus: {
    slug: "virus", name: "Rimozione virus", short: "Pulizia completa e protezione.", icon: "bug", photo: "mani-riparazione",
    intro: "Pubblicità che si aprono da sole, browser cambiato, file bloccati: il computer è infetto. Rimuoviamo virus e programmi indesiderati, mettiamo in sicurezza account e browser e installiamo una protezione adatta.",
    symptoms: ["Pubblicità e finestre che si aprono da sole", "Pagina iniziale del browser cambiata", "File bloccati o richieste di riscatto", "Antivirus disattivato", "Computer improvvisamente lento"],
    causes: ["Programmi scaricati da siti non affidabili", "Allegati email falsi", "Sistema non aggiornato", "Estensioni del browser indesiderate"],
    steps: [["Analisi", "Scansioniamo sistema e browser con più strumenti."], ["Rimozione", "Eliminiamo virus, programmi ed estensioni indesiderate."], ["Messa in sicurezza", "Aggiorniamo il sistema e ti consigliamo quali password cambiare."], ["Protezione", "Installiamo una protezione adatta e ti spieghiamo come evitare nuove infezioni."]],
    includes: ["Scansione completa", "Rimozione virus e programmi indesiderati", "Aggiornamento del sistema", "Protezione consigliata"],
    time: "In giornata nella maggior parte dei casi.",
    faq: [["Ho pagato un riscatto o dato i dati della carta: cosa faccio?", "Blocca subito la carta con la tua banca e porta il computer senza usarlo: valutiamo cosa si può recuperare."]],
  },
  dati: {
    slug: "recupero-dati", name: "Recupero dati", short: "Foto, documenti, gestionale: li recuperiamo.", icon: "database", photo: "hard-disk",
    intro: "Foto di famiglia, documenti di lavoro, l'archivio del gestionale: perdere i dati fa paura. Recuperiamo i file da dischi, SSD, chiavette e hard disk esterni, anche da computer che non si accendono, e ti diciamo prima cosa è recuperabile.",
    symptoms: ["Disco non riconosciuto", "File cancellati per errore", "Computer che non parte più", "Chiavetta o hard disk esterno danneggiato", "Disco che fa rumori strani"],
    causes: ["Guasto del computer", "Cancellazione accidentale", "Disco danneggiato da cadute", "Virus o formattazione"],
    steps: [["Valutazione", "Analizziamo il supporto senza scriverci sopra."], ["Preventivo", "Ti diciamo cosa è recuperabile e quanto costa prima di procedere."], ["Recupero", "Copiamo i dati su un supporto sicuro."], ["Consegna", "Ti consegniamo i file e ti consigliamo un backup per il futuro."]],
    includes: ["Valutazione del supporto", "Recupero su disco nuovo o chiavetta", "Controllo dei file recuperati", "Consiglio per il backup"],
    time: "Da qualche ora a pochi giorni, in base al supporto.",
    faq: [["Ho cancellato dei file: cosa non devo fare?", "Smetti di usare quel disco o quella chiavetta: ogni nuovo file può sovrascrivere quelli da recuperare."], ["Il disco fa rumore: lo accendo per provare?", "No, spegnilo: ogni accensione può peggiorare il danno."]],
  },
  formattazione: {
    slug: "reinstallazione-windows", name: "Reinstallazione Windows", short: "Sistema pulito, dati salvati.", icon: "windows", photo: "lavoro-notebook",
    intro: "Errori continui, aggiornamenti che falliscono, schermata blu: a volte la soluzione migliore è ripartire da un sistema pulito. Salviamo i tuoi dati, reinstalliamo Windows con driver e aggiornamenti e ti riconsegniamo il computer pronto all'uso.",
    symptoms: ["Errori continui all'avvio", "Aggiornamenti che falliscono", "Schermata blu", "Computer usato da rimettere a nuovo"],
    causes: ["Sistema danneggiato da aggiornamenti o virus", "Anni di programmi installati e disinstallati", "Disco con errori"],
    steps: [["Salvataggio dati", "Copiamo documenti, foto, posta e preferiti."], ["Installazione", "Installiamo Windows con tutti i driver e gli aggiornamenti."], ["Ripristino", "Rimettiamo i tuoi file e i programmi principali."], ["Controllo", "Verifichiamo che tutto funzioni prima di riconsegnarlo."]],
    includes: ["Backup dei dati", "Windows aggiornato con driver", "Ripristino dei file", "Programmi principali"],
    time: "In giornata o il giorno dopo.",
    faq: [["Serve una nuova licenza di Windows?", "Di solito no: la licenza è legata al computer. Te lo confermiamo prima."]],
  },
  alimentatore: {
    slug: "alimentatore", name: "Alimentatore", short: "PC che si spegne o non parte.", icon: "bolt", photo: "pc-gaming",
    intro: "Se il PC non dà segni di vita o si spegne quando lavora, l'alimentatore è il primo sospettato. Lo testiamo e lo sostituiamo con uno di qualità e potenza adatta ai tuoi componenti.",
    symptoms: ["Nessun segno di vita", "Si spegne sotto sforzo", "Odore di bruciato o fischi", "Riavvii improvvisi"],
    causes: ["Alimentatore vecchio o economico", "Potenza insufficiente dopo un upgrade", "Sbalzi di tensione"],
    steps: [["Test", "Misuriamo l'alimentatore con strumenti dedicati."], ["Scelta", "Calcoliamo la potenza giusta per i tuoi componenti."], ["Sostituzione", "Montiamo il nuovo alimentatore con cavi ordinati."], ["Prova", "Testiamo il PC sotto sforzo."]],
    includes: ["Alimentatore di qualità", "Cablaggio ordinato", "Test sotto sforzo", "Garanzia sul componente"],
    time: "In giornata con ricambio disponibile.",
    faq: [["Un alimentatore guasto può rompere altro?", "Sì, per questo consigliamo modelli di qualità: proteggono anche gli altri componenti."]],
  },
  video: {
    slug: "scheda-video", name: "Scheda video", short: "Artefatti, schermo nero, giochi che crashano.", icon: "gpu", photo: "schede-video",
    intro: "Quadratini colorati, nessun segnale o giochi che si chiudono: verifichiamo scheda video, driver e alimentazione. Se va sostituita, ti proponiamo modelli compatibili con il tuo PC e il tuo budget.",
    symptoms: ["Quadratini o colori strani a schermo", "Nessun segnale video", "Crash nei giochi o nei programmi 3D", "Ventole della scheda rumorose"],
    causes: ["Driver danneggiati", "Surriscaldamento", "Alimentazione insufficiente", "Guasto della scheda"],
    steps: [["Diagnosi", "Testiamo scheda, driver e alimentazione."], ["Soluzione", "Puliamo e sistemiamo, oppure ti proponiamo una scheda nuova."], ["Montaggio", "Installiamo scheda e driver aggiornati."], ["Test 3D", "Verifichiamo stabilità e temperature sotto carico."]],
    includes: ["Diagnosi gratuita", "Pulizia o sostituzione", "Driver aggiornati", "Test sotto carico"],
    time: "1-3 giorni.",
    faq: [["Mi aiutate a scegliere una scheda nuova?", "Sì, in base ai giochi o ai programmi che usi e al tuo alimentatore."]],
  },
  liquidi: {
    slug: "liquidi", name: "Liquidi versati", short: "Spegni e portalo subito.", icon: "droplet", photo: "macbook-luce",
    intro: "Acqua, caffè o bibite sulla tastiera: ogni ora conta. Apriamo il computer, puliamo la scheda dall'ossidazione e verifichiamo i componenti. Non accenderlo e non asciugarlo con il phon: portalo spento il prima possibile.",
    symptoms: ["Liquido sulla tastiera", "Si è spento dopo il versamento", "Tasti appiccicosi", "Funziona a intermittenza"],
    causes: ["Liquidi versati sulla tastiera", "Umidità o condensa"],
    steps: [["Apertura immediata", "Scolleghiamo la batteria per evitare cortocircuiti."], ["Pulizia", "Puliamo la scheda dall'ossidazione con prodotti specifici."], ["Verifica", "Controlliamo quali componenti sono stati danneggiati."], ["Preventivo", "Ti diciamo cosa va sostituito e quanto costa."]],
    includes: ["Apertura e pulizia", "Verifica dei componenti", "Preventivo chiaro", "Salvataggio dati se possibile"],
    time: "Valutazione in 24-48 ore.",
    faq: [["Lo metto nel riso?", "No: il riso non toglie l'ossidazione. Portalo spento in negozio."]],
  },
} satisfies Record<string, Problem>;

export type Service = {
  slug: "riparazione-notebook" | "riparazione-pc" | "riparazione-mac";
  name: string;
  device: string;
  icon: string;
  photo: string;
  lede: string;
  problems: Problem[];
  brands?: { slug: string; name: string; lines: string }[];
};

export const services: Service[] = [
  {
    slug: "riparazione-notebook", name: "Riparazione notebook", device: "notebook", icon: "laptop", photo: "notebook-windows",
    lede: "Portatili Windows di tutte le marche: schermo, batteria, tastiera, cerniere, lentezza, virus e recupero dati. Diagnosi gratuita e prezzo prima di riparare.",
    problems: [P.batteria, P.schermo, P.tastiera, P.lento, P.accensione, P.ricarica, P.cerniere, P.surriscaldamento, P.upgrade, P.virus, P.dati, P.formattazione],
    brands: [
      { slug: "hp", name: "HP", lines: "Pavilion, EliteBook, ProBook, Victus, Omen" },
      { slug: "lenovo", name: "Lenovo", lines: "IdeaPad, ThinkPad, ThinkBook, Legion, Yoga" },
      { slug: "dell", name: "Dell", lines: "Inspiron, Latitude, Vostro, XPS" },
      { slug: "asus", name: "Asus", lines: "VivoBook, ZenBook, ExpertBook, ROG, TUF" },
      { slug: "acer", name: "Acer", lines: "Aspire, Swift, TravelMate, Nitro, Predator" },
      { slug: "msi", name: "MSI", lines: "Modern, Prestige, Katana e serie gaming" },
    ],
  },
  {
    slug: "riparazione-pc", name: "Riparazione PC fisso", device: "PC fisso", icon: "desktop", photo: "pc-rgb",
    lede: "PC desktop, assemblati e da gaming: accensione, alimentatore, scheda video, lentezza, virus, upgrade e recupero dati. Diagnosi gratuita.",
    problems: [P.accensione, P.lento, P.alimentatore, P.video, P.surriscaldamento, P.upgrade, P.virus, P.dati, P.formattazione],
  },
  {
    slug: "riparazione-mac", name: "Riparazione Mac", device: "MacBook", icon: "mac", photo: "macbook",
    lede: "MacBook Air e MacBook Pro: batteria, schermo, tastiera, liquidi e recupero dati, con prezzi chiari per modello. Centro indipendente, non affiliato Apple.",
    problems: [P.batteria, P.schermo, P.tastiera, P.liquidi, P.accensione, P.lento, P.dati],
  },
];
export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug)!;

export function macPriceRange(kind: "batteria" | "schermo") {
  const prices = macModels.flatMap((m) => m.repairs.filter((r) => r.kind === kind).map((r) => r.price));
  if (!prices.length) return null;
  return { min: Math.min(...prices), max: Math.max(...prices), count: prices.length };
}
export const euro = (n: number) => `${n.toLocaleString("it-IT", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })} €`;

/** Nome della riparazione completo per il titolo: "Sostituzione batteria notebook". */
export const repairTitle = (p: Problem, s: Service) => {
  const dev = s.slug === "riparazione-mac" ? "MacBook" : s.slug === "riparazione-pc" ? "PC fisso" : "notebook";
  return `${p.name} ${dev}`;
};

// ---------- Vendita ----------
export type SaleCategory = { slug: string; name: string; h1: string; icon: string; photo: string; lede: string; points: string[]; for: string };
export const saleCategories: SaleCategory[] = [
  { slug: "pc-su-misura", name: "PC su misura", h1: "PC su misura, assemblati da noi", icon: "cpu", photo: "processore",
    lede: "Ci dici cosa ci devi fare e quanto vuoi spendere: scegliamo i componenti, lo assembliamo, lo configuriamo e lo testiamo prima di consegnartelo.",
    points: ["Componenti scelti per il tuo uso, niente di superfluo", "Windows, driver e programmi principali già installati", "Copia dei dati dal vecchio computer", "Assistenza in negozio dopo l'acquisto"], for: "Casa, ufficio, studio professionale" },
  { slug: "notebook", name: "Notebook", h1: "Notebook per lavoro, studio e casa", icon: "laptop", photo: "scrivania-notebook",
    lede: "Ti aiutiamo a scegliere il portatile giusto tra le principali marche e te lo consegniamo pronto all'uso, con i tuoi dati già trasferiti.",
    points: ["Consiglio onesto in base all'uso reale", "Configurazione iniziale inclusa su richiesta", "Trasferimento dati dal vecchio computer", "Fattura per partite IVA"], for: "Studenti, professionisti, famiglie" },
  { slug: "pc-gaming", name: "PC gaming", h1: "PC gaming pronti o su misura", icon: "gamepad", photo: "pc-gaming",
    lede: "Configurazioni bilanciate tra processore, scheda video e alimentazione, montate con cura e testate sotto sforzo prima della consegna.",
    points: ["Configurazione sul budget e sui giochi che usi", "Test di stabilità e temperature", "Upgrade futuri pensati da subito", "Assistenza in negozio"], for: "Gaming, streaming, creazione contenuti" },
  { slug: "workstation", name: "Workstation", h1: "Workstation per CAD, grafica e video", icon: "desktop", photo: "workstation",
    lede: "Computer per lavori pesanti: progettazione, rendering, montaggio video. Componenti scelti sui programmi che usi davvero.",
    points: ["Dimensionate su AutoCAD, Revit, Adobe, DaVinci e simili", "Affidabilità per lavorare tutto il giorno", "Backup e protezione dei dati", "Fattura e assistenza dedicata"], for: "Studi tecnici, architetti, grafici, videomaker" },
  { slug: "ricondizionati", name: "PC ricondizionati", h1: "Notebook e PC ricondizionati garantiti", icon: "recycle", photo: "notebook-caffe",
    lede: "Computer aziendali di qualità controllati dai nostri tecnici, con SSD e sistema pronti: costano meno del nuovo e durano.",
    points: ["Controllati e testati dai nostri tecnici", "Garanzia diretta in negozio", "Pronti all'uso con Windows installato", "Ideali per studio e ufficio"], for: "Chi vuole spendere meno senza rischi" },
];

// ---------- Partite IVA ----------
export const pivaPoints = [
  { t: "Postazioni in fattura", p: "Notebook, PC e monitor scelti per il tuo lavoro, configurati e consegnati pronti.", icon: "receipt" },
  { t: "Riparazioni con priorità", p: "Il computer di lavoro non può restare fermo: ti diciamo subito tempi e alternative.", icon: "bolt" },
  { t: "Backup e NAS", p: "I dati dello studio al sicuro con backup automatici e NAS installati e controllati da noi.", icon: "database" },
  { t: "Rete e Wi-Fi", p: "Rete dell'ufficio, Wi-Fi e stampanti che funzionano davvero.", icon: "wifi" },
  { t: "Email, Microsoft 365, PEC", p: "Caselle, domini e licenze impostati bene fin dall'inizio.", icon: "mail" },
  { t: "Assistenza remota", p: "Per i piccoli problemi interveniamo da remoto, senza farti venire in negozio.", icon: "remote" },
];

export const promises: { icon: string; t: string; p: string }[] = [
  { icon: "search", t: "Diagnosi gratuita", p: "Capire il guasto non costa nulla." },
  { icon: "euro", t: "Prezzo prima", p: "Sai quanto spendi prima che tocchiamo il computer." },
  { icon: "shield", t: "Garanzia fino a 12 mesi", p: "Sull'intervento, valida in tutti i negozi." },
  { icon: "clock", t: "Spesso in giornata", p: "Pulizia, SSD, sistema e molti ricambi." },
];
