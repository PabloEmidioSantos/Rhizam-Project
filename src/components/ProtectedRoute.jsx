import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { supabaseConfigError } from "../lib/supabase.js";
import { Feedback, LoadingState } from "./Feedback.jsx";

export default function ProtectedRoute({ role, children }) {
  const { session, profile, loading, error } = useAuth();
  const location = useLocation();

  if (supabaseConfigError) return <Navigate to="/admin/login" replace />;
  if (loading) return <main className="auth-page"><LoadingState label="Verificando acesso…" /></main>;
  if (!session) return <Navigate to={role === "client" ? "/cliente" : "/admin/login"} replace state={{ from: location }} />;
  if (error && !profile?.role) return <main className="auth-page"><section className="auth-card"><h1>Não foi possível verificar o acesso</h1><Feedback>{error}</Feedback></section></main>;
  if (profile?.role !== role) return <main className="auth-page"><section className="auth-card"><h1>Acesso não autorizado</h1><p>Esta conta não possui permissão para acessar esta área.</p><a className="text-button" href="/">Voltar ao início</a></section></main>;
  return children;
}
