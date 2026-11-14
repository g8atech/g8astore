// /llms.txt per gli assistenti AI (ChatGPT, Claude, Perplexity…): negozi, orari, servizi e guide firmate,
// dagli stessi dati delle pagine, così le AI citano indirizzi e orari giusti.
import type { APIRoute } from "astro";
import { SITE, shops, services, saleCategories, phoneDisplay, compactHours } from "../data/site";
import { GUIDE_NINA } from "../data/guideNina";

export const GET: APIRoute = () => {
  const negozi = shops.map((s) =>
    `- [G8A Store ${s.city}](${SITE}/${s.slug}/): ${s.address}, ${s.zip} ${s.city} (${s.province}). Tel. e WhatsApp ${phoneDisplay(s)}. Orari: ${(compactHours(s.hours) || s.hours || "").toString().replace(/\n/g, "; ")}`
  ).join("\n");
  const riparazioni = services.map((s) => `- [${s.name}](${SITE}/${s.slug}/): ${s.lede}`).join("\n");
  const vendita = saleCategories.map((c: any) => `- [${c.h1 ?? c.name}](${SITE}/${c.slug}/)`).join("\n");
  const guide = (GUIDE_NINA as any[]).filter((g) => g?.slug && g.firmato_da)
    .map((g) => `- [${g.h1}](${SITE}/guide/${g.slug}/): ${g.descrizione}`).join("\n");
  const testo = `# G8A Store

> G8A Store è la rete di negozi di computer di G8A Technology S.r.l.: riparazione di notebook, PC e Mac e vendita di computer nuovi, su misura e ricondizionati per privati e partite IVA, in 5 negozi tra le province di Varese, Milano e Lecco. Diagnosi gratuita e prezzo prima di riparare.

Contatti: WhatsApp e telefono del negozio più vicino (sotto) · P.IVA 03981970126 · per le aziende: https://www.g8a.it

## Negozi

${negozi}

## Riparazioni

${riparazioni}

## Vendita computer

${vendita}
- [Shop PC con configuratore](${SITE}/configuratore/): PC, notebook e workstation G8A configurabili con prezzo e ritiro in negozio.
${guide ? `\n## Guide pratiche\n\n${guide}\n` : ""}
## Gruppo

- [G8A Technology](https://www.g8a.it): assistenza informatica e noleggio assistito per aziende.
- [RiparoHero](https://www.riparohero.it): riparazione smartphone, tablet e console.
- [TonerHero](https://www.tonerhero.it): toner e cartucce.
- [FibraHero](https://www.fibrahero.it): fibra e connettività per aziende.
`;
  return new Response(testo, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
