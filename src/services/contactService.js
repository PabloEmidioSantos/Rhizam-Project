import { requireSupabase } from "../lib/supabase.js";

export async function submitContactRequest(form) {
  const { data, error } = await requireSupabase().functions.invoke("create-contact-request", {
    body: {
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim() || null,
      message: form.message.trim(),
      website: form.website?.trim() ?? "",
    },
  });
  if (error) {
    const status = error.context?.status;
    if (status === 400) throw new Error("Revise os campos do formulário e tente novamente.");
    if (status === 403) throw new Error("O envio não está habilitado para este domínio.");
    if (status === 404) throw new Error("O serviço de contato ainda não foi publicado.");
    if (status === 413) throw new Error("A mensagem enviada excede o limite permitido.");
    if (status === 429) throw new Error("Muitas solicitações. Aguarde um pouco e tente novamente.");
    if (status >= 500) throw new Error("O serviço de contato está temporariamente indisponível.");
    throw error;
  }
  return data;
}
