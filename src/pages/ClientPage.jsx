import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "../hooks/useAuth.js";
import SignInForm from "../components/SignInForm.jsx";
import { LoadingState, Feedback } from "../components/Feedback.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { supabaseConfigError } from "../lib/supabase.js";
import { getClientProjects } from "../services/projectService.js";
import { getClientVisibleUpdates } from "../services/projectUpdateService.js";
import { signOut } from "../services/authService.js";
import { getErrorMessage } from "../lib/errors.js";

function ClientProjects({ clientId }) {
  const { data: projects, loading, error } = useAsyncData(() => getClientProjects(clientId), [clientId]);
  const projectIds = useMemo(() => (projects ?? []).map((project) => project.id), [projects]);
  const updatesState = useAsyncData(() => getClientVisibleUpdates(projectIds), [projectIds.join(",")]);
  if (loading) return <LoadingState label="Carregando seus projetos…" />;
  if (error) return <Feedback>{error}</Feedback>;
  if (!projects?.length) return <p className="empty-state">Ainda não há projetos vinculados a esta conta. Entre em contato com a MONOLITH para obter ajuda.</p>;

  return (
    <div className="client-project-list">
      {projects.map((project) => (
        <article className="client-project-card" key={project.id}>
          <div className="project-card-heading"><div><span className="admin-label">PROJETO</span><h2>{project.title}</h2></div><span className="status-pill">{project.status.replaceAll("_", " ")}</span></div>
          {project.description && <p>{project.description}</p>}
          <div className="progress-label"><span>Andamento</span><span>{project.progress}%</span></div>
          <progress value={project.progress} max="100">{project.progress}%</progress>
          <h3>Atualizações</h3>
          {(updatesState.data ?? []).filter((update) => update.project_id === project.id).length === 0 && <p className="empty-state">Nenhuma atualização compartilhada ainda.</p>}
          {(updatesState.data ?? []).filter((update) => update.project_id === project.id).map((update) => <article className="project-update" key={update.id}><h4>{update.title}</h4><p>{update.body}</p><time dateTime={update.created_at}>{new Date(update.created_at).toLocaleDateString("pt-BR")}</time></article>)}
          {updatesState.error && <Feedback>{updatesState.error}</Feedback>}
        </article>
      ))}
    </div>
  );
}

export default function ClientPage() {
  const { session, profile, loading } = useAuth();
  const { setError } = useAuth();
  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      setError(getErrorMessage(error, "Não foi possível encerrar a sessão."));
    }
  }
  return (
    <main className="auth-page client-area">
      <div className="client-area-header"><Link className="auth-brand" to="/">MONOLITH <span>· ÁREA DO CLIENTE</span></Link>{session && <button className="text-button" type="button" onClick={handleSignOut}>Sair</button>}</div>
      {supabaseConfigError ? <section className="auth-card"><h1>Área do cliente</h1><p className="feedback feedback-error">{supabaseConfigError}</p></section>
        : !session ? <section className="auth-card"><p className="eyebrow eyebrow-dark">Acesso individual</p><h1>Área do cliente</h1><p>Entre com a conta vinculada ao seu projeto.</p><SignInForm role="client" /></section>
          : loading ? <LoadingState label="Verificando permissões…" />
            : profile?.role !== "client" ? <section className="auth-card"><h1>Acesso não autorizado</h1><p>Esta conta não está vinculada a um perfil de cliente.</p></section>
              : <section className="client-dashboard"><div><p className="eyebrow eyebrow-dark">ÁREA DO CLIENTE</p><h1>Olá, {profile.client.name}</h1><p>Acompanhe os projetos e atualizações compartilhados com você.</p></div><ClientProjects clientId={profile.client.id} /></section>}
    </main>
  );
}
