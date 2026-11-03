import Link from "next/link";

const PILIERS = [
  {
    icon: "how_to_reg",
    titre: "Inscriptions & accords parentaux",
    texte:
      "Enregistrement des enfants par fraternité, détection automatique des doublons et traçabilité du consentement des parents.",
    note: "Dossier numérique certifié",
  },
  {
    icon: "touch_app",
    titre: "Appel dominical en 1 clic",
    texte:
      "Pointage rapide Présent / Permission / Absent, pensé pour un smartphone avant la messe.",
    note: "Pointage en moins de 2 minutes",
  },
  {
    icon: "payments",
    titre: "Cotisations transparentes",
    texte:
      "Suivi hebdomadaire de la cotisation par enfant et total de caisse instantané pour la trésorière.",
    note: "Reçus et totaux nets",
  },
  {
    icon: "table_chart",
    titre: "Registre & bilans",
    texte:
      "Vue mensuelle des présences, bilan annuel par enfant, export Excel et PDF pour les réunions.",
    note: "Rapports prêts à l'emploi",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-container-lowest/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 max-w-7xl mx-auto px-margin md:px-margin-desktop flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-primary-container flex items-center justify-center flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Logo Paroisse Saint-Michel Gbeto"
                className="w-full h-full object-cover"
                src="/logo-saint-michel-carre.webp"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-primary-container leading-none">
                Lecteurs Juniors
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase mt-space-xs">
                Paroisse Saint-Michel Gbeto
              </span>
            </div>
          </div>
          <Link
            href="/connexion"
            className="inline-flex items-center justify-center gap-space-xs h-[44px] px-space-md rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            <span className="hidden sm:inline">Accéder à l&apos;espace</span>
            <span className="sm:hidden">Connexion</span>
          </Link>
        </div>
      </header>

      <main className="w-full">
        {/* Hero */}
        <section className="bg-gradient-to-b from-surface to-surface-container-low pt-space-xl pb-16">
          <div className="max-w-7xl mx-auto px-margin md:px-margin-desktop">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
              <div className="lg:col-span-7 flex flex-col items-start">
                <div className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container-high text-primary-container font-label-sm text-label-sm tracking-wide uppercase mb-space-md">
                  <span className="material-symbols-outlined text-[16px] text-primary-container">church</span>
                  <span>Ministère liturgique paroissial</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-primary-container tracking-tight max-w-2xl">
                  L&apos;engagement liturgique de nos jeunes, simplifié et structuré.
                </h1>
                <p className="mt-space-md font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                  La plateforme de gestion des fraternités, des présences dominicales et des
                  cotisations des Lecteurs Juniors au service de la liturgie dominicale.
                </p>

                <div className="mt-space-xl flex flex-wrap items-center gap-space-md w-full sm:w-auto">
                  <Link
                    href="/connexion"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-space-sm h-[52px] px-space-xl rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">login</span>
                    <span>Accéder à l&apos;espace de gestion</span>
                  </Link>
                </div>

                <div className="mt-space-xl pt-space-md flex flex-wrap items-center gap-space-sm w-full">
                  <div className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-full bg-surface-container-lowest text-on-surface shadow-sm">
                    <span className="material-symbols-outlined text-secondary text-[18px]">group_work</span>
                    <span className="font-label-md text-label-md text-primary-container">5 fraternités</span>
                  </div>
                  <div className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-full bg-surface-container-lowest text-on-surface shadow-sm">
                    <span className="material-symbols-outlined text-secondary text-[18px]">bolt</span>
                    <span className="font-label-md text-label-md text-primary-container">Appel rapide</span>
                  </div>
                  <div className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-full bg-surface-container-lowest text-on-surface shadow-sm">
                    <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
                    <span className="font-label-md text-label-md text-primary-container">
                      Cotisations suivies
                    </span>
                  </div>
                </div>
              </div>

              {/* Aperçu de l'appel */}
              <div className="lg:col-span-5 w-full flex justify-center">
                <div className="w-full max-w-md bg-surface-container-lowest rounded-xl p-space-md shadow-xl">
                  <div className="flex items-center justify-between pb-space-sm mb-space-sm bg-surface-container-low -mx-space-md -mt-space-md p-space-md">
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase block">
                        Appel du dimanche
                      </span>
                      <span className="font-headline-sm text-headline-sm text-primary-container">
                        Fraternité Saint-Michel
                      </span>
                    </div>
                    <span className="px-space-xs py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                      En cours
                    </span>
                  </div>

                  <div className="flex flex-col gap-space-sm">
                    {[
                      { init: "K", nom: "Koffi Michel", detail: "1ère lecture · 100 F réglés", etat: "P" },
                      { init: "A", nom: "Ayaba Marie-Grâce", detail: "Psaume · 100 F réglés", etat: "P" },
                      { init: "S", nom: "Sèna Emmanuel", detail: "2ème lecture · En attente", etat: "Pe" },
                    ].map((l) => (
                      <div
                        key={l.nom}
                        className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-lg"
                      >
                        <div className="flex items-center gap-space-sm min-w-0">
                          <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-headline-sm text-headline-sm flex-shrink-0">
                            {l.init}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-body-md text-body-md text-on-surface font-semibold truncate">
                              {l.nom}
                            </span>
                            <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                              {l.detail}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {(["P", "Pe", "A"] as const).map((e) => (
                            <span
                              key={e}
                              className={`w-7 h-7 rounded flex items-center justify-center font-label-md text-label-md ${
                                e === l.etat
                                  ? e === "P"
                                    ? "bg-secondary text-on-secondary"
                                    : e === "Pe"
                                      ? "bg-on-tertiary-container text-on-primary"
                                      : "bg-error text-on-error"
                                  : "bg-surface-container text-on-surface-variant opacity-40"
                              }`}
                            >
                              {e}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-space-md p-space-sm bg-surface-container rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-space-xs text-primary-container font-label-md text-label-md">
                      <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                      <span>Caisse de la fraternité</span>
                    </div>
                    <span className="font-headline-sm text-headline-sm text-primary-container font-bold">
                      14 200 F CFA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Les 4 piliers */}
        <section className="w-full bg-surface-container-low py-16">
          <div className="max-w-7xl mx-auto px-margin md:px-margin-desktop">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-space-xl">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-container px-space-sm py-space-xs rounded bg-surface-container-high mb-space-sm">
                Architecture pratique
              </span>
              <h2 className="font-headline-lg text-headline-lg text-primary-container">
                Les 4 piliers de l&apos;application
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
                Une réponse taillée sur mesure pour les réalités pastorales de nos paroisses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg">
              {PILIERS.map((p) => (
                <div
                  key={p.titre}
                  className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary-container mb-space-md">
                    <span className="material-symbols-outlined text-[26px]">{p.icon}</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-primary-container">{p.titre}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm flex-grow">
                    {p.texte}
                  </p>
                  <div className="mt-space-md pt-space-sm flex items-center gap-space-xs text-primary-container font-label-md text-label-md">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>{p.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="w-full bg-primary-container text-on-primary py-16 shadow-inner">
          <div className="max-w-7xl mx-auto px-margin md:px-margin-desktop text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-on-primary/10 flex items-center justify-center mb-space-md text-on-primary">
              <span className="material-symbols-outlined text-[28px]">notifications_active</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg max-w-xl text-on-primary">
              Prêt pour la messe de ce dimanche ?
            </h2>
            <p className="font-body-lg text-body-lg text-surface-container-high max-w-2xl mt-space-sm">
              Connectez-vous avec vos identifiants pour ouvrir la feuille d&apos;appel et préparer la
              proclamation des textes sacrés.
            </p>
            <div className="mt-space-xl">
              <Link
                href="/connexion"
                className="inline-flex items-center justify-center gap-space-sm h-[52px] px-space-xl rounded-lg bg-surface-container-lowest text-primary-container font-label-lg text-label-lg shadow-lg hover:bg-surface-container-low transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">lock_open</span>
                <span>Ouvrir ma session</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low text-on-surface-variant py-space-xl">
        <div className="max-w-7xl mx-auto px-margin md:px-margin-desktop">
          <div className="flex flex-col md:flex-row items-center justify-between gap-space-lg">
            <div className="flex items-center gap-space-sm">
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-primary-container flex items-center justify-center flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Logo Paroisse Saint-Michel Gbeto"
                  className="w-full h-full object-cover"
                  src="/logo-saint-michel-carre.webp"
                />
              </div>
              <span className="font-label-lg text-label-lg text-primary-container">
                Paroisse Saint-Michel Gbeto • Cotonou
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-center md:text-right">
              © 2025 Paroisse · Guilde liturgique des jeunes lecteurs. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
