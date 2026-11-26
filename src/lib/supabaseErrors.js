export function getSupabaseErrorMessage(error, fallback) {
  if (error?.code === "23505") return "Já existe um registro com esses dados.";
  if (error?.code === "23503") return "Não foi possível concluir: verifique os registros relacionados.";
  if (error?.code === "23514" || error?.code === "22P02") return "Revise os dados informados e tente novamente.";
  if (error?.code === "42501" || error?.code === "PGRST301") return "Sua sessão expirou ou não possui permissão para esta operação.";
  return fallback;
}
