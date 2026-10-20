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
| `/negozi/`, `/negozi/:città/` | Sedi |
| `/riparazione-notebook/`, `/riparazione-pc/`, `/riparazione-mac/` | Servizi |
| `/:città/:servizio/` | Servizio nella città (anche `vendita-pc` e `partite-iva`) |
| `/:città/:servizio/:problema/` | Problema nella città (schermo, batteria, …) |
| `/:città/riparazione-notebook/:marca/` | Marca nella città |
| `/:città/riparazione-mac/:modello/` | Listino del modello MacBook |
| `/pc-su-misura/`, `/notebook/`, `/pc-gaming/`, `/workstation/`, `/ricondizionati/`, `/vendita-pc/`, `/partite-iva/` | Vendita e partite IVA |

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
