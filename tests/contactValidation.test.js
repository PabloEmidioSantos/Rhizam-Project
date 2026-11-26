import test from "node:test";
import assert from "node:assert/strict";
import { validateContactRequest } from "../src/lib/contactValidation.js";

test("normalizes valid contact fields", () => {
  const result = validateContactRequest({
    name: "  Ana Silva ",
    email: " ANA@EXAMPLE.COM ",
    company: "  Empresa ",
    message: " Quero conversar sobre um site. ",
  });

  assert.deepEqual(result, {
    valid: true,
    values: {
      name: "Ana Silva",
      email: "ana@example.com",
      company: "Empresa",
      message: "Quero conversar sobre um site.",
    },
  });
});

test("rejects malformed or oversized contact data", () => {
  assert.equal(validateContactRequest({ name: "A", email: "not-an-email", message: "curta" }).valid, false);
  assert.equal(validateContactRequest({ name: "A".repeat(101), email: "a@example.com", message: "mensagem suficientemente longa" }).valid, false);
  assert.equal(validateContactRequest({ name: "Ana", email: "a@example.com", message: "x".repeat(5001) }).valid, false);
});

test("rejects missing and non-object input without throwing", () => {
  assert.equal(validateContactRequest(null).valid, false);
  assert.equal(validateContactRequest(undefined).valid, false);
  assert.equal(validateContactRequest("not an object").valid, false);
});
