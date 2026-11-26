import { useEffect, useRef, useState } from "react";
import Brand from "./Brand.jsx";

const links = [
  ["#sobre", "Sobre"],
  ["#solucoes", "Serviços"],
  ["#atuacao", "Para quem é"],
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const navigationRef = useRef(null);

  useEffect(() => {
    function onKeyDown(event) {
      if (!open || !window.matchMedia("(max-width: 767px)").matches) return;

      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      const links = navigationRef.current?.querySelectorAll("a[href]");
      if (!links?.length) return;

      const firstLink = links[0];
      const lastLink = links[links.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === firstLink || activeElement === menuButtonRef.current)) {
        event.preventDefault();
        if (activeElement === menuButtonRef.current) lastLink.focus();
        else menuButtonRef.current?.focus();
      } else if (!event.shiftKey && activeElement === lastLink) {
        event.preventDefault();
        menuButtonRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open && window.matchMedia("(max-width: 767px)").matches) {
      navigationRef.current?.querySelector("a[href]")?.focus();
    }
  }, [open]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : previousOverflow;
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    function closeAfterResize() {
      if (window.matchMedia("(min-width: 768px)").matches) setOpen(false);
    }
    window.addEventListener("resize", closeAfterResize);
    return () => window.removeEventListener("resize", closeAfterResize);
  }, []);

  const closeMenu = () => setOpen(false);
  const navigateToSection = (event) => {
    const target = document.getElementById(event.currentTarget.hash.slice(1));
    closeMenu();
    if (target) window.requestAnimationFrame(() => target.focus({ preventScroll: true }));
  };

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Brand />
        <button
          className="mobile-menu-button"
          ref={menuButtonRef}
          type="button"
          aria-expanded={open}
          aria-controls="site-navigation"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((current) => !current)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        <nav
          id="site-navigation"
          ref={navigationRef}
          className={`site-navigation${open ? " is-open" : ""}`}
          aria-label="Navegação principal"
        >
          {links.map(([href, label]) => (
            <a key={href} href={href} onClick={navigateToSection}>{label}</a>
          ))}
          <a className="primary-button nav-contact" href="#contato" onClick={navigateToSection}>Agendar reunião <span aria-hidden="true">↗</span></a>
        </nav>
      </div>
    </header>
  );
}
