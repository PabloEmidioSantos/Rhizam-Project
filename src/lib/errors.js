export function getErrorMessage(error, fallback = "Ocorreu um erro. Tente novamente.") {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error?.message === "string" && error.message) return error.message;
  return fallback;
}

export function getSignInErrorMessage(error) {
  if (error?.code === "invalid_credentials" || error?.status === 400) {
    return "E-mail ou senha inválidos.";
  }
  return "Não foi possível iniciar a sessão. Verifique a conexão e tente novamente.";
}

export function throwIfError({ data, error }) {
  if (error) throw error;
  return data;
}
