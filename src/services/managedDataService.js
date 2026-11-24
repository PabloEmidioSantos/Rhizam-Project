import { requireSupabase } from "../lib/supabase.js";

const resources = {
  clients: { table: "clients", columns: "id, auth_user_id, name, email, company, created_at", order: "created_at" },
  requests: { table: "contact_requests", columns: "id, name, email, company, message, status, created_at", order: "created_at" },
  projects: { table: "projects", columns: "id, client_id, title, description, public_summary, status, progress, is_portfolio, created_at", order: "created_at" },
  updates: { table: "project_updates", columns: "id, project_id, title, body, is_visible_to_client, created_at", order: "created_at" },
};

function getResourceConfig(name) {
  const config = resources[name];
  if (!config) throw new Error("Recurso administrativo inválido.");
  return config;
}

export async function listManagedRecords(name) {
  const config = getResourceConfig(name);
  const { data, error } = await requireSupabase().from(config.table).select(config.columns).order(config.order, { ascending: false });
  if (error) throw error;
  return data;
}

export async function createManagedRecord(name, payload) {
  const config = getResourceConfig(name);
  const { data, error } = await requireSupabase().from(config.table).insert(payload).select(config.columns).single();
  if (error) throw error;
  return data;
}

export async function updateManagedRecord(name, id, payload) {
  const config = getResourceConfig(name);
  const { data, error } = await requireSupabase().from(config.table).update(payload).eq("id", id).select(config.columns).single();
  if (error) throw error;
  return data;
}

export async function deleteManagedRecord(name, id) {
  const { error } = await requireSupabase().from(getResourceConfig(name).table).delete().eq("id", id);
  if (error) throw error;
}
