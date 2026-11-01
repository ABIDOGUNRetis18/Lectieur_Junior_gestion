import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/connexion", "/api/auth"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublic = pathname === "/" || PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isAuthed = !!req.auth;

  if (!isAuthed && !isPublic) {
    const url = new URL("/connexion", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthed && pathname === "/connexion") {
    return NextResponse.redirect(new URL("/presence", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)"],
};
