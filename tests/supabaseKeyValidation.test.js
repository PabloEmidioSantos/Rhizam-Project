import test from "node:test";
import assert from "node:assert/strict";
import { isPrivilegedSupabaseKey } from "../src/lib/supabaseKeyValidation.js";

test("rejects known Supabase secret key formats", () => {
  assert.equal(isPrivilegedSupabaseKey("sb_secret_example"), true);
  assert.equal(isPrivilegedSupabaseKey("service_role"), true);
});

test("rejects legacy service-role JWTs without exposing their value", () => {
  const payload = btoa(JSON.stringify({ role: "service_role" }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  assert.equal(isPrivilegedSupabaseKey(`header.${payload}.signature`), true);
});

test("allows public keys and rejects malformed non-secret values safely", () => {
  assert.equal(isPrivilegedSupabaseKey("sb_publishable_example"), false);
  assert.equal(isPrivilegedSupabaseKey("not-a-jwt"), false);
  assert.equal(isPrivilegedSupabaseKey(""), false);
});
