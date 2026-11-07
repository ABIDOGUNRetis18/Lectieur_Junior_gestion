# Roadmap DevSecOps — Lecteurs Juniors

> Méthode (d'après Stéphane Robert) : pas de « sécurisé » sans preuve. Chaque exigence → contrôle vérifiable.
> Statuts : `[ ]` todo — `[~]` en cours — `[x]` fait + vérifié (build + test navigateur)

**Repo** : Next.js 16, Prisma, NextAuth v5, Neon Postgres, Vercel, OTP e-mail (SMTP 465).

---

## État actuel (déjà en place — ne pas perdre)

- [x] Auth credentials + bcrypt 12, JWT 8h, refresh de rôle/fraternité depuis la DB
- [x] Révocation globale des sessions (`lib/session-revoke.ts`, epoch en base, vérifiée dans callback JWT)
- [x] OTP chiffré AES-256-GCM, cookie httpOnly, TTL 10 min, purpose isolé (`inscription` / `reset_password` / `changement_email`), vérification MX
- [x] Validation zod centralisée, `assertFraterniteInGroup` côté serveur (scope responsable forcé)
- [x] Audit trail `historique` (connexions, échecs, exports, profils, comptes, révocations)
- [x] `server-only` dans les modules sensibles, pas de dépendance nouvelle inutile
- [x] SMTP Gmail port 465 TLS direct (app password), fallback dev (code affiché)
- [x] `.env` jamais commité (`.env*` ignoré sauf `.env.example`)

---

## P0 — Critique (semaine 1)

### 1.1 Headers HTTP de sécurité
- [x] `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- [x] `X-Content-Type-Options: nosniff`
- [x] `Referrer-Policy: strict-origin-when-cross-origin`
- [x] `X-Frame-Options: DENY`
- [x] `Permissions-Policy` minimale (camera, microphone, geolocation coupés)
- [~] `Content-Security-Policy` stricte (v1 avec `unsafe-inline` pour Tailwind/Google Fonts, à durcir avec nonces en P2)
- Preuve : `curl -I http://localhost:3000/connexion` montre les 6 headers — `next.config.ts`, `tsc` 0 erreur, `lint` 0 erreur, `next build` OK

### 1.2 Rate limiting auth & OTP
- [x] Connexion : 5 tentatives / 15 min par e-mail (`lib/rate-limit.ts` en mémoire, `auth.ts`)
- [x] OTP inscription/reset : 3 codes / 15 min par e-mail, max 5 essais de code avant expiration (`attempts` dans le cookie chiffré)
- Preuve : 4ᵉ demande OTP bloquée — « Trop de tentatives. Réessayez dans 15 minutes. » ; build OK
- Note : compte en mémoire par instance (Vercel multi-instance non partagé) — migration Upstash Redis en P2

### 1.3 Délai constant + anti-énumération
- [x] `authorize` : `bcrypt.compare` factice si user inexistant (délai constant, `DUMMY_HASH` dans `auth.ts`)
- Preuve : même chemin bcrypt pour e-mail inexistant et mot de passe faux ; `tsc`/`lint`/`build` OK

### 1.4 Secrets & supply chain
- [x] Vérifié `git log -S <valeur SMTP_PASS>` → vide ; seul le nom `SMTP_PASS` apparaît dans `.env.example` (placeholder). `.env` jamais suivi.
- [x] Runbook rotation : `docs/RUNBOOK-SECRETS.md` (rotation 90 j + incidents AUTH_SECRET/DATABASE/SMTP)
- [x] `npm audit` en CI (`.github/workflows/ci.yml`) : fail sur **critical**, warn sur high ; lockfile commité, `npm ci`
- Risque accepté documenté : `xlsx@0.18.5` a 1 CVE high (Prototype Pollution / ReDoS, pas de fix upstream) — usage serveur uniquement sur import CSV utilisateur ; migration `exceljs` à planifier en P1
- Preuve : `npm audit --audit-level=critical` exit 0

### 1.5 Injection / IDOR / CSRF (revue)
- [x] Aucun `$queryRaw`/`executeRaw`, aucun `dangerouslySetInnerHTML` — vérifié par grep, bloqué en CI
- [x] Chaque requête DB inclut `groupeId` de la session / `assertFraterniteInGroup` (audit `enfants.ts`, `presence.ts`, `cotisation.ts`, `inscription.ts`, `comptes.ts` : `findFirst({ id, groupeId })` + check `session.user.fraterniteId`)
- Note : `rejoindre.ts` `findUnique({ id: fraterniteId })` volontairement global (inscription publique, groupe dérivé de la fraternité) ; `mot-de-passe.ts` confiance dans le cookie chiffré `userId`
- [x] `sameSite=lax` + `secure` en prod sur tous les cookies, préfixe `__Secure-` (vérifié `auth.ts` + `lib/otp.ts`)
- Preuve : grep CI vide, `tsc`/`lint`/`next build` OK

---

## P1 — Important

### 2.1 Durcissement OTP
- [x] Stocké `sha256(code)` dans le cookie chiffré (`hashOtpCode`/`verifyOtpCode` en temps constant), le clair ne part que par e-mail. Appliqué à inscription, reset, changement e-mail + renvois (`attempts` réinitialisé)
- [x] Doc SPF/DKIM/DMARC : `docs/EMAIL-AUTH.md` (Gmail signe déjà en natif ; procédure domaine propre si migration) — vérifié `dig TXT _dmarc.gmail.com` + `gmail.com`
- Preuve : test navigateur inscription OTP — code faux → « Code incorrect. (1/5 tentatives) », code hashé vérifié en temps constant ; `tsc`/`lint`/`next build` OK

### 2.2 Politique mot de passe
- [x] 12 car. min (zod + `minLength` client partout), variété 3/4 classes, mots courants, anti-e-mail/nom, anti-répétition (`lib/password.ts`, serveur partout : inscription, création compte, reset admin, mot de passe oublié, profil)
- Note : historique des 3 derniers **non implémenté** — impossible sans migration (`PasswordHistory` requise, `schema.prisma` intouchable). Garde-fou actuel : `bcrypt.compare` contre l'actuel uniquement.
- [~] Historique des 3 derniers mots de passe — **reporté/bloqué** (migration interdite) ; à reprendre si le schéma peut évoluer
- [x] Comptes dormants : blocage `authorize` après 90 j sans activité (`max(updatedAt, dernière CONNEXION)`), log `CONNEXION_ECHOUEE`, reset admin rouvre (via `updatedAt`)
- [ ] 2FA : OTP à chaque connexion admin (step-up) — différé, l'OTP e-mail inscription/reset couvre déjà le risque
- Preuve : test navigateur inscription `aaaaaaaaaaaa` rejeté (« Utilisez au moins 3 types… ») ; `tsc`/`lint`/`next build` OK

### 2.3 Observabilité & réponse
- [x] Logs structurés JSON (`lib/logger.ts`, jamais de secret) + ID de corrélation `x-request-id` dans `proxy.ts` (visible `curl -I`)
- [~] Alertes documentées (`docs/BACKUP-RESPONSE.md`) : Vercel Notifications 5xx/auth, spike `CONNEXION_ECHOUEE`, Neon latence — à câbler dans le dashboard Vercel/Neon
- [x] Audit immuable : `DELETE historique` introuvable par grep (0 résultat, 21 `create`), export quotidien `scripts/export-historique.mjs` (testé : 42 lignes)
- [~] Backup Neon PITR documenté dans `docs/BACKUP-RESPONSE.md` ; test de restauration mensuel à planifier (action manuelle)
- [x] Runbook « fuite AUTH_SECRET » dans `docs/RUNBOOK-SECRETS.md` (rotation + révocation totale)
- Preuve : `curl -I localhost:3000/connexion` → `x-request-id`, `exports/historique-2026-11-06.json` généré, `tsc`/`lint`/`next build` OK

### 2.4 Confidentialité & RGPD (données mineurs !)
- [x] Consentement parental tracé dans `historique` (`inscription.ts` + `import.ts` : « (consentement parental donné) »)
- [x] Droit à l'oubli : suppression hard-delete déjà en place (`supprimerEnfantAction` / `supprimerCompteAction` + ligne d'audit) + export d'accès (`exporterDonneesEnfantAction`, `export-historique.mjs`) — procédure ≤ 30 j dans `docs/DPA.md`
- [x] Minimisation : `telephoneParent` optionnel confirmé, règle d'anonymisation des exports documentée
- [x] Page `/confidentialite` publique (données, hébergement, droits) + `docs/DPA.md` (Neon/Vercel/Google)
- Preuve : `curl confidentialite` 200, `tsc`/`lint`/`next build` OK

