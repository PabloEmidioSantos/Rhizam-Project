export function validateContactRequest(input) {
  const values = input && typeof input === "object" ? input : {};
  const name = typeof values.name === "string" ? values.name.trim() : "";
  const email = typeof values.email === "string" ? values.email.trim().toLowerCase() : "";
  const company = typeof values.company === "string" ? values.company.trim() : "";
  const message = typeof values.message === "string" ? values.message.trim() : "";

  if (name.length < 2 || name.length > 100) return { valid: false, error: "Informe um nome com até 100 caracteres." };
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { valid: false, error: "Informe um e-mail válido." };
  if (company.length > 160) return { valid: false, error: "O nome da empresa deve ter até 160 caracteres." };
  if (message.length < 10 || message.length > 5000) return { valid: false, error: "A mensagem deve ter entre 10 e 5.000 caracteres." };

  return { valid: true, values: { name, email, company, message } };
}
