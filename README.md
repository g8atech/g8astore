# g8astore.it

Sito dei negozi g8astore: riparazione e vendita computer (notebook, PC fissi, Mac) per privati e partite IVA.
Telefoni e tablet restano su riparohero.it.

## Come funziona

- **Astro, sito statico**: ogni pagina arriva a Google già completa (niente rendering nel browser).
- **Dati da Brain**: prima di ogni build `scripts/fetch-brain.mjs` legge da Supabase, con la sola chiave pubblica,
  sedi (indirizzo, orari, telefono, foto), voti Google delle schede G8A STORE e listino riparazioni MacBook.
  Il risultato è salvato in `src/data/brain.json`: se Brain non risponde, la build usa l'ultima copia salvata.
- **Testi** (servizi, problemi, marche, vendita, partite IVA): `src/data/site.ts`.

## Struttura delle pagine

| URL | Contenuto |
|---|---|
| `/` | Home |
| `/negozi/` | Tutti i negozi |
| `/:città/` | Home della sede (es. `/gallarate/`) |
| `/riparazione-notebook/`, `/riparazione-pc/`, `/riparazione-mac/` | Servizi |
| `/riparazione-notebook/batteria/` | Pagina completa della riparazione (generale) |
| `/:città/:servizio/` | Servizio nella sede (anche `vendita-pc` e `partite-iva`) |
| `/:città/:servizio/:riparazione/` | Pagina completa della riparazione nella sede |
| `/:città/riparazione-notebook/:marca/` | Marca nella sede |
| `/:città/riparazione-mac/:modello/` | Listino del modello MacBook nella sede |
| `/pc-su-misura/`, `/notebook/`, `/pc-gaming/`, `/workstation/`, `/ricondizionati/`, `/vendita-pc/`, `/partite-iva/` | Vendita e partite IVA |

Testi delle riparazioni (sintomi, cause, passaggi, cosa è incluso, FAQ): `src/data/site.ts`.
Foto: `public/img/` (Unsplash, vedi `CREDITS.txt`), da sostituire nel tempo con foto vere dei negozi.

## Shop PC (`/configuratore/`)

- `/configuratore/`: vetrina con categorie e tutti i PC; `/configuratore/<categoria>/` (notebook, notebook-gaming, all-in-one, mini-pc);
  `/configuratore/<categoria>/<modello>/`: scheda prodotto con scelta di RAM e SSD e prezzo che si aggiorna.
- Filtri (disponibilità, prezzo, processore, schermo) e ordinamento funzionano nel browser, senza inviare dati.
- Dati in `src/data/configuratore.json`: **copia statica** dei dati pubblici del configuratore di Brain
  (nomi, prezzi al pubblico IVA inclusa, disponibile sì/no, foto, schede tecniche) presa il 22/10/2026 in sola lettura.
  Nessun prezzo d'acquisto, nessuna quantità, nessuna chiave. Foto in `public/img/pc/`.
- Il tipo di RAM (DDR4/DDR5) per modello è stato ricavato dalle descrizioni Bman: va confermato.
- Le richieste partono su WhatsApp verso il negozio scelto; nulla viene scritto in Brain.
- Per renderlo automatico: creare in Brain una vista pubblica di sola lettura con questi campi e leggerla in `scripts/fetch-brain.mjs`.

## Dove viene pubblicato: www.g8astore.it

Sito a parte rispetto a g8a.it (che resta B2B). Dominio principale **www.g8astore.it**, indirizzi con la barra finale (`/gallarate/`).

- `vercel.json`: `g8astore.it` va su `www.g8astore.it`; i vecchi sottodomini delle città (`gallarate.`, `busto-arsizio.`, `jerago.`, `lecco.`, `bollate.g8astore.it`, con e senza www) vanno con 301 alla pagina del negozio.
- Su `g8astore.vercel.app` ogni pagina ha `X-Robots-Tag: noindex`, così Google indicizza solo www.g8astore.it.
- I vecchi indirizzi negozio di g8a.it (`/store-<città>`, `/negozio`) li reindirizza il progetto g8ab2b.
- Un vecchio indirizzo senza regola finisce sulla pagina 404, che elenca negozi e servizi. Se in Search Console un vecchio URL ha clic, aggiungere una regola precisa in `vercel.json`.
- `scripts/mount-store.mjs` (montaggio dentro g8a.it/store) non si usa più: tolto dalla build.

## Vercel

- Framework: Astro (rilevato da solo). Build: `npm run build`. Output: `dist`.
- Variabile d'ambiente: `BRAIN_SUPABASE_ANON_KEY` = chiave anon/publishable del progetto Brain.
- Per aggiornare orari, voti e prezzi ogni giorno: creare un Deploy Hook su Vercel e chiamarlo una volta al giorno.

## Comandi

```
npm install
BRAIN_SUPABASE_ANON_KEY=... npm run build
npm run preview
```
