import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/connexion", "/api/auth", "/api/csp-report", "/rejoindre", "/mot-de-passe-oublie", "/confidentialite"];

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

  // ID de corrélation propagé dans les logs (item 2.3)
  const requestId = req.headers.get("x-request-id") ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  req.headers.set("x-request-id", requestId);

  const respond = (res: NextResponse) => {
    res.headers.set("x-request-id", requestId);
    return res;
  };

  // Non connecté → rediriger vers connexion
  if (!isAuthed && !isPublic) {
    const url = new URL("/connexion", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return respond(NextResponse.redirect(url));
  }

  // Connecté sur /connexion → rediriger vers le bon dashboard
  if (isAuthed && pathname === "/connexion") {
    const target = role === "ADMIN" ? "/admin/tableau-de-bord" : "/responsable/tableau-de-bord";
    return respond(NextResponse.redirect(new URL(target, req.url)));
  }

  // Redirections basées sur le rôle
  if (isAuthed) {
    // /tableau-de-bord → dashboard selon le rôle
    if (pathname === "/tableau-de-bord") {
      const target = role === "ADMIN" ? "/admin/tableau-de-bord" : "/responsable/tableau-de-bord";
      return respond(NextResponse.redirect(new URL(target, req.url)));
    }

    // Pages admin-only → rediriger vers /admin/* si on n'y est pas déjà
    if (pathname in ROLE_REDIRECTS && role === "ADMIN" && !pathname.startsWith("/admin/")) {
      return respond(NextResponse.redirect(new URL(ROLE_REDIRECTS[pathname], req.url)));
    }

    // Un responsable qui tente d'accéder à une page admin → rediriger vers son dashboard
    if (pathname in ROLE_REDIRECTS && role !== "ADMIN") {
      return respond(NextResponse.redirect(new URL("/responsable/tableau-de-bord", req.url)));
    }
  }

  return respond(NextResponse.next());
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)"],
};