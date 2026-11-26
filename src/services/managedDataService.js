import { requireSupabase } from "../lib/supabase.js";
import { getSupabaseErrorMessage } from "../lib/supabaseErrors.js";

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

export function createManagedDataService(getClient) {
  return {
    async listManagedRecords(name, { page = 0, pageSize = 25 } = {}) {
      if (!Number.isSafeInteger(page) || page < 0 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100) {
        throw new Error("Parâmetros de paginação inválidos.");
      }
      const from = page * pageSize;
      const to = from + pageSize - 1;
      if (!Number.isSafeInteger(from) || !Number.isSafeInteger(to)) {
        throw new Error("Intervalo de paginação inválido.");
      }

      const config = getResourceConfig(name);
      const { data, error, count } = await getClient().from(config.table)
        .select(config.columns, { count: "exact" })
        .order(config.order, { ascending: false })
        .range(from, to);
      if (error) throw new Error(getSupabaseErrorMessage(error, "Não foi possível carregar os registros."));
      if (!Array.isArray(data) || !Number.isSafeInteger(count)) {
        throw new Error("A listagem retornou dados incompletos.");
      }
      return { records: data, count };
    },
    async createManagedRecord(name, payload) {
      const config = getResourceConfig(name);
      const { data, error } = await getClient().from(config.table).insert(payload).select(config.columns).single();
      if (error) throw new Error(getSupabaseErrorMessage(error, "Não foi possível criar o registro."));
      return data;
    },
    async updateManagedRecord(name, id, payload) {
      const config = getResourceConfig(name);
      const { data, error } = await getClient().from(config.table).update(payload).eq("id", id).select(config.columns).single();
      if (error) throw new Error(getSupabaseErrorMessage(error, "Não foi possível atualizar o registro."));
      return data;
    },
    async deleteManagedRecord(name, id) {
      const { error } = await getClient().from(getResourceConfig(name).table)
        .delete()
        .eq("id", id)
        .select("id")
        .single();
      if (error) throw new Error(getSupabaseErrorMessage(error, "Não foi possível excluir o registro."));
    },
  };
}

const managedDataService = createManagedDataService(requireSupabase);

export const listManagedRecords = (name, options) => managedDataService.listManagedRecords(name, options);
export const createManagedRecord = (name, payload) => managedDataService.createManagedRecord(name, payload);
export const updateManagedRecord = (name, id, payload) => managedDataService.updateManagedRecord(name, id, payload);
export const deleteManagedRecord = (name, id) => managedDataService.deleteManagedRecord(name, id);
