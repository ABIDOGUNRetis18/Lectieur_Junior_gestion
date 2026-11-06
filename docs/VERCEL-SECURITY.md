# Sécurité Vercel (item 3.3)

## WAF managé (Vercel)
Vercel → Project → Settings → WAF :
- Managed Rules : **activées** (OWASP Managed Ruleset + Vercel Firewall Rules)
- Règle custom : rate limit sur `/api/auth/*` (5 / 15 min / IP) si l'API rate limiting applicatif ne suffit pas
- Vérification : Vercel → Settings → WAF → Attack logs, doit montrer les tentatives bloquées

## BotID (Vercel Bot Protection)
Vercel → Project → Settings → Bot Protection (si plan Pro/Enterprise) :
- Activer sur `/connexion`, `/rejoindre`, `/mot-de-passe-oublie`
- Mode : challenge agressif sur les bots (pas de blocage aveugle des utilisateurs légitimes)
- Intégration code (optionnel) : `import { checkBot } from "@/bot"` dans `proxy.ts` — reporté tant que le plan ne l’inclut pas

## CSP : report-only → enforce
1. `Content-Security-Policy` (enforce, actuelle) : `default-src 'self'` + `unsafe-inline`/`unsafe-eval` (requis par Next/Tailwind)
2. `Content-Security-Policy-Report-Only` (stricte, sans `unsafe-*`) : en place, violations loggées via `/api/csp-report` → `logger.warn("csp_violation")` → Vercel Log Explorer
3. Surveiller 2 semaines : filtrer les violations légitimes (fonts Google, logo `https:`)
4. Passer la stricte en enforce lorsqu’aucune violation légitime ne reste (nonces Next.js à prévoir)

## IP allowlist (optionnel, `/admin/*`)
Si l’équipe paroissiale a des IP fixes : Vercel → Settings → IP Allowlist sur le projet,
avec une règle « Allowlist » limitée à `/admin/*`. Sinon, rester sur l’auth applicative (déjà rate limited).

## Tableau de bord à surveiller
- Vercel → Observability : taux 5xx sur `/api/auth/*`, latence P95, spikes de trafic bot
- Neon → Alerting : latence DB, connexions
- `historique` : `CONNEXION_ECHOUEE` > 10 / 15 min (voir `docs/BACKUP-RESPONSE.md`)
