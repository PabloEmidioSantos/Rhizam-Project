import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signIn, signOut } from "../services/authService.js";
import { getSignInErrorMessage } from "../lib/errors.js";
import { useAuth } from "../hooks/useAuth.js";
import { Feedback } from "./Feedback.jsx";

export default function SignInForm({ role }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const { profile, session, loading: authLoading, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = role === "client" ? "/cliente" : "/admin";

  async function handleWrongAccountSignOut() {
    try {
      await signOut();
    } catch {
      setError("Não foi possível encerrar a sessão. Tente novamente.");
    }
  }

  if (profile?.role === role) {
    return <p className="feedback feedback-info">Sua sessão já está ativa. <a href={destination}>Abrir área segura</a></p>;
  }
  if (session && authLoading) {
    return <p className="feedback feedback-info" role="status">Verificando permissões da conta…</p>;
  }
  if (session && authError && !profile?.role) {
    return (
      <div>
        <Feedback>{authError}</Feedback>
        <button className="subtle-button" type="button" onClick={handleWrongAccountSignOut}>Encerrar sessão</button>
      </div>
    );
  }
  if (session && profile?.role !== role) {
    return (
      <div>
        <p className="feedback feedback-error">Esta conta não possui acesso a esta área. Encerre a sessão antes de tentar outra conta.</p>
        <button className="subtle-button" type="button" onClick={handleWrongAccountSignOut}>Encerrar sessão</button>
        <Feedback>{error}</Feedback>
      </div>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError("");
    try {
      await signIn(email.trim(), password);
      navigate(location.state?.from?.pathname || destination, { replace: true });
    } catch (signInError) {
      setError(getSignInErrorMessage(signInError));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label htmlFor="login-email">E-mail</label>
      <input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} />
      <label htmlFor="login-password">Senha</label>
      <input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      <Feedback>{error}</Feedback>
      <button className="primary-button" type="submit" disabled={submitting}>{submitting ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}
