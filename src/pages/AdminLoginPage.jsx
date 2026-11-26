import { Link } from "react-router-dom";
import SignInForm from "../components/SignInForm.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { supabaseConfigError } from "../lib/supabase.js";
import { Feedback } from "../components/Feedback.jsx";

export default function AdminLoginPage() {
  const { loading, error, session } = useAuth();
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="auth-brand" to="/">RHIZAM <span>· PAINEL</span></Link>
        <p className="eyebrow eyebrow-blue">Acesso restrito</p>
        <h1>Administração</h1>
        <p>Entre com a conta administrativa previamente autorizada no Supabase.</p>
        {supabaseConfigError ? <Feedback>{supabaseConfigError}</Feedback> : <>{!session && <Feedback>{error}</Feedback>}<SignInForm role="admin" /></>}
        {loading && <p className="loading-state">Verificando sessão…</p>}
        <Link className="auth-back-link" to="/">Voltar ao site</Link>
      </section>
    </main>
  );
}
