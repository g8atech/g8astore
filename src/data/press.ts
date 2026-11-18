// Uscite stampa mostrate su g8astore.it ("Comparsi su"): articoli su G8A e sul noleggio assistito.
// Stesse uscite e stessi loghi di riparohero.it (parts-plan/api/_lib/rhPress.ts). Loghi in public/press.
export type Uscita = { testata: string; url: string; titolo: string; data: string; logo: string; h: number };

export const PRESS: Uscita[] = [
  {
    testata: "Fortune Italia",
    url: "https://www.fortuneita.com/2026/09/23/in-italia-le-piccole-e-medie-imprese-rappresentano-la-spina-dorsale-del-tessuto-produttivo-eppure-la-gestione-dellinfrastruttura-informatica-resta-uno-dei-punti-di-maggiore-fragilita-un-computer-c/",
    titolo: "Il “noleggio assistito” spiegato da Antonio e Giuseppe Arrigo",
    data: "2026-09-23",
    logo: "/press/fortune-italia.png",
    h: 20,
  },
  {
    testata: "Economy",
    url: "https://www.economymagazine.it/noleggio-it-a-canone-fisso-il-modello-innovativo-per-le-pmi/",
    titolo: "Noleggio IT a canone fisso: il modello innovativo per le PMI",
    data: "2026-09-22",
    logo: "/press/economy.png",
    h: 24,
  },
];
