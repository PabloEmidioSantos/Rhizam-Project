import { Link } from "react-router-dom";
import SignInForm from "../components/SignInForm.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { supabaseConfigError } from "../lib/supabase.js";

export default function AdminLoginPage() {
  const { loading } = useAuth();
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="auth-brand" to="/">MONOLITH <span>· PAINEL</span></Link>
        <p className="eyebrow eyebrow-dark">Acesso restrito</p>
        <h1>Administração</h1>
        <p>Entre com a conta administrativa previamente autorizada no Supabase.</p>
        {supabaseConfigError ? <p className="feedback feedback-error">{supabaseConfigError}</p> : <SignInForm role="admin" />}
        {loading && <p className="loading-state">Verificando sessão…</p>}
        <Link className="auth-back-link" to="/">Voltar ao site</Link>
      </section>
    </main>
  );
}
