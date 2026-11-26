import { requireSupabase } from "../lib/supabase.js";

export function createAuthService(getClient) {
  return {
    async signIn(email, password) {
      const { data, error } = await getClient().auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    async signOut() {
      const { error } = await getClient().auth.signOut();
      if (error) throw error;
    },
    async getAccessProfile(userId) {
      if (typeof userId !== "string" || !userId) {
        throw new Error("Não foi possível identificar a conta autenticada.");
      }
      const client = getClient();
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
    },
  };
}

const authService = createAuthService(requireSupabase);

export const signIn = (...args) => authService.signIn(...args);
export const signOut = () => authService.signOut();
export const getAccessProfile = (userId) => authService.getAccessProfile(userId);
