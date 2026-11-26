import test from "node:test";
import assert from "node:assert/strict";
import { createContactService } from "../src/services/contactService.js";

test("sends the existing contact Edge Function contract with normalized values", async () => {
  let invocation;
  const service = createContactService(() => ({
    functions: {
      invoke: async (...args) => {
        invocation = args;
        return { data: { ok: true }, error: null };
      },
    },
  }));

  const result = await service.submitContactRequest({
    name: " Ana ",
    email: " ana@example.com ",
    company: " ",
    message: " Quero conversar sobre o projeto. ",
    website: "",
  });

  assert.deepEqual(invocation, [
    "create-contact-request",
    { body: { name: "Ana", email: "ana@example.com", company: null, message: "Quero conversar sobre o projeto.", website: "" } },
  ]);
  assert.deepEqual(result, { ok: true });
});

test("maps rate-limit and service failures to non-sensitive messages", async () => {
  for (const [status, message] of [
    [429, "Muitas solicitações. Aguarde um pouco e tente novamente."],
    [503, "O serviço de contato está temporariamente indisponível."],
  ]) {
    const service = createContactService(() => ({
      functions: {
        invoke: async () => ({ data: null, error: { context: { status }, message: "internal detail" } }),
      },
    }));

    await assert.rejects(service.submitContactRequest({
      name: "Ana",
      email: "ana@example.com",
      company: "",
      message: "Mensagem para a equipe",
    }), { message });
  }
});
