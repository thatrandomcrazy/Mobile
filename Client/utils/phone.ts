export function normalizeILPhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("972")) return `+${digits}`;
  if (digits.startsWith("0")) return `+972${digits.slice(1)}`;
  if (digits.startsWith("5")) return `+972${digits}`;
  return `+${digits}`;
}

export function isValidILMobile(normalized: string) {
  return /^\+9725\d{8}$/.test(normalized);
}
