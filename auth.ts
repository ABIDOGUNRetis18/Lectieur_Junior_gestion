import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

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
        const user = await prisma.user.findUnique({
          where: { email },
          include: { fraternite: true },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.groupeId = (user as { groupeId?: string }).groupeId;
        token.fraterniteId = (user as { fraterniteId?: string | null }).fraterniteId;
      }
      // Rafraîchir les données utilisateur depuis la base (groupe/fraternité peuvent changer)
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { id: true, groupeId: true, fraterniteId: true, role: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.groupeId = dbUser.groupeId;
          token.fraterniteId = dbUser.fraterniteId;
          token.role = dbUser.role;
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
