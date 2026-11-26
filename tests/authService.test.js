import test from "node:test";
import assert from "node:assert/strict";
import { createAuthService } from "../src/services/authService.js";
import { getSignInErrorMessage } from "../src/lib/errors.js";

test("passes credentials to Supabase Auth and returns its session result", async () => {
  let credentials;
  const result = { user: { id: "user-1" }, session: { access_token: "mock-token" } };
  const service = createAuthService(() => ({
    auth: {
      signInWithPassword: async (input) => {
        credentials = input;
        return { data: result, error: null };
      },
    },
  }));

  assert.equal(await service.signIn("person@example.com", "password"), result);
  assert.deepEqual(credentials, { email: "person@example.com", password: "password" });
});

test("requires both Supabase access checks and resolves the authorized profile", async () => {
  const calls = [];
  const results = {
    admin_users: { data: null, error: null },
    clients: { data: { id: "client-1", name: "Client", email: "client@example.com" }, error: null },
  };
  const service = createAuthService(() => ({
    from(table) {
      return {
        select(columns) {
          calls.push({ table, columns });
          return {
            eq(column, value) {
              calls.push({ column, value });
              return { maybeSingle: async () => results[table] };
            },
          };
        },
      };
    },
  }));

  assert.deepEqual(await service.getAccessProfile("user-1"), {
    role: "client",
    client: { id: "client-1", name: "Client", email: "client@example.com" },
  });
  assert.deepEqual(calls, [
    { table: "admin_users", columns: "user_id" },
    { column: "user_id", value: "user-1" },
    { table: "clients", columns: "id, name, email" },
    { column: "auth_user_id", value: "user-1" },
  ]);
});

test("does not query permissions without an authenticated user id", async () => {
  const service = createAuthService(() => {
    throw new Error("client should not be requested");
  });
  await assert.rejects(service.getAccessProfile(null), /identificar/);
});

test("shows safe authentication feedback instead of raw provider errors", () => {
  assert.equal(getSignInErrorMessage({ code: "invalid_credentials", message: "provider detail" }), "E-mail ou senha inválidos.");
  assert.equal(getSignInErrorMessage({ message: "provider detail" }), "Não foi possível iniciar a sessão. Verifique a conexão e tente novamente.");
});
