import Brand from "./Brand.jsx";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-identity">
          <Brand footer />
          <p>Construindo presença digital,<br />impulsionando negócios.</p>
        </div>
        <div className="footer-link-column">
          <h2>Navegue</h2>
          <a href="#sobre">A empresa</a>
          <a href="#servicos">Serviços</a>
          <a href="#processo">Processo</a>
          <a href="#compromissos">Compromissos</a>
        </div>
        <div className="footer-link-column">
          <h2>Serviços</h2>
          <a href="#servicos">Desenvolvimento de sites</a>
          <a href="#servicos">Estratégia digital</a>
          <a href="#servicos">Design personalizado</a>
          <a href="#servicos">Suporte contínuo</a>
        </div>
        <div className="footer-link-column">
          <h2>Institucional</h2>
          <span>Carapicuíba · São Paulo</span>
          <span>Desenvolvimento web</span>
          <a href="#contato">Fale com a MONOLITH ↗</a>
          <a href="/admin/login">Administração</a>
        </div>
      </div>
      <div className="site-footer-bottom">
        <span>© MONOLITH — 2026. Todos os direitos reservados.</span>
        <a href="#topo">Voltar ao início ↑</a>
      </div>
    </footer>
  );
}
