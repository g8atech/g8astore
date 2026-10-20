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
export const mapsLink = (shop: Shop) =>
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
  name: string; // "Sostituzione schermo"
  short: string; // riga breve per le card
  symptoms: string[];
  what: string; // cosa facciamo
  time: string; // tempi indicativi
  faq: [string, string][];
  macKind?: "batteria" | "schermo"; // per collegare i prezzi Mac di Brain
};

export type Service = {
  slug: "riparazione-notebook" | "riparazione-pc" | "riparazione-mac";
  name: string; // "Riparazione notebook"
  device: string; // "notebook"
  lede: string;
  problems: Problem[];
  brands?: { slug: string; name: string; lines: string }[];
};

const P = {
  lento: {
    slug: "pc-lento",
    name: "Computer lento",
    short: "Torna veloce, spesso senza cambiare computer.",
    symptoms: ["Ci mette minuti ad accendersi", "Programmi che si bloccano", "Ventola sempre al massimo", "Disco al 100% in Gestione attività"],
    what: "Controlliamo disco, memoria, temperature e programmi in avvio. Nella maggior parte dei casi un SSD al posto del disco meccanico e una pulizia del sistema bastano a renderlo più veloce di quando era nuovo.",
    time: "In giornata per pulizia e upgrade SSD con ricambio disponibile.",
    faq: [
      ["Conviene sistemarlo o cambiarlo?", "Te lo diciamo dopo la diagnosi gratuita. Se l'intervento costa troppo rispetto al valore del computer, te lo diciamo e ti mostriamo le alternative."],
      ["Perdo i miei file?", "No: copiamo i dati prima di qualsiasi intervento sul disco."],
    ],
  },
  accensione: {
    slug: "non-si-accende",
    name: "Non si accende",
    short: "Diagnosi completa: alimentazione, scheda madre, disco.",
    symptoms: ["Nessuna luce premendo il tasto", "Si accende ma lo schermo resta nero", "Si spegne da solo dopo pochi secondi", "Bip o lampeggi all'avvio"],
    what: "Verifichiamo alimentatore o caricabatterie, batteria, memoria e scheda madre fino a trovare il componente guasto. Ti diamo il prezzo esatto prima di riparare.",
    time: "Diagnosi in 24–48 ore; riparazione in base al ricambio.",
    faq: [
      ["La diagnosi si paga?", "No, la diagnosi è gratuita. Se decidi di non riparare non paghi nulla."],
      ["Riuscite a salvare i dati anche se non si accende?", "Quasi sempre sì: il disco di solito è integro e i dati si recuperano."],
    ],
  },
  virus: {
    slug: "virus",
    name: "Rimozione virus",
    short: "Pulizia completa e protezione.",
    symptoms: ["Pubblicità e finestre che si aprono da sole", "Pagina iniziale del browser cambiata", "Richieste di riscatto o file bloccati", "Antivirus disattivato"],
    what: "Rimuoviamo virus e programmi indesiderati, controlliamo account e browser, aggiorniamo il sistema e installiamo una protezione adatta. Se serve reinstalliamo Windows conservando i dati.",
    time: "In giornata nella maggior parte dei casi.",
    faq: [
      ["Ho pagato un riscatto o dato dati della carta: cosa faccio?", "Blocca subito la carta con la tua banca e porta il computer in negozio senza usarlo: valutiamo cosa si può recuperare."],
    ],
  },
  dati: {
    slug: "recupero-dati",
    name: "Recupero dati",
    short: "Foto, documenti, gestionale: li recuperiamo.",
    symptoms: ["Disco non riconosciuto", "File cancellati per errore", "Computer che non parte più", "Chiavetta o hard disk esterno danneggiato"],
    what: "Copiamo i dati da dischi, SSD, chiavette e hard disk esterni anche da computer che non si accendono. Ti diciamo prima cosa è recuperabile.",
    time: "Da qualche ora a pochi giorni, in base al supporto.",
    faq: [
      ["Ho cancellato dei file: cosa non devo fare?", "Smetti di usare quel disco o quella chiavetta: ogni nuovo file può sovrascrivere quelli da recuperare."],
    ],
  },
  upgrade: {
    slug: "upgrade-ssd-ram",
    name: "Upgrade SSD e RAM",
    short: "Più veloce con poca spesa.",
    symptoms: ["Disco meccanico (HDD) lento", "Memoria piena con poche schede aperte", "Spazio su disco esaurito"],
    what: "Montiamo SSD e RAM compatibili con il tuo modello e copiamo tutto il sistema sul nuovo disco: riaccendi e ritrovi file e programmi come prima.",
    time: "In giornata con ricambio disponibile.",
    faq: [["Il mio computer si può potenziare?", "Dipende dal modello: alcuni notebook hanno memoria saldata. Lo verifichiamo gratis prima di proporti l'intervento."]],
  },
  formattazione: {
    slug: "reinstallazione-windows",
    name: "Reinstallazione Windows",
    short: "Sistema pulito, dati salvati.",
    symptoms: ["Errori continui all'avvio", "Aggiornamenti che falliscono", "Schermata blu", "Computer usato da rimettere a nuovo"],
    what: "Salviamo i tuoi dati, reinstalliamo Windows con driver e aggiornamenti e rimettiamo i programmi principali. Ti riconsegniamo il computer pronto all'uso.",
    time: "In giornata o il giorno dopo.",
    faq: [["Serve una nuova licenza di Windows?", "Di solito no: la licenza è legata al computer. Te lo confermiamo prima."]],
  },
  surriscaldamento: {
    slug: "surriscaldamento",
    name: "Surriscaldamento e ventola",
    short: "Pulizia interna e pasta termica.",
    symptoms: ["Ventola rumorosa", "Si spegne quando lavora", "Scotta sotto o sulla tastiera"],
    what: "Apriamo il computer, puliamo dissipatore e ventole, sostituiamo la pasta termica e, se serve, la ventola. Temperature e rumore tornano normali.",
    time: "In giornata nella maggior parte dei casi.",
    faq: [],
  },
  schermo: {
    slug: "schermo",
    name: "Sostituzione schermo",
    short: "Display rotto, righe o macchie.",
    symptoms: ["Vetro o display rotto", "Righe colorate o macchie", "Schermo nero con computer acceso", "Retroilluminazione che sfarfalla"],
    what: "Individuiamo il pannello esatto del tuo modello, lo ordiniamo e lo sostituiamo. Ti diamo prezzo e tempi prima di procedere.",
    time: "Da 1 a 5 giorni lavorativi, in base alla disponibilità del pannello.",
    faq: [["Le righe sono sempre colpa dello schermo?", "Non sempre: a volte è il cavo video o la scheda. Lo verifichiamo in diagnosi, gratis."]],
    macKind: "schermo",
  },
  batteria: {
    slug: "batteria",
    name: "Sostituzione batteria",
    short: "Torna a durare.",
    symptoms: ["Si scarica in poco tempo", "Funziona solo attaccato alla corrente", "Batteria gonfia (touchpad sollevato)", "Percentuale che salta"],
    what: "Sostituiamo la batteria con un ricambio compatibile e testiamo la ricarica. Una batteria gonfia va cambiata subito: non usare il computer finché non la controlliamo.",
    time: "In giornata con ricambio disponibile, altrimenti 2–4 giorni.",
    faq: [],
    macKind: "batteria",
  },
  tastiera: {
    slug: "tastiera",
    name: "Tastiera e touchpad",
    short: "Tasti che non vanno, liquidi versati.",
    symptoms: ["Tasti che non scrivono o scrivono da soli", "Liquido versato sulla tastiera", "Touchpad che non risponde"],
    what: "Puliamo o sostituiamo la tastiera e il touchpad. Se è entrato del liquido, portalo subito spento: prima interveniamo, più è probabile salvare la scheda madre.",
    time: "1–4 giorni in base al ricambio.",
    faq: [],
  },
  cerniere: {
    slug: "cerniere",
    name: "Cerniere e scocca",
    short: "Cerniere rotte, scocca aperta.",
    symptoms: ["Lo schermo non sta su", "Scocca che si apre vicino alle cerniere", "Rumore aprendo il coperchio"],
    what: "Ripariamo o sostituiamo cerniere e supporti prima che il danno arrivi a schermo e cavo video.",
    time: "2–5 giorni in base al ricambio.",
    faq: [],
  },
  ricarica: {
    slug: "non-carica",
    name: "Non carica",
    short: "Connettore, caricabatterie o scheda.",
    symptoms: ["La spia di ricarica non si accende", "Carica solo muovendo il cavo", "Connettore allentato"],
    what: "Verifichiamo caricabatterie, connettore di alimentazione e circuito di ricarica e sostituiamo solo il pezzo guasto.",
    time: "1–3 giorni.",
    faq: [],
  },
  alimentatore: {
    slug: "alimentatore",
    name: "Alimentatore",
    short: "PC che si spegne o non parte.",
    symptoms: ["Nessun segno di vita", "Si spegne sotto sforzo", "Odore di bruciato o fischi"],
    what: "Testiamo l'alimentatore e lo sostituiamo con uno di qualità e potenza adatta ai componenti del tuo PC.",
    time: "In giornata con ricambio disponibile.",
    faq: [],
  },
  video: {
    slug: "scheda-video",
    name: "Scheda video",
    short: "Artefatti, schermo nero, giochi che crashano.",
    symptoms: ["Quadratini o colori strani a schermo", "Nessun segnale video", "Crash nei giochi o nei programmi 3D"],
    what: "Verifichiamo scheda video, driver e alimentazione. Se va sostituita ti proponiamo modelli compatibili con il tuo PC e il tuo budget.",
    time: "1–3 giorni.",
    faq: [],
  },
  liquidi: {
    slug: "liquidi",
    name: "Liquidi versati",
    short: "Spegni e portalo subito.",
    symptoms: ["Acqua, caffè o bibite sulla tastiera", "Si è spento dopo il versamento", "Tasti appiccicosi"],
    what: "Apriamo il computer, puliamo la scheda madre dall'ossidazione e verifichiamo i componenti. Non accenderlo e non asciugarlo con il phon: portalo spento il prima possibile.",
    time: "Valutazione in 24–48 ore.",
    faq: [],
  },
} satisfies Record<string, Problem>;

