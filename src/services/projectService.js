import { requireSupabase } from "../lib/supabase.js";
import { getSupabaseErrorMessage } from "../lib/supabaseErrors.js";
import { createManagedRecord, deleteManagedRecord, listManagedRecords, updateManagedRecord } from "./managedDataService.js";

export const listProjects = (options) => listManagedRecords("projects", options);
export const createProject = (payload) => createManagedRecord("projects", payload);
export const updateProject = (id, payload) => updateManagedRecord("projects", id, payload);
export const deleteProject = (id) => deleteManagedRecord("projects", id);

export async function getClientProjects(clientId) {
  const { data, error } = await requireSupabase().from("projects")
    .select("id, title, description, status, progress, created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(getSupabaseErrorMessage(error, "Não foi possível carregar seus projetos."));
  return data;
}
