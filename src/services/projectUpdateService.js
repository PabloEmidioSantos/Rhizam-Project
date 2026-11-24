import { requireSupabase } from "../lib/supabase.js";
import { createManagedRecord, deleteManagedRecord, listManagedRecords, updateManagedRecord } from "./managedDataService.js";

export const listProjectUpdates = () => listManagedRecords("updates");
export const createProjectUpdate = (payload) => createManagedRecord("updates", payload);
export const updateProjectUpdate = (id, payload) => updateManagedRecord("updates", id, payload);
export const deleteProjectUpdate = (id) => deleteManagedRecord("updates", id);

export async function getClientVisibleUpdates(projectIds) {
  if (!projectIds.length) return [];
  const { data, error } = await requireSupabase().from("project_updates")
    .select("id, project_id, title, body, created_at")
    .in("project_id", projectIds)
    .eq("is_visible_to_client", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
