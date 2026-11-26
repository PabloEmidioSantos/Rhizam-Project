import { requireSupabase } from "../lib/supabase.js";
import { getSupabaseErrorMessage } from "../lib/supabaseErrors.js";

export async function getAdminMetrics() {
  const client = requireSupabase();
  const [clients, requests, projects] = await Promise.all([
    client.from("clients").select("id", { count: "exact", head: true }),
    client.from("contact_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    client.from("projects").select("id", { count: "exact", head: true }),
  ]);
  for (const result of [clients, requests, projects]) {
    if (result.error) {
      throw new Error(getSupabaseErrorMessage(result.error, "Não foi possível carregar os indicadores administrativos."));
    }
  }
  return { clients: clients.count ?? 0, requests: requests.count ?? 0, projects: projects.count ?? 0 };
}
