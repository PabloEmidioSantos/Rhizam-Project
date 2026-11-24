export function getErrorMessage(error, fallback = "Ocorreu um erro. Tente novamente.") {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error?.message === "string" && error.message) return error.message;
  return fallback;
}

export function throwIfError({ data, error }) {
  if (error) throw error;
  return data;
}
