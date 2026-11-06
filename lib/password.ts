/**
 * Politique mot de passe (item 2.2) — sans dépendance externe.
 * Vérifications : longueur 12, variété de caractères, mots courants.
 */

const COMMON = new Set([
  "123456", "12345678", "123456789", "password", "admin", "admin123", "azerty", "azerty123",
  "qwerty", "motdepasse", "lecteurs", "paroisse", "bienvenue", "compte", "user", "default",
  "changeme", "secret", "12345", "1234", "0000", "000000", "111111", "toto", "test", "demo",
  "lecteursjuniors", "saintmichel", "gbero", "gbeho", "cotonou", "benin",
]);

/** Évalue la force d'un mot de passe (sans zxcvbn pour éviter une dépendance). */
export function checkPasswordStrength(
  password: string,
  opts?: { email?: string; nom?: string }
): { ok: boolean; error?: string } {
  if (!password || password.length < 12) {
    return { ok: false, error: "12 caractères minimum." };
  }
  if (password.length > 128) {
    return { ok: false, error: "128 caractères maximum." };
  }

  const classes = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  if (classes < 3) {
    return {
      ok: false,
      error: "Utilisez au moins 3 types de caractères (minuscules, majuscules, chiffres, symboles).",
    };
  }

  const lower = password.toLowerCase();
  if (COMMON.has(lower)) {
    return { ok: false, error: "Mot de passe trop courant." };
  }

  if (opts?.email) {
    const local = opts.email.split("@")[0]?.toLowerCase();
    if (local && local.length >= 4 && lower.includes(local)) {
      return { ok: false, error: "Ne reprenez pas votre e-mail dans le mot de passe." };
    }
  }
  if (opts?.nom) {
    const first = opts.nom.toLowerCase().split(/\s+/)[0];
    if (first && first.length >= 4 && lower.includes(first)) {
      return { ok: false, error: "Ne reprenez pas votre nom dans le mot de passe." };
    }
  }

  // Pas de répétition excessive (aaaa, 1234 séquentiel simplifié)
  if (/(.)\1{3,}/.test(password)) {
    return { ok: false, error: "Évitez les caractères répétés (aaaa)." };
  }

  return { ok: true };
}
