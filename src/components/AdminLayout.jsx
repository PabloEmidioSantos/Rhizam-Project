import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Brand from "./Brand.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { signOut } from "../services/authService.js";

const adminLinks = [
  ["/admin", "Visão geral", true],
  ["/admin/requests", "Solicitações"],
  ["/admin/clients", "Clientes"],
  ["/admin/projects", "Projetos e portfólio"],
  ["/admin/updates", "Atualizações"],
];

export default function AdminLayout() {
  const { session, error, setError } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      await signOut();
      navigate("/admin/login", { replace: true });
    } catch {
      setError("Não foi possível encerrar a sessão. Tente novamente.");
    }
  }

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <Brand />
        <p className="admin-label">ADMINISTRAÇÃO</p>
        <nav aria-label="Navegação administrativa">
          {adminLinks.map(([to, label, end]) => <NavLink key={to} to={to} end={end}>{label}</NavLink>)}
        </nav>
        <button className="sidebar-signout" type="button" onClick={handleSignOut}>Sair da conta</button>
      </aside>
      <div className="admin-content">
        <header className="admin-topbar"><span>RHIZAM · Painel administrativo</span>{error && <span className="feedback feedback-error" role="status">{error}</span>}<span>{session?.user.email}</span></header>
        <main className="admin-main"><Outlet /></main>
      </div>
    </div>
  );
}
