import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = (Deno.env.get("CORS_ALLOW_ORIGIN") ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function responseHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json",
    "Vary": "Origin",
  };
}

function jsonResponse(status: number, body: Record<string, unknown>, origin: string) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(origin) });
}

function getClientIp(request: Request) {
  return request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-real-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? null;
}

async function fingerprint(ip: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(ip));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function validate(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const data = body as Record<string, unknown>;
  if (typeof data.name !== "string" || typeof data.email !== "string" || typeof data.message !== "string") return null;

  const name = data.name.trim();
  const email = data.email.trim().toLowerCase();
  const company = typeof data.company === "string" ? data.company.trim() : "";
  const message = data.message.trim();
  if (name.length < 2 || name.length > 100) return null;
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (company.length > 160 || message.length < 10 || message.length > 5000) return null;
  if (typeof data.website === "string" && data.website.trim()) return { honeypot: true };
  return { name, email, company: company || null, message };
}

async function readJsonBody(request: Request) {
  const maxBytes = 16_384;
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxBytes) return { error: "too_large" as const };

  const reader = request.body?.getReader();
  if (!reader) return { error: "invalid" as const };
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      return { error: "too_large" as const };
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return { body: JSON.parse(new TextDecoder().decode(bytes)) as unknown };
  } catch {
    return { error: "invalid" as const };
  }
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin") ?? "";
  if (!origin || !allowedOrigins.includes(origin)) {
    return new Response("Origin not allowed", { status: 403 });
  }
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: responseHeaders(origin) });
  }
  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." }, origin);
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return jsonResponse(415, { error: "Envie os dados no formato JSON." }, origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const rateLimitSecret = Deno.env.get("CONTACT_RATE_LIMIT_SECRET");
  if (!supabaseUrl || !serviceRoleKey || !rateLimitSecret) {
    console.error("Contact function is missing a required server-side setting.");
    return jsonResponse(503, { error: "O serviço de contato está temporariamente indisponível." }, origin);
  }

  const parsedBody = await readJsonBody(request);
  if ("error" in parsedBody) {
    return jsonResponse(parsedBody.error === "too_large" ? 413 : 400, { error: "Revise os dados enviados." }, origin);
  }

  const input = validate(parsedBody.body);
  if (!input) return jsonResponse(400, { error: "Revise nome, e-mail, empresa e mensagem." }, origin);
  if ("honeypot" in input) return jsonResponse(200, { ok: true }, origin);

  const ip = getClientIp(request);
  if (!ip) return jsonResponse(503, { error: "Não foi possível validar a solicitação com segurança." }, origin);

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const visitorFingerprint = await fingerprint(ip, rateLimitSecret);
  const { data: allowed, error: rateLimitError } = await adminClient.rpc("consume_contact_request_rate_limit", {
    p_visitor_fingerprint: visitorFingerprint,
    p_max_requests: 5,
    p_window_seconds: 3600,
  });

  if (rateLimitError) {
    console.error("Contact rate-limit check failed.", rateLimitError.message);
    return jsonResponse(503, { error: "Não foi possível receber sua mensagem agora." }, origin);
  }
  if (!allowed) return jsonResponse(429, { error: "Muitas solicitações. Aguarde um pouco e tente novamente." }, origin);

  const { error: insertError } = await adminClient.from("contact_requests").insert(input);
  if (insertError) {
    console.error("Contact request insert failed.", insertError.message);
    return jsonResponse(500, { error: "Não foi possível receber sua mensagem agora." }, origin);
  }

  return jsonResponse(201, { ok: true }, origin);
});
