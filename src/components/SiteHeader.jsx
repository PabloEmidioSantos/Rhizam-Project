import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Brand from "./Brand.jsx";

const links = [
  ["#sobre", "A empresa"],
  ["#solucoes", "Soluções"],
  ["#atuacao", "Atuação"],
  ["#parceiros", "Parceiros"],
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape" && menuButtonRef.current?.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

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
          <span />
          <span />
        </button>
        <nav id="site-navigation" className={`site-navigation${open ? " is-open" : ""}`} aria-label="Navegação principal">
          {links.map(([href, label]) => (
            <a key={href} href={href} onClick={closeMenu}>{label}</a>
          ))}
          <a className="outline-button nav-contact" href="#contato" onClick={closeMenu}>Vamos conversar <span aria-hidden="true">↗</span></a>
          <Link className="client-login-link" to="/cliente" onClick={closeMenu}>Área do cliente</Link>
        </nav>
      </div>
    </header>
  );
}
