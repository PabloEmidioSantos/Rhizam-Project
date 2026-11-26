import test from "node:test";
import assert from "node:assert/strict";
import { getSupabaseErrorMessage } from "../src/lib/supabaseErrors.js";

test("maps database errors without exposing raw server details", () => {
  assert.equal(getSupabaseErrorMessage({ code: "23505", message: "private index details" }, "Fallback"), "Já existe um registro com esses dados.");
  assert.equal(getSupabaseErrorMessage({ code: "42501", message: "private policy details" }, "Fallback"), "Sua sessão expirou ou não possui permissão para esta operação.");
  assert.equal(getSupabaseErrorMessage({ code: "XX000", message: "private database details" }, "Fallback"), "Fallback");
});
