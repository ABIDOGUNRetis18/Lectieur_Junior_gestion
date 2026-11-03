"use client";

import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrateur",
  RESPONSABLE: "Responsable",
  FRATERNITE: "Fraternité",
};

const NAV = [
  { href: "/enfants", label: "Enfants", icon: "groups" },
  { href: "/presence", label: "Présence", icon: "fact_check" },
  { href: "/cotisation", label: "Cotisation", icon: "payments" },
  { href: "/consultation", label: "Consultation", icon: "menu_book" },
];

export default function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role ?? "";
  const roleLabel = ROLE_LABEL[role] ?? role;
  const isAdmin = role === "ADMIN";

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-primary/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.12)]">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm max-w-lg mx-auto">
          <div className="flex items-center gap-space-sm min-w-0 flex-1">
            <Link href="/tableau-de-bord" className="flex items-center gap-space-sm min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Logo Paroisse Saint-Michel Gbeto"
                className="h-9 w-9 rounded-lg object-cover flex-shrink-0"
                src="/logo-saint-michel-carre.webp"
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-lg text-label-lg text-on-primary truncate tracking-tight">
                    Lecteurs Juniors
                  </span>
                  <span className="px-space-xs py-0.5 bg-secondary text-on-secondary rounded-full font-label-sm text-label-sm flex-shrink-0">
                    St-Michel Gbeto
                  </span>
                </div>
                <div className="flex items-center gap-space-xs mt-0.5">
                  <span className="font-headline-sm text-headline-sm text-surface-container-high truncate">
                    {title}
                  </span>
                  {roleLabel && (
                    <span className="inline-block px-1.5 py-0.2 bg-primary-container text-primary-fixed font-label-sm text-label-sm rounded uppercase">
                      {roleLabel}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-space-xs flex-shrink-0">
            <Link
              href="/tableau-de-bord"
              aria-label="Tableau de bord"
              className="w-11 h-11 rounded-full flex items-center justify-center text-primary-fixed-dim hover:text-on-primary hover:bg-primary-container/60 transition-colors"
              title="Tableau de bord"
            >
              <span className="material-symbols-outlined text-[22px]">dashboard</span>
            </Link>
            <button
              aria-label="Déconnexion"
              className="w-11 h-11 rounded-full flex items-center justify-center text-primary-fixed-dim hover:text-on-primary hover:bg-primary-container/60 transition-colors"
              title="Déconnexion"
              onClick={() => signOut({ callbackUrl: "/connexion" })}
            >
              <span className="material-symbols-outlined text-[22px]">logout</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col relative w-full pt-16 pb-24 bg-surface min-h-screen">
        <div className="flex flex-col w-full pb-28">{children}</div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
        <div className="flex justify-around items-stretch h-16 px-space-xs max-w-lg mx-auto">
          {[
            ...NAV,
            ...(isAdmin ? [{ href: "/historique", label: "Historique", icon: "history" }] : []),
          ].map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-space-xs transition-colors ${
                  active
                    ? "text-primary font-label-md"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                <span className="font-label-sm text-label-sm mt-0.5">{item.label}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
