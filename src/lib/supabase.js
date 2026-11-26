import { createClient } from "@supabase/supabase-js";
import { isPrivilegedSupabaseKey } from "./supabaseKeyValidation.js";

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL?.trim();
const publishableKey = import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export function getSupabaseConfigError() {
  if (!supabaseUrl || !publishableKey) {
    const missing = [
      !supabaseUrl && "VITE_SUPABASE_URL",
      !publishableKey && "VITE_SUPABASE_PUBLISHABLE_KEY",
    ].filter(Boolean);
    return `Configure ${missing.join(" e ")} no arquivo .env.local para conectar ao Supabase.`;
  }

  try {
    const url = new URL(supabaseUrl);
    if (url.protocol !== "https:" && url.hostname !== "localhost") {
      return "VITE_SUPABASE_URL deve usar HTTPS (localhost é permitido em desenvolvimento).";
    }
  } catch {
    return "VITE_SUPABASE_URL não contém uma URL válida.";
  }

  if (isPrivilegedSupabaseKey(publishableKey)) {
    return "A chave informada tem privilégios de service_role. Use somente uma chave pública publishable/anon no frontend.";
  }

  return null;
}

export const supabaseConfigError = getSupabaseConfigError();
export const supabase = supabaseConfigError
  ? null
  : createClient(supabaseUrl, publishableKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });

export function requireSupabase() {
  if (!supabase) throw new Error(supabaseConfigError);
  return supabase;
}
