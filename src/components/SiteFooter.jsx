import Brand from "./Brand.jsx";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-identity">
          <Brand footer />
          <p>Engenharia comercial e digital<br />para operações B2B.</p>
        </div>
        <div className="footer-link-column">
          <h2>Navegue</h2>
          <a href="#sobre">Sobre</a>
          <a href="#solucoes">Serviços</a>
          <a href="#atuacao">Para quem é</a>
          <a href="#parceiros">Parceiros</a>
        </div>
        <div className="footer-link-column">
          <h2>Ambientes</h2>
          <a href="#atuacao">Distribuição</a>
          <a href="#atuacao">Indústria</a>
          <a href="#atuacao">Importação</a>
          <a href="#atuacao">Operação integrada</a>
        </div>
        <div className="footer-link-column">
          <h2>Institucional</h2>
          <span>RHIZAM</span>
          <span>Engenharia comercial e digital B2B</span>
          <a href="#contato">Agendar reunião ↗</a>
          <a href="/cliente">Área do cliente</a>
          <a href="/admin/login">Administração</a>
        </div>
      </div>
      <div className="site-footer-bottom">
        <span>© RHIZAM — 2026. Todos os direitos reservados.</span>
        <a href="#topo">Voltar ao início ↑</a>
      </div>
    </footer>
  );
}
