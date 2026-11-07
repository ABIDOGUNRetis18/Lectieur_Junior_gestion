# CI/CD & protections (item 3.2)

## GitHub — protection de branche `main`

Settings → Rulesets → **New branch ruleset** (recommandé) ou Settings → Branches → Add rule (`main`) :
- [x] Require a pull request before merging
  - Required approvals : **1** (CODEOWNERS compte)
  - Require review from Code Owners : **oui**
  - Dismiss stale reviews : oui
  - Require status checks to pass : **oui** (voir liste ci-dessous)
- [x] Require conversation resolution
- [x] Block force pushes
- [x] Restrict deletions

### Required status checks (noms réels des check-runs)
- `check` (CI : `prisma generate`, `tsc`, `lint`, guards, `audit critical`, `next build`)
- `Secrets (Gitleaks)`
- `Analyze (javascript-typescript)` (CodeQL — Default setup)
- `Analyze (actions)` (CodeQL — Default setup)

> Le SAST n'est **plus** un job de `ci.yml` : il est fourni par le **Default setup** GitHub
> (workflow dynamique « CodeQL »). Un job `init/analyze` custom entrerait en conflit
> (« advanced vs default ») et ferait échouer l'upload SARIF.

Le build doit passer sur ces checks avant merge. ZAP (`zap.yml`) est planifié, non bloquant.

## Vercel — previews protégées

Vercel → Project → Settings → Deployment Protection :
- **Vercel Authentication** : activé (Preview et Production, Deployment Protection = « Vercel Authentication »)
- Seuls les membres de l'équipe Vercel voient les previews. La production reste publique (sondage `/`).

## Environnements séparés dev / prod

| | Dev | Prod |
|---|---|---|
| Neon | Branche `dev` (neon.tech → copy) | Branche `main` |
| `DATABASE_URL` | Neon dev (avec pooler) | Neon prod (avec pooler) |
| Vercel env | `Preview` (Neon dev) | `Production` (Neon prod) |
| `AUTH_SECRET` | différent de la prod | prod uniquement |
| `SMTP_PASS` | aucun (mode dev, code affiché) | mot de passe d'application |

Jamais de prod sur localhost. Les variables Vercel se mettent par environnement (Preview ≠ Production).

## CODEOWNERS

Fichier `.github/CODEOWNERS` : tout chemin sensible (`auth.ts`, `proxy.ts`, `otp.ts`, `mot-de-passe.ts`, `rate-limit.ts`, `password.ts`, `session-revoke.ts`, `next.config.ts`, `.github/`) requiert une review avant merge.
