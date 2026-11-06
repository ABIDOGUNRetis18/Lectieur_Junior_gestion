import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getRevokedEpoch } from "@/lib/session-revoke";
import { checkRateLimit } from "@/lib/rate-limit";

// Hash factice pour délai constant si l'utilisateur n'existe pas (item 1.3)
const DUMMY_HASH = "$2b$12$invalidhashinvalidhashinvalidhashinvalidha";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, // 8h
  pages: { signIn: "/connexion" },
  providers: [
    Credentials({
      name: "Identifiants paroissiaux",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Rate limiting connexion : 5 échecs / 15 min par e-mail (item 1.2)
        const limit = checkRateLimit(`login:${email.toLowerCase()}`, 5, 15 * 60 * 1000);
        if (!limit.allowed) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { fraternite: true },
        });
        // Délai constant : on compare toujours, même si l'utilisateur n'existe pas
        const hashToCheck = user?.passwordHash ?? DUMMY_HASH;
        const ok = await bcrypt.compare(password, hashToCheck);
        if (!user || !ok) {
          // Tentative échouée sur un compte existant : à tracer
          if (user) {
            await prisma.historique
              .create({
                data: {
                  action: "CONNEXION_ECHOUEE",
                  details: `Tentative de connexion échouée (${user.email})`,
                  utilisateurId: user.id,
                  groupeId: user.groupeId,
                },
              })
              .catch(() => undefined);
          }
          return null;
        }

        // Comptes dormants : bloqué après 90 j sans activité (2.2)
        // Dernière activité = max(updatedAt, dernière CONNEXION). Un reset password relance le compteur (updatedAt).
        const DORMANT_MS = 90 * 24 * 60 * 60 * 1000;
        const lastConnexion = await prisma.historique
          .findFirst({
            where: { utilisateurId: user.id, action: "CONNEXION" },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
          })
          .catch(() => null);
        const lastActivity = Math.max(
          user.updatedAt.getTime(),
          lastConnexion?.createdAt?.getTime() ?? 0
        );
        if (Date.now() - lastActivity > DORMANT_MS) {
          await prisma.historique
            .create({
              data: {
                action: "CONNEXION_ECHOUEE",
                details: `Compte dormant (> 90 j sans activité) — ${user.email}`,
                utilisateurId: user.id,
                groupeId: user.groupeId,
              },
            })
            .catch(() => undefined);
          return null;
        }

        await prisma.historique
          .create({
            data: {
              action: "CONNEXION",
              details: `Connexion réussie (${user.email})`,
              utilisateurId: user.id,
              groupeId: user.groupeId,
            },
          })
          .catch(() => undefined);

        return {
          id: user.id,
          name: user.nom,
          email: user.email,
          role: user.role,
          groupeId: user.groupeId,
          fraterniteId: user.fraterniteId,
        };
      },
    }),
  ],
  callbacks: {
    async authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      // Routes publiques
      if (pathname === "/" || pathname.startsWith("/connexion") || pathname.startsWith("/api/auth") || pathname.startsWith("/api/csp-report") || pathname.startsWith("/rejoindre") || pathname.startsWith("/mot-de-passe-oublie") || pathname.startsWith("/confidentialite")) {
        return true;
      }
      return !!auth;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.groupeId = (user as { groupeId?: string }).groupeId;
        token.fraterniteId = (user as { fraterniteId?: string | null }).fraterniteId;
        token.issuedAt = Date.now();
      }
      // Rafraîchir les données utilisateur depuis la base (groupe/fraternité peuvent changer)
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { id: true, groupeId: true, fraterniteId: true, role: true },
        });
        if (!dbUser) {
          // Utilisateur supprimé → invalider la session
          return null;
        }
        token.id = dbUser.id;
        token.groupeId = dbUser.groupeId;
        token.fraterniteId = dbUser.fraterniteId;
        token.role = dbUser.role;

        // Si issuedAt n'est pas défini (anciens tokens), l'initialiser
        if (!token.issuedAt) {
          token.issuedAt = Date.now();
        }

        // Vérifier si les sessions ont été révoquées
        if (token.groupeId) {
          const revokedAt = await getRevokedEpoch(token.groupeId as string);
          if (revokedAt && revokedAt > (token.issuedAt as number)) {
            return null; // Session invalidée
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.groupeId = token.groupeId as string;
        session.user.fraterniteId = (token.fraterniteId as string | null) ?? null;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  trustHost: true,
});
