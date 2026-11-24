export function isPrivilegedSupabaseKey(key) {
  if (!key) return false;
  if (/^(sb_secret_|service_role)/i.test(key)) return true;

  const payloadSegment = key.split(".")[1];
  if (!payloadSegment) return false;

  try {
    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")));
    return payload.role === "service_role";
  } catch {
    return false;
  }
}
