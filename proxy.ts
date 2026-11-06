import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/connexion", "/api/auth", "/rejoindre", "/mot-de-passe-oublie"];

// Redirections basées sur le rôle
const ROLE_REDIRECTS: Record<string, string> = {
  "/administration": "/admin/administration",
  "/historique": "/admin/historique",
  "/parametres": "/admin/parametres",
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublic = pathname === "/" || PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isAuthed = !!req.auth;
  const role = req.auth?.user?.role;

  // Non connecté → rediriger vers connexion
  if (!isAuthed && !isPublic) {
    const url = new URL("/connexion", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Connecté sur /connexion → rediriger vers le bon dashboard
  if (isAuthed && pathname === "/connexion") {
    const target = role === "ADMIN" ? "/admin/tableau-de-bord" : "/responsable/tableau-de-bord";
    return NextResponse.redirect(new URL(target, req.url));
  }

  // Redirections basées sur le rôle
  if (isAuthed) {
    // /tableau-de-bord → dashboard selon le rôle
    if (pathname === "/tableau-de-bord") {
      const target = role === "ADMIN" ? "/admin/tableau-de-bord" : "/responsable/tableau-de-bord";
      return NextResponse.redirect(new URL(target, req.url));
    }

    // Pages admin-only → rediriger vers /admin/* si on n'y est pas déjà
    if (pathname in ROLE_REDIRECTS && role === "ADMIN" && !pathname.startsWith("/admin/")) {
      return NextResponse.redirect(new URL(ROLE_REDIRECTS[pathname], req.url));
    }

    // Un responsable qui tente d'accéder à une page admin → rediriger vers son dashboard
    if (pathname in ROLE_REDIRECTS && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/responsable/tableau-de-bord", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)"],
};