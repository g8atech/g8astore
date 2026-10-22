import { SITE, telLink, mapsLink, type Shop } from "../data/site";

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
    ...(withRating && shop.rating && shop.reviews
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: shop.rating, reviewCount: shop.reviews, bestRating: 5 } }
      : {}),
  };
}

export function serviceSchema(name: string, description: string, shop: Shop, url: string, offers?: { name: string; price: number }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: new URL(url, SITE).toString(),
    areaServed: { "@type": "City", name: shop.city },
    provider: { "@id": `${SITE}/${shop.slug}/#store` },
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
