import { SITE, shops, telLink, mapsLink, type Shop } from "../data/site";

const DAYS: Record<string, string[]> = {
  lun: ["Monday"], mar: ["Tuesday"], mer: ["Wednesday"], gio: ["Thursday"], ven: ["Friday"], sab: ["Saturday"], dom: ["Sunday"],
};
const ORDER = ["lun", "mar", "mer", "gio", "ven", "sab", "dom"];

/** Converte "Lun-Ven: 09.00-13.00 / 15.00-19.00\nSab: 09.00-13.00" in openingHoursSpecification. */
export function openingHours(hours: string | null) {
  if (!hours) return undefined;
  const specs: object[] = [];
  for (const line of hours.split("\n")) {
    const m = line.match(/^\s*([A-Za-zì]{3})(?:\s*-\s*([A-Za-zì]{3}))?\s*:\s*(.+)$/);
    if (!m) continue;
    const from = ORDER.indexOf(m[1].toLowerCase());
    const to = m[2] ? ORDER.indexOf(m[2].toLowerCase()) : from;
    if (from < 0 || to < 0 || /chius/i.test(m[3])) continue;
    const days = ORDER.slice(from, to + 1).flatMap((d) => DAYS[d]);
    for (const slot of m[3].split("/")) {
      const t = slot.trim().match(/(\d{1,2})[.:](\d{2})\s*-\s*(\d{1,2})[.:](\d{2})/);
      if (t) specs.push({ "@type": "OpeningHoursSpecification", dayOfWeek: days, opens: `${t[1].padStart(2, "0")}:${t[2]}`, closes: `${t[3].padStart(2, "0")}:${t[4]}` });
    }
  }
  return specs.length ? specs : undefined;
}

export function storeSchema(shop: Shop, withRating = false) {
  return {
    "@context": "https://schema.org",
    "@type": "ComputerStore",
    "@id": `${SITE}/${shop.slug}/#store`,
    name: `G8A Store ${shop.city}`,
    url: `${SITE}/${shop.slug}/`,
    image: shop.photo || `${SITE}/g8a-logo.png`,
    telephone: telLink(shop).replace("tel:", ""),
    email: shop.email,
    priceRange: "€€",
    hasMap: mapsLink(shop),
    address: {
      "@type": "PostalAddress",
      streetAddress: shop.address,
      postalCode: shop.zip,
      addressLocality: shop.city,
      addressRegion: shop.province,
      addressCountry: "IT",
    },
    openingHoursSpecification: openingHours(shop.hours),
    parentOrganization: { "@type": "Organization", name: "G8A Technology S.r.l.", url: "https://www.g8a.it/" },
    // Scheda Google del negozio (solo se il place id G8A Store è noto in Brain): collega sito e recensioni.
    ...(shop.placeId ? { sameAs: [`https://www.google.com/maps/place/?q=place_id:${shop.placeId}`] } : {}),
    ...(withRating && shop.rating && shop.reviews
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: shop.rating, reviewCount: shop.reviews, bestRating: 5 } }
      : {}),
  };
}

/** Servizio di un negozio (pagine città) o di tutta la rete (pagine generali: tutti e 5 i negozi). */
export function serviceSchema(name: string, description: string, shop: Shop | null | undefined, url: string, offers?: { name: string; price: number }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: new URL(url, SITE).toString(),
    areaServed: shop ? { "@type": "City", name: shop.city } : shops.map((s) => ({ "@type": "City", name: s.city })),
    provider: shop ? { "@id": `${SITE}/${shop.slug}/#store` } : shops.map((s) => ({ "@id": `${SITE}/${s.slug}/#store` })),
    ...(offers?.length
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name,
            itemListElement: offers.map((o) => ({ "@type": "Offer", name: o.name, price: o.price, priceCurrency: "EUR" })),
          },
        }
      : {}),
  };
}

export function faqSchema(faq: [string, string][]) {
  if (!faq.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}

/** Articoli di stampa (subjectOf dell'Organization): stessi dati del blocco "Comparsi su". */
import { PRESS } from "../data/press";
export function pressSchema() {
  return PRESS.map((p) => ({ "@type": "NewsArticle", headline: p.titolo, url: p.url, datePublished: p.data, publisher: { "@type": "Organization", name: p.testata } }));
}
