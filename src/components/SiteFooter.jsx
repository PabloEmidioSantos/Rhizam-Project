import Brand from "./Brand.jsx";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-identity">
          <Brand footer />
          <p>Operações digitais conectadas<br />para negócios em movimento.</p>
        </div>
        <div className="footer-link-column">
          <h2>Navegue</h2>
          <a href="#sobre">A empresa</a>
          <a href="#solucoes">Soluções</a>
          <a href="#atuacao">Atuação</a>
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
          <span>Infraestrutura de operações digitais</span>
          <a href="#contato">Fale com a RHIZAM ↗</a>
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
