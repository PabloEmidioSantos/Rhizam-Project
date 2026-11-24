export function Feedback({ children, kind = "error" }) {
  if (!children) return null;
  return <p className={`feedback feedback-${kind}`} role={kind === "error" ? "alert" : "status"}>{children}</p>;
}

export function LoadingState({ label = "Carregando…" }) {
  return <p className="loading-state" role="status">{label}</p>;
}
