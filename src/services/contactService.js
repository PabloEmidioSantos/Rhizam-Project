import { requireSupabase } from "../lib/supabase.js";

function getContactError(status) {
  if (status === 400) return "Revise os campos do formulário e tente novamente.";
  if (status === 403) return "O envio não está habilitado para este domínio.";
  if (status === 404) return "O serviço de contato ainda não foi publicado.";
  if (status === 413) return "A mensagem enviada excede o limite permitido.";
  if (status === 429) return "Muitas solicitações. Aguarde um pouco e tente novamente.";
  if (status >= 500) return "O serviço de contato está temporariamente indisponível.";
  return "Não foi possível enviar sua mensagem. Tente novamente.";
}

export function createContactService(getClient) {
  return {
    async submitContactRequest(form) {
      const { data, error } = await getClient().functions.invoke("create-contact-request", {
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          company: form.company.trim() || null,
          message: form.message.trim(),
          website: form.website?.trim() ?? "",
        },
      });
      if (error) throw new Error(getContactError(error.context?.status));
      return data;
    },
  };
}

const contactService = createContactService(requireSupabase);

export const submitContactRequest = (form) => contactService.submitContactRequest(form);
