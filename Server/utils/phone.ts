
export function toE164IL(input: string): string {
  if (!input) throw new Error("Phone number is required");

  let p = input.replace(/\D/g, "");

  if (p.startsWith("0")) {
    p = p.slice(1);
  }

  if (!p.startsWith("972")) {
    p = "972" + p;
  }

  return "+" + p;
}
