"use client";

import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Toaster from "@/components/Toaster";
import ConfirmDialog from "@/components/ConfirmDialog";
import { tracerDeconnexionAction } from "@/lib/actions/session";

/** Trace la déconnexion puis détruit la session (best-effort). */
async function handleSignOut() {
  try {
    await tracerDeconnexionAction();
  } catch {
    // ignore : la déconnexion doit toujours réussir
  }
  await signOut({ callbackUrl: "/connexion" });
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrateur",
  RESPONSABLE: "Responsable",
  FRATERNITE: "Fraternité",
};

const NAV_BASE = [
  { href: "/responsable/tableau-de-bord", label: "Tableau de bord", short: "Accueil", icon: "dashboard" },
  { href: "/inscription", label: "Inscription", short: "Inscription", icon: "person_add" },
  { href: "/presence", label: "Présence", short: "Présence", icon: "fact_check" },
  { href: "/cotisation", label: "Cotisation", short: "Cotisation", icon: "payments" },
  { href: "/consultation", label: "Consultation", short: "Consultation", icon: "menu_book" },
  { href: "/import", label: "Import", short: "Import", icon: "upload_file" },
  { href: "/profil", label: "Profil", short: "Profil", icon: "person" },
];

const NAV_ADMIN = [
  { href: "/admin/tableau-de-bord", label: "Tableau de bord", short: "Accueil", icon: "dashboard" },
  { href: "/inscription", label: "Inscription", short: "Inscription", icon: "person_add" },
  { href: "/presence", label: "Présence", short: "Présence", icon: "fact_check" },
  { href: "/cotisation", label: "Cotisation", short: "Cotisation", icon: "payments" },
  { href: "/consultation", label: "Consultation", short: "Consultation", icon: "menu_book" },
  { href: "/import", label: "Import", short: "Import", icon: "upload_file" },
  { href: "/admin/administration", label: "Administration", short: "Admin", icon: "admin_panel_settings" },
  { href: "/admin/parametres", label: "Paramètres", short: "Param.", icon: "settings" },
  { href: "/admin/historique", label: "Historique", short: "Historique", icon: "history" },
  { href: "/profil", label: "Profil", short: "Profil", icon: "person" },
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
  const nav = isAdmin ? NAV_ADMIN : NAV_BASE;

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar - Desktop only */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface-container-lowest border-r border-outline-variant fixed h-full">
        <div className="p-4 border-b border-outline-variant">
          <Link href={isAdmin ? "/admin/tableau-de-bord" : "/responsable/tableau-de-bord"} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Logo Paroisse Saint-Michel Gbeto"
              className="h-10 w-10 rounded-lg object-cover"
              src="/logo-saint-michel-carre.webp"
            />
            <div>
              <div className="font-label-lg text-label-lg text-primary">Lecteurs Juniors</div>
              <div className="text-xs text-on-surface-variant">St-Michel Gbeto</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-primary-container text-primary font-label-md"
                    : "text-on-surface-variant hover:bg-surface-container-highest"
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-outline-variant">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[20px]">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-body-md text-on-surface truncate">{session?.user?.name}</div>
              <div className="text-sm text-on-surface-variant">{roleLabel}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 lg:ml-64 flex flex-col">
        {/* Top App Bar - Mobile only */}
        <header className="lg:hidden fixed top-0 w-full z-50 pt-safe bg-primary/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.12)]">
          <div className="h-16 px-margin flex items-center justify-between gap-space-sm max-w-lg mx-auto">
            <div className="flex items-center gap-space-sm min-w-0 flex-1">
              <Link href={isAdmin ? "/admin/tableau-de-bord" : "/responsable/tableau-de-bord"} className="flex items-center gap-space-sm min-w-0">
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
                    <span className="hidden sm:inline-block px-space-xs py-0.5 bg-secondary text-on-secondary rounded-full font-label-sm text-label-sm flex-shrink-0">
                      St-Michel Gbeto
                    </span>
                  </div>
                  <div className="flex items-center gap-space-xs mt-0.5">
                    <span className="font-headline-sm text-headline-sm text-surface-container-high truncate">
                      {title}
                    </span>
                    {roleLabel && (
                      <span className="hidden min-[380px]:inline-block px-1.5 py-0.2 bg-primary-container text-primary-fixed font-label-sm text-label-sm rounded uppercase">
                        {roleLabel}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-space-xs flex-shrink-0">
              <button
                aria-label="Déconnexion"
                className="w-11 h-11 rounded-full flex items-center justify-center text-primary-fixed-dim hover:text-on-primary hover:bg-primary-container/60 transition-colors"
                title="Déconnexion"
                onClick={handleSignOut}
              >
                <span className="material-symbols-outlined text-[22px]">logout</span>
              </button>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </div>
            </div>
          </div>
        </header>

        {/* Desktop header */}
        <header className="hidden lg:block bg-primary/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.12)]">
          <div className="h-16 px-6 flex items-center justify-between">
            <h1 className="font-headline-sm text-headline-sm text-on-primary">{title}</h1>
            {roleLabel && (
              <span className="inline-block px-3 py-1 bg-primary-container text-primary-fixed font-label-sm text-label-sm rounded uppercase">
                {roleLabel}
              </span>
            )}
          </div>
        </header>

        <main className="flex-1 lg:pt-0 pt-16 pb-24 lg:pb-6 px-4 lg:px-6">
          <div className="max-w-7xl mx-auto py-4 lg:py-6">{children}</div>
        </main>

        {/* Bottom Nav - Mobile only */}
        <nav className="lg:hidden fixed bottom-0 w-full z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
          <div className="flex items-stretch h-16 px-space-xs max-w-lg mx-auto overflow-x-auto overscroll-x-contain">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex-1 shrink-0 min-w-[56px] px-1 flex flex-col items-center justify-center min-h-[48px] py-space-xs transition-colors ${
                    active
                      ? "text-primary font-label-md"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                  <span className="font-label-sm text-label-sm mt-0.5 whitespace-nowrap">
                    {item.short}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
      <Toaster />
      <ConfirmDialog />
    </div>
  );
}