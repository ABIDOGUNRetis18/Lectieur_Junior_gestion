export function normalizeSpaces(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

export function normalizeNom(s: string): string {
  return normalizeSpaces(s).toUpperCase();
}

export function normalizePrenoms(s: string): string {
  return normalizeSpaces(s)
    .split(" ")
    .map((w) => (w.length ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");
}

export function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function normalizeKey(s: string): string {
  return stripAccents(s).toLowerCase().replace(/\s+/g, " ").trim();
}

export function makeCleDoublon(nom: string, prenoms: string, dateNaissance: Date): string {
  return `${normalizeKey(nom)}|${normalizeKey(prenoms)}|${dateNaissance.toISOString().slice(0, 10)}`;
}
