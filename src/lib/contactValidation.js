export function validateContactRequest(input) {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const company = typeof input.company === "string" ? input.company.trim() : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";

  if (name.length < 2 || name.length > 100) return { valid: false, error: "Informe um nome com até 100 caracteres." };
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { valid: false, error: "Informe um e-mail válido." };
  if (company.length > 160) return { valid: false, error: "O nome da empresa deve ter até 160 caracteres." };
  if (message.length < 10 || message.length > 5000) return { valid: false, error: "A mensagem deve ter entre 10 e 5.000 caracteres." };

  return { valid: true, values: { name, email, company, message } };
}
