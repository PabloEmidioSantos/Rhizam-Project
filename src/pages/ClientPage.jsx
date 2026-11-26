import { Link } from "react-router-dom";
import { useCallback, useMemo, useRef } from "react";
import { useAuth } from "../hooks/useAuth.js";
import SignInForm from "../components/SignInForm.jsx";
import { LoadingState, Feedback } from "../components/Feedback.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { supabaseConfigError } from "../lib/supabase.js";
import { getClientProjects } from "../services/projectService.js";
import { getClientVisibleUpdates } from "../services/projectUpdateService.js";
import { signOut } from "../services/authService.js";

function ClientProjects({ clientId }) {
  const loadProjects = useCallback(() => getClientProjects(clientId), [clientId]);
  const { data: projects, loading, error, reload: reloadProjects } = useAsyncData(loadProjects);
  const projectIds = useMemo(() => (projects ?? []).map((project) => project.id), [projects]);
  const loadUpdates = useCallback(() => getClientVisibleUpdates(projectIds), [projectIds]);
  const updatesState = useAsyncData(loadUpdates);
  const refreshInProgress = useRef(false);
  const updatesByProject = useMemo(() => {
    const grouped = new Map();
    for (const update of updatesState.data ?? []) {
      const updates = grouped.get(update.project_id) ?? [];
      updates.push(update);
      grouped.set(update.project_id, updates);
    }
    return grouped;
  }, [updatesState.data]);
  async function handleRefresh() {
    if (refreshInProgress.current) return;
    refreshInProgress.current = true;
    try {
      await reloadProjects();
    } finally {
      refreshInProgress.current = false;
    }
  }
  const refreshButton = <button className="subtle-button" type="button" onClick={() => void handleRefresh()} disabled={loading || updatesState.loading}>Atualizar dados</button>;
  if (loading) return <div className="client-project-list">{refreshButton}<LoadingState label="Carregando seus projetos…" /></div>;
  if (error) return <div className="client-project-list">{refreshButton}<Feedback>{error}</Feedback></div>;
  if (!projects?.length) return <div className="client-project-list">{refreshButton}<p className="empty-state">Ainda não há projetos vinculados a esta conta. Entre em contato com a RHIZAM para obter ajuda.</p></div>;

  return (
    <div className="client-project-list">
      <div className="client-data-actions">{refreshButton}</div>
      {updatesState.loading && <LoadingState label="Carregando atualizações…" />}
      {updatesState.error && <Feedback>{updatesState.error}</Feedback>}
      {projects.map((project) => (
        <article className="client-project-card" key={project.id}>
          <div className="project-card-heading"><div><span className="admin-label">PROJETO</span><h2>{project.title}</h2></div><span className="status-pill">{project.status.replaceAll("_", " ")}</span></div>
          {project.description && <p>{project.description}</p>}
          <div className="progress-label"><span>Andamento</span><span>{project.progress}%</span></div>
          <progress value={project.progress} max="100">{project.progress}%</progress>
          <h3>Atualizações</h3>
          {!updatesState.loading && !updatesState.error && !updatesByProject.get(project.id)?.length && <p className="empty-state">Nenhuma atualização compartilhada ainda.</p>}
          {!updatesState.loading && !updatesState.error && (updatesByProject.get(project.id) ?? []).map((update) => <article className="project-update" key={update.id}><h4>{update.title}</h4><p>{update.body}</p><time dateTime={update.created_at}>{new Date(update.created_at).toLocaleDateString("pt-BR")}</time></article>)}
        </article>
      ))}
    </div>
  );
}

export default function ClientPage() {
  const { session, profile, loading, error, setError } = useAuth();
  async function handleSignOut() {
    try {
      await signOut();
    } catch {
      setError("Não foi possível encerrar a sessão. Tente novamente.");
    }
  }
  return (
    <main className="auth-page client-area">
      <div className="client-area-header"><Link className="auth-brand" to="/">RHIZAM <span>· ÁREA DO CLIENTE</span></Link>{session && <button className="text-button" type="button" onClick={handleSignOut}>Sair</button>}</div>
      {supabaseConfigError ? <section className="auth-card"><h1>Área do cliente</h1><p className="feedback feedback-error">{supabaseConfigError}</p></section>
        : !session ? <section className="auth-card"><p className="eyebrow eyebrow-dark">Acesso individual</p><h1>Área do cliente</h1><p>Entre com a conta vinculada ao seu projeto.</p><Feedback>{error}</Feedback><SignInForm role="client" /></section>
          : loading ? <LoadingState label="Verificando permissões…" />
            : error && !profile?.role ? <section className="auth-card"><h1>Não foi possível verificar o acesso</h1><Feedback>{error}</Feedback></section>
            : profile?.role !== "client" ? <section className="auth-card"><h1>Acesso não autorizado</h1><p>Esta conta não está vinculada a um perfil de cliente.</p></section>
              : <section className="client-dashboard"><div><p className="eyebrow eyebrow-dark">ÁREA DO CLIENTE</p><h1>Olá, {profile.client.name}</h1><p>Acompanhe os projetos e atualizações compartilhados com você.</p></div><ClientProjects key={profile.client.id} clientId={profile.client.id} /></section>}
    </main>
  );
}
