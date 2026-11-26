export const partners = [
  { name: "Agile", src: "/imgs/1%20Agile.avif" },
  { name: "VTEX", src: "/imgs/3%20vtex.png" },
  { name: "Tray", src: "/imgs/4%20Tray.png" },
  { name: "Meta Ads", src: "/imgs/5%20Meta%20Ads.png" },
  { name: "Google Ads", src: "/imgs/6%20Googles%20Ads.webp" },
  { name: "Salesforce", src: "/imgs/7%20Sales%20Force.webp" },
  { name: "RD Station", src: "/imgs/8%20Rd%20Station.svg" },
  { name: "Braveo", src: "/imgs/9%20braveo.png" },
];

export function getVisiblePartners(startIndex, visibleCount) {
  if (!partners.length || !Number.isFinite(visibleCount)) return [];

  const count = Math.min(Math.max(0, Math.trunc(visibleCount)), partners.length);
  if (count === 0) return [];

  const requestedIndex = Number.isFinite(startIndex) ? Math.trunc(startIndex) : 0;
  const normalizedIndex = ((requestedIndex % partners.length) + partners.length) % partners.length;

  return Array.from({ length: count }, (_, offset) => {
    const index = (normalizedIndex + offset) % partners.length;
    return { partner: partners[index], index };
  });
}
