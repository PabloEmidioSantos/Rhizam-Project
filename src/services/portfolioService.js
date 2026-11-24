import { requireSupabase } from "../lib/supabase.js";

export async function listPublicProjects() {
  const { data, error } = await requireSupabase().from("public_projects")
    .select("id, title, public_summary, created_at")
    .order("created_at", { ascending: false });
  if (error?.code === "PGRST205") {
    throw new Error("O portfólio ainda não está disponível. Confirme se as migrations do Supabase foram aplicadas.");
  }
  if (error) throw error;
  return data;
}