export const services: Service[] = [
  {
    slug: "riparazione-notebook",
    name: "Riparazione notebook",
    device: "notebook",
    lede: "Portatili Windows di tutte le marche: schermo, batteria, tastiera, cerniere, lentezza, virus e recupero dati. Diagnosi gratuita e prezzo prima di riparare.",
    problems: [P.schermo, P.batteria, P.tastiera, P.lento, P.accensione, P.ricarica, P.cerniere, P.surriscaldamento, P.upgrade, P.virus, P.dati, P.formattazione],
    brands: [
      { slug: "hp", name: "HP", lines: "Pavilion, EliteBook, ProBook, Victus, Omen" },
      { slug: "lenovo", name: "Lenovo", lines: "IdeaPad, ThinkPad, ThinkBook, Legion, Yoga" },
      { slug: "dell", name: "Dell", lines: "Inspiron, Latitude, Vostro, XPS" },
      { slug: "asus", name: "Asus", lines: "VivoBook, ZenBook, ExpertBook, ROG, TUF" },
      { slug: "acer", name: "Acer", lines: "Aspire, Swift, TravelMate, Nitro, Predator" },
      { slug: "msi", name: "MSI", lines: "Modern, Prestige, Katana, serie gaming" },
    ],
  },
  {
    slug: "riparazione-pc",
    name: "Riparazione PC fisso",
    device: "PC fisso",
    lede: "PC desktop, assemblati e da gaming: accensione, alimentatore, scheda video, lentezza, virus, upgrade e recupero dati. Diagnosi gratuita.",
    problems: [P.accensione, P.lento, P.alimentatore, P.video, P.surriscaldamento, P.upgrade, P.virus, P.dati, P.formattazione],
  },
  {
    slug: "riparazione-mac",
    name: "Riparazione Mac",
    device: "MacBook",
    lede: "MacBook Air e MacBook Pro: batteria, schermo, tastiera, liquidi e recupero dati, con prezzi chiari per modello. Centro indipendente, non affiliato Apple.",
    problems: [P.batteria, P.schermo, P.tastiera, P.liquidi, P.accensione, P.lento, P.dati],
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug)!;

/** Prezzo minimo e massimo Mac per tipo di intervento, presi dal listino di Brain. */
export function macPriceRange(kind: "batteria" | "schermo") {
  const prices = macModels.flatMap((m) => m.repairs.filter((r) => r.kind === kind).map((r) => r.price));
  if (!prices.length) return null;
  return { min: Math.min(...prices), max: Math.max(...prices), count: prices.length };
}
export const euro = (n: number) => `${n.toLocaleString("it-IT", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })} €`;

// ---------- Vendita ----------
export type SaleCategory = { slug: string; name: string; h1: string; lede: string; points: string[]; for: string };
export const saleCategories: SaleCategory[] = [
  {
    slug: "pc-su-misura",
    name: "PC su misura",
    h1: "PC su misura, assemblati da noi",
    lede: "Ci dici cosa ci devi fare e quanto vuoi spendere: scegliamo i componenti, lo assembliamo, lo configuriamo e lo testiamo prima di consegnartelo.",
    points: ["Componenti scelti per il tuo uso, niente di superfluo", "Windows, driver e programmi principali già installati", "Copia dei dati dal vecchio computer", "Assistenza in negozio dopo l'acquisto"],
    for: "Casa, ufficio, studio professionale",
  },
  {
    slug: "notebook",
    name: "Notebook",
    h1: "Notebook per lavoro, studio e casa",
    lede: "Ti aiutiamo a scegliere il portatile giusto tra le principali marche e te lo consegniamo pronto all'uso, con i tuoi dati già trasferiti.",
    points: ["Consiglio onesto in base all'uso reale", "Configurazione iniziale e account inclusi su richiesta", "Trasferimento dati dal vecchio computer", "Fattura per partite IVA"],
    for: "Studenti, professionisti, famiglie",
  },
  {
    slug: "pc-gaming",
    name: "PC gaming",
    h1: "PC gaming pronti o su misura",
    lede: "Configurazioni bilanciate tra processore, scheda video e alimentazione, montate con cura e testate sotto sforzo prima della consegna.",
    points: ["Configurazione sul budget e sui giochi che usi", "Test di stabilità e temperature", "Upgrade futuri pensati da subito", "Assistenza in negozio"],
    for: "Gaming, streaming, creazione contenuti",
  },
  {
    slug: "workstation",
    name: "Workstation",
    h1: "Workstation per CAD, grafica e video",
    lede: "Computer per lavori pesanti: progettazione, rendering, montaggio video. Componenti scelti sui programmi che usi davvero.",
    points: ["Dimensionate su AutoCAD, Revit, Adobe, DaVinci e simili", "Affidabilità per lavorare tutto il giorno", "Backup e protezione dei dati", "Fattura e assistenza dedicata"],
    for: "Studi tecnici, architetti, grafici, videomaker",
  },
  {
    slug: "ricondizionati",
    name: "PC ricondizionati",
    h1: "Notebook e PC ricondizionati garantiti",
    lede: "Computer aziendali di qualità controllati dai nostri tecnici, con SSD e sistema pronti: costano meno del nuovo e durano.",
    points: ["Controllati e testati dai nostri tecnici", "Garanzia diretta in negozio", "Pronti all'uso con Windows installato", "Ideali per studio e ufficio"],
    for: "Chi vuole spendere meno senza rischi",
  },
];

// ---------- Partite IVA ----------
export const pivaPoints = [
  { t: "Postazioni in fattura", p: "Notebook, PC e monitor scelti per il tuo lavoro, configurati e consegnati pronti." },
  { t: "Riparazioni con priorità", p: "Il tuo computer di lavoro non può restare fermo: ti diciamo subito tempi e alternative." },
  { t: "Backup e NAS", p: "I dati dello studio al sicuro: backup automatici e NAS installati e controllati da noi." },
  { t: "Rete e Wi-Fi", p: "Rete dell'ufficio, Wi-Fi e stampanti che funzionano davvero." },
  { t: "Email, Microsoft 365, PEC", p: "Caselle, domini e licenze impostati bene fin dall'inizio." },
  { t: "Assistenza remota", p: "Per i piccoli problemi interveniamo da remoto, senza farti venire in negozio." },
];

export const howItWorks: [string, string][] = [
  ["Scrivici o passa in negozio", "Su WhatsApp o al banco: raccontaci cosa succede o cosa ti serve."],
  ["Diagnosi e preventivo", "Diagnosi gratuita e prezzo esatto prima di iniziare. Se non procedi, non paghi."],
  ["Ritiri pronto", "Molti interventi si chiudono in giornata. Ritiri il computer testato, con garanzia."],
];

export const promises: [string, string][] = [
  ["Diagnosi gratuita", "Senza impegno."],
  ["Preventivo prima", "Prezzo esatto prima di toccare il computer."],
  ["Se non procedi, zero", "Decidi tu, nessun costo nascosto."],
  ["Garanzia fino a 12 mesi", "Sull'intervento, valida in tutti i negozi."],
];
