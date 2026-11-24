import { Link } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { getAdminMetrics } from "../services/adminMetricsService.js";
import { Feedback, LoadingState } from "../components/Feedback.jsx";

const quickLinks = [
  ["/admin/requests", "Solicitações de contato", "Revise mensagens enviadas pelo formulário."],
  ["/admin/clients", "Clientes", "Gerencie os perfis vinculados às contas."],
  ["/admin/projects", "Projetos e portfólio", "Acompanhe projetos e publicações autorizadas."],
  ["/admin/updates", "Atualizações", "Compartilhe atualizações dos projetos."],
];

export default function AdminDashboardPage() {
  const { data, loading, error, reload } = useAsyncData(getAdminMetrics, []);
  return (
    <section>
      <div className="admin-page-heading"><div><p className="admin-label">RESUMO</p><h1>Visão geral</h1><p>Indicadores do espaço administrativo RHIZAM.</p></div><button className="subtle-button" type="button" onClick={reload}>Atualizar</button></div>
      {loading && <LoadingState />}
      {error && <Feedback>{error}</Feedback>}
      {data && <div className="metric-grid"><article><span>Clientes</span><strong>{data.clients}</strong></article><article><span>Solicitações novas</span><strong>{data.requests}</strong></article><article><span>Projetos</span><strong>{data.projects}</strong></article></div>}
      <div className="admin-link-grid">{quickLinks.map(([to, title, description]) => <Link className="admin-link-card" to={to} key={to}><span>{title}</span><p>{description}</p><b aria-hidden="true">↗</b></Link>)}</div>
    </section>
  );
}
