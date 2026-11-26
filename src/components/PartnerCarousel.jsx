import { useEffect, useState } from "react";
import { getVisiblePartners, partners } from "../lib/partnerCarousel.js";

const rotationInterval = 4500;

function getVisibleCount() {
  if (window.matchMedia("(max-width: 380px)").matches) return 1;
  if (window.matchMedia("(max-width: 767px)").matches) return 2;
  if (window.matchMedia("(max-width: 1023px)").matches) return 3;
  return 4;
}

export default function PartnerCarousel() {
  const [index, setIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(getVisibleCount);
  const [reducedMotion, setReducedMotion] = useState(() => (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ));
  const [pointerOver, setPointerOver] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const rotationPaused = reducedMotion || pointerOver || focusWithin || userPaused;

  useEffect(() => {
    function updateVisibleCount() {
      setVisibleCount(getVisibleCount());
    }

    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = (event) => setReducedMotion(event.matches);

    setReducedMotion(preference.matches);
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (rotationPaused) return undefined;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % partners.length);
    }, rotationInterval);
    return () => window.clearInterval(timer);
  }, [rotationPaused]);

  function move(direction) {
    setIndex((current) => (current + direction + partners.length) % partners.length);
  }

  return (
    <div
      className="partner-carousel"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Tecnologias e parceiros"
      onPointerEnter={() => setPointerOver(true)}
      onPointerLeave={() => setPointerOver(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false);
      }}
    >
      <div
        className="partner-carousel-track"
        style={{ "--visible-count": visibleCount }}
        aria-live="off"
      >
        {getVisiblePartners(index, visibleCount).map(({ partner, index: partnerIndex }, slotIndex) => (
          <div
            className="partner-slide"
            key={slotIndex}
            role="group"
            aria-roledescription="slide"
            aria-label={`${partner.name}, ${partnerIndex + 1} de ${partners.length}`}
          >
            <img key={partner.name} src={partner.src} alt={partner.name} loading="lazy" />
          </div>
        ))}
      </div>

      <div className="partner-carousel-controls">
        <div className="partner-carousel-dots" role="group" aria-label="Selecionar parceiro inicial">
          {partners.map((partner, partnerIndex) => (
            <button
              type="button"
              key={partner.name}
              className={partnerIndex === index ? "is-active" : ""}
              aria-label={`Mostrar parceiros a partir de ${partner.name}`}
              aria-current={partnerIndex === index ? "true" : undefined}
              onClick={() => setIndex(partnerIndex)}
            />
          ))}
        </div>

        <div className="partner-carousel-actions">
          <button type="button" onClick={() => move(-1)} aria-label="Parceiros anteriores">
            <span aria-hidden="true">←</span>
          </button>
          {!reducedMotion && (
            <button
              type="button"
              aria-label={userPaused ? "Retomar rotação automática" : "Pausar rotação automática"}
              aria-pressed={userPaused}
              onClick={() => setUserPaused((paused) => !paused)}
            >
              <span aria-hidden="true">{userPaused ? "▶" : "Ⅱ"}</span>
            </button>
          )}
          <button type="button" onClick={() => move(1)} aria-label="Próximos parceiros">
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
