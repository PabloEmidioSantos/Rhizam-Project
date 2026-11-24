import { requireSupabase } from "../lib/supabase.js";

export async function signIn(email, password) {
  const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}

export async function getAccessProfile(userId) {
  const client = requireSupabase();
  const [adminResult, clientResult] = await Promise.all([
    client.from("admin_users").select("user_id").eq("user_id", userId).maybeSingle(),
    client.from("clients").select("id, name, email").eq("auth_user_id", userId).maybeSingle(),
  ]);
  if (adminResult.error) throw adminResult.error;
  if (clientResult.error) throw clientResult.error;

  return {
    role: adminResult.data ? "admin" : clientResult.data ? "client" : null,
    client: clientResult.data,
  };
}
