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

/**
 * Normalise l'affichage d'un numéro de téléphone selon la convention
 * béninoise : le numéro national commence par 0 et est affiché
 * sous la forme « 01 XX XX XX XX » (ex. +229 97 00 00 00 → « 01 97 00 00 00 »).
 */
export function formatTelephone(s?: string | null): string {
  const digits = (s ?? "").replace(/\D/g, "");
  if (!digits) return "";
  // Retirez le préfixe international 229 si présent (+229 / 00229)
  let core = digits.startsWith("229") ? digits.slice(3) : digits;
  // Retirez le préfixe national 01 (2 chiffres) si présent
  if (core.startsWith("01")) core = core.slice(2);
  // Retirez les zéros de tête restants
  core = core.replace(/^0+/, "");
  // Les numéros béninois font 8 chiffres ; on garde les 8 derniers
  if (core.length > 8) core = core.slice(-8);
  // Donnée trop courte ou malformée : on affiche telle quelle
  if (core.length !== 8) return (s ?? "").trim();
  const pairs = core.match(/.{2}/g) ?? [];
  return `01 ${pairs.join(" ")}`;
}
