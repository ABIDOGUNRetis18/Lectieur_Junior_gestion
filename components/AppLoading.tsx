/**
 * Squelette de navigation pour les pages authentifiées.
 *
 * Il reprend la structure de `AppShell` (sidebar desktop, barre mobile) afin
 * d'éviter un saut visuel quand Next.js affiche le fallback de `loading.tsx`
 * pendant le streaming des données serveur.
 */
export default function AppLoading() {
  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="hidden lg:flex flex-col w-64 bg-surface-container-lowest border-r border-outline-variant fixed h-full">
        <div className="p-4 border-b border-outline-variant flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            aria-hidden="true"
            className="h-10 w-10 rounded-lg object-cover"
            src="/logo-saint-michel-carre.webp"
          />
          <div className="space-y-1.5">
            <div className="h-3 w-28 rounded bg-surface-container-high animate-pulse" />
            <div className="h-2.5 w-20 rounded bg-surface-container-high animate-pulse" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-11 rounded-lg bg-surface-container-high/60 animate-pulse"
            />
          ))}
        </div>
      </aside>

      <div className="flex-1 min-w-0 lg:ml-64 flex flex-col">
        <header className="hidden lg:block bg-primary/95 h-16" />
        <main className="flex-1 lg:pt-0 pt-16 pb-24 lg:pb-6 px-4 lg:px-6">
          <div className="max-w-7xl mx-auto py-4 lg:py-6 space-y-space-md">
            <div className="h-8 w-56 rounded-lg bg-surface-container-high animate-pulse" />
            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm space-y-space-sm">
              <div className="h-5 w-40 rounded bg-surface-container-high animate-pulse" />
              <div className="h-24 rounded-lg bg-surface-container-high/70 animate-pulse" />
            </div>
            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm space-y-space-sm">
              <div className="h-5 w-32 rounded bg-surface-container-high animate-pulse" />
              <div className="h-48 rounded-lg bg-surface-container-high/70 animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