### 2.5 Upload / exports
- [x] Import CSV : limite serveur 5 Mo + 2000 lignes, Excel 2000 lignes max, texte seul (jamais d'exécution) — client déjà 5 Mo
- [~] Scan antivirus : **non implémenté / reporté** — pas de nouveau service externe (règle « pas de dépendances ») ; mitigation : parsing texte seul + limites de taille + zod strict par cellule
- [x] Exports Excel/PDF : filigrane (feuille `Info` Excel, en-tête + pied de page PDF : « Confidentiel — Exporté le … »), déjà journalisés
- Pagination : `historique` déjà limité à 200 avec filtres, `consultation` filtre par année (bornée) — aucun `take: 1000` de lignes métier
- Preuve : `tsc`/`lint`/`next build` OK, dev server OK

---

## P2 — Durcissement

### 3.1 SAST / DAST / SCA en CI
- [x] SAST : **CodeQL via le Default setup GitHub** (workflow dynamique `CodeQL`, check-runs `Analyze (javascript-typescript)` + `Analyze (actions)`) — le job custom `sast` a été retiré de `ci.yml` (conflit SARIF « advanced vs default »)
- [x] SCA : Dependabot hebdo (`.github/dependabot.yml`, max 10 PR) + `npm audit` déjà en CI
- [x] Secrets : Gitleaks `@v3` en job `secrets` (historique complet `fetch-depth: 0`)
- [x] DAST : ZAP baseline hebdo (`zap.yml`, `zaproxy/action-baseline@v0.15.0`, lundi 03:00 UTC, `fail_action: true`, OWASP Top 10) — sur le build CI (PAS sur prod, pour ne pas scanner les vraies données)
- [x] Règle : `export const dynamic = force-dynamic` interdit par grep bloquant en CI (NONE aujourd'hui)
- Preuve : CodeQL #1/#2 verts (checks `Analyze (actions)` et `Analyze (javascript-typescript)`), YAML valide (`python yaml`), CI verte sur `cd919b9`, `tsc`/`lint`/`next build` OK

### 3.2 CI/CD
- [x] Fichier `CODEOWNERS` (auth, otp, mot-de-passe, proxy, session-revoke, rate-limit, password, next.config, .github) + doc protection de branche (`docs/CI-CD.md`)
- [x] Checks obligatoires documentés (`check`, `Secrets (Gitleaks)`, `Analyze (javascript-typescript)` — noms réels des check-runs) — à cocher dans Settings → Rulesets (ou Branches)
- [x] Previews protégées documentées (Vercel Authentication, Production publique) + environnements dev/prod séparés (Neon dev vs prod, AUTH_SECRET distincts)
- Preuve : `CODEOWNERS` + `docs/CI-CD.md` committés, checks réels relevés via l'API GitHub (`check`, `Secrets (Gitleaks)`, `Analyze (actions)`, `Analyze (javascript-typescript)`), CI verte sur `cd919b9`

### 3.3 Infra Vercel
- [x] `Content-Security-Policy-Report-Only` stricte (sans `unsafe-*`, `report-uri /api/csp-report`) — **envoyée uniquement en production** (`NODE_ENV=production`, pour éviter le bruit dev Turbopack/zod) ; testée via `next start` + `curl -I`, violations `csp_violation` loggées en JSON
- [~] WAF Vercel + BotID + IP allowlist documentés (`docs/VERCEL-SECURITY.md`) — actions dashboard manuelles (Managed Rules, Bot Protection sur `/connexion`/`/rejoindre`/`/mot-de-passe-oublie`, allowlist `/admin/*` optionnelle)
- Preuve : `curl -I` (serveur `next start`, prod) montre les 2 CSP, `POST /api/csp-report` → `{"ok":true}` + ligne `csp_violation` en JSON, `tsc`/`lint`/`next build` OK

---

## Journal des_implémentations

| Date | Item | Commande / preuve | Note |
|---|---|---|---|
| 2026-11-06 | 1.1 Headers HTTP | `next.config.ts`, `curl -I localhost:3000/connexion`, `tsc`/`lint`/`next build` OK | CSP v1 : `unsafe-inline` nécessaire pour Tailwind/Fonts ; durcissement nonces en P2 |
| 2026-11-06 | 1.2 Rate limiting + 1.3 Délai constant | `lib/rate-limit.ts`, `auth.ts`, `rejoindre.ts`, `mot-de-passe.ts`, test navigateur OTP bloqué à 3, `tsc`/`lint`/`next build` OK | Mémoire par instance ; Upstash Redis en P2 |
| 2026-11-06 | 1.4 Secrets & supply chain | `docs/RUNBOOK-SECRETS.md`, `.github/workflows/ci.yml`, `npm audit --audit-level=critical` exit 0, git value search vide | Risque accepté : `xlsx` high sans fix upstream, migration exceljs en P1 |
| 2026-11-06 | 1.5 Injection / IDOR / CSRF | grep `queryRaw\|executeRaw\|dangerouslySetInnerHTML` → NONE, audit `enfants/presence/cotisation/inscription/comptes`, `sameSite=lax` + `secure` OK, build OK | CI bloquante ajoutée ; `rejoindre` global volontaire |
| 2026-11-06 | 2.1 Durcissement OTP | `lib/otp.ts` (`hashOtpCode`/`verifyOtpCode`, `timingSafeEqual`), 3 flux migrés, `docs/EMAIL-AUTH.md`, test navigateur `(1/5)` OK, build OK | Anciens cookies OTP invalidés (à refaire) ; SPF/DKIM Gmail natif |
| 2026-11-06 | 2.2 Politique mot de passe | `lib/password.ts`, zod 12 car. + `minLength` 12 partout, `auth.ts` dormant 90 j, test navigateur rejet faible OK, build OK | Historique 3 derniers reporté (migration requise) ; 2FA admin différée |
| 2026-11-06 | 2.3 Observabilité & réponse | `lib/logger.ts`, `proxy.ts` (`x-request-id`), `docs/BACKUP-RESPONSE.md`, `scripts/export-historique.mjs`, `curl -I` + export 42 lignes OK, build OK | Alertes + PITR test byte in-dashboard (doc) |
| 2026-11-06 | 2.4 Confidentialité & RGPD | `app/confidentialite/page.tsx`, `docs/DPA.md`, `historique` consentement, `proxy`/`auth` publics, `curl confidentialite` OK, build OK | Consentement tracé texte ; `telephoneParent` déjà optionnel |
| 2026-11-06 | 2.5 Upload / exports | `lib/actions/import.ts` (5 Mo + 2000 lignes), `ConsultationView.tsx` (filigrane Excel/PDF), build OK | Antivirus reporté (pas de nouveau service) |
| 2026-11-06 | 3.1 SAST / DAST / SCA | `.github/workflows/ci.yml` (CodeQL + Gitleaks + force-dynamic guard), `zap.yml` (hebdo), `dependabot.yml`, YAML OK, build OK | ZAP sur build CI (PAS sur prod) |
| 2026-11-06 | 3.2 CI/CD | `.github/CODEOWNERS`, `docs/CI-CD.md`, jobs CI vérifiés, build OK | Actions dashboard manuelles (GitHub/Vercel) documentées |
| 2026-11-06 | 3.3 Infra Vercel | `next.config.ts` (CSP report-only), `app/api/csp-report/route.ts`, `docs/VERCEL-SECURITY.md`, `curl -I` + POST report OK, build OK | WAF/BotID/allowlist en dashboard ; CSP enforce après 2 sem. de monitoring (zod eval vu en report-only) |
| 2026-11-07 | Vérification complète roadmap | Audit fichier par fichier + `tsc`/`lint`/`npm audit critical`/`next build` OK ; CI GitHub verte sur `cd919b9` (`check`, `Secrets`, `Analyze (actions)`, `Analyze (javascript-typescript)`) ; headers vérifiés via `next start` | Corrections : cookie OTP préfixé `__Secure-` en prod ; actions CI `checkout@v6`/`setup-node@v6`/`gitleaks@v3`/ZAP `v0.15.0` (runtime Node 24) ; roadmap alignée sur le Default setup CodeQL |
| | | | |

---

## Références
- Stéphane Robert — méthodologie par compétences, preuve par l'état (DSOXLab), clouds souverains (SOCLE)
- OWASP Top 10, OWASP ASVS L2, RGPD
