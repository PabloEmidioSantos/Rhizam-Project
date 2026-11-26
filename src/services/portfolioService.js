import { requireSupabase } from "../lib/supabase.js";
import { getSupabaseErrorMessage } from "../lib/supabaseErrors.js";

export async function listPublicProjects() {
  const { data, error } = await requireSupabase().from("public_projects")
    .select("id, title, public_summary, created_at")
    .order("created_at", { ascending: false });
  if (error?.code === "PGRST205") {
    throw new Error("Os projetos publicados não estão disponíveis no momento.");
  }
  if (error) throw new Error(getSupabaseErrorMessage(error, "Não foi possível carregar os projetos publicados."));
  return data;
}
