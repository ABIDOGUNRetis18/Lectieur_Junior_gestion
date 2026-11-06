import { logger } from "@/lib/logger";

/**
 * Reçoit les violations CSP (Content-Security-Policy-Report-Only) et les logge en JSON.
 * En prod, le browser POSTe un body JSON avec `csp-report` — on ne le stocke pas, on logge.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (body) {
      logger.warn("csp_violation", {
        report: (body as { "csp-report"?: unknown })["csp-report"] ?? body,
      });
    }
  } catch {
    // ignore — ne jamais faire échouer la requête
  }
  return Response.json({ ok: true }, { status: 200 });
}
