import "server-only";

/**
 * Logger structuré JSON (item 2.3) — sans dépendance.
 * Chaque ligne est parsable par Vercel Log Explorer / jq.
 * Ne jamais logger de secret (mot de passe, token, code OTP).
 */

type Level = "info" | "warn" | "error";

type Fields = Record<string, unknown>;

function log(level: Level, message: string, fields?: Fields) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(fields ?? {}),
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, fields?: Fields) => log("info", message, fields),
  warn: (message: string, fields?: Fields) => log("warn", message, fields),
  error: (message: string, fields?: Fields) => log("error", message, fields),
};

/** ID de corrélation (un par requête, propagé dans les logs). */
export function newRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
