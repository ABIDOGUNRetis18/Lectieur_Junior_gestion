#!/usr/bin/env node
/**
 * Export quotidien de l'audit (item 2.3) — sans dépendance nouvelle (pg déjà présent).
 * Usage : node scripts/export-historique.mjs [YYYY-MM-DD]
 * Sortie : exports/historique-YYYY-MM-DD.json
 */
import "dotenv/config";
import { Pool } from "pg";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const day = process.argv[2] ?? new Date().toISOString().slice(0, 10);
const nextDay = new Date(new Date(day + "T00:00:00.000Z").getTime() + 86400000)
  .toISOString()
  .slice(0, 10);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  const { rows } = await pool.query(
    `SELECT action, details, "utilisateurId", "groupeId", "createdAt"
     FROM "Historique"
     WHERE "createdAt" >= $1 AND "createdAt" < $2
     ORDER BY "createdAt" ASC`,
    [day, nextDay]
  );
  const outDir = join(process.cwd(), "exports");
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `historique-${day}.json`);
  writeFileSync(outFile, JSON.stringify({ exportedAt: new Date().toISOString(), day, count: rows.length, rows }, null, 2));
  console.log(JSON.stringify({ ok: true, file: outFile, count: rows.length }));
} catch (err) {
  console.error(JSON.stringify({ ok: false, error: err.message }));
  process.exit(1);
} finally {
  await pool.end();
}
