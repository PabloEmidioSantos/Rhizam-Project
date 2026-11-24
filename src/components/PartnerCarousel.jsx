import { useEffect, useRef, useState } from "react";

const partners = [
  { name: "Agile", src: "/imgs/1%20Agile.avif" },
  { name: "VTEX", src: "/imgs/3%20vtex.png" },
  { name: "Tray", src: "/imgs/4%20Tray.png" },
  { name: "Meta Ads", src: "/imgs/5%20Meta%20Ads.png" },
  { name: "Google Ads", src: "/imgs/6%20Googles%20Ads.webp" },
  { name: "Salesforce", src: "/imgs/7%20Sales%20Force.webp" },
  { name: "RD Station", src: "/imgs/8%20Rd%20Station.svg" },
  { name: "Braveo", src: "/imgs/9%20braveo.png" },
];

export default function PartnerCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef(null);
  const visibleCount = 4;

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % partners.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [paused]);

  function move(direction) {
    setIndex((current) => (current + direction + partners.length) % partners.length);
  }

  return (
    <div
      className="partner-carousel"
      role="region"
      aria-label="Tecnologias e parceiros"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div className="partner-carousel-track" ref={trackRef}>
        {partners.map((partner, partnerIndex) => {
          const offset = (partnerIndex - index + partners.length) % partners.length;
          const active = offset < visibleCount;
          return (
            <div
              className={`partner-slide${active ? " is-active" : ""}`}
              key={partner.name}
              aria-hidden={!active}
            >
              <img src={partner.src} alt={active ? partner.name : ""} loading="lazy" />
            </div>
          );
        })}
      </div>
      <div className="partner-carousel-controls">
        <button type="button" onClick={() => move(-1)} aria-label="Parceiros anteriores">←</button>
        <div className="partner-carousel-dots" aria-label="Posição do carrossel">
          {partners.map((partner, dotIndex) => (
            <button
              type="button"
              key={partner.name}
              className={dotIndex === index ? "is-active" : ""}
              aria-label={`Mostrar parceiros a partir de ${partner.name}`}
              aria-current={dotIndex === index ? "true" : undefined}
              onClick={() => setIndex(dotIndex)}
            />
          ))}
        </div>
        <button type="button" onClick={() => move(1)} aria-label="Próximos parceiros">→</button>
      </div>
    </div>
  );
}
