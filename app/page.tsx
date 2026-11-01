import Link from "next/link";

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-surface to-secondary/10">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary text-on-primary mb-6 shadow-lg">
            <span className="material-symbols-outlined text-5xl">auto_stories</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-on-surface mb-4">
            Lecteurs Juniors
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Gestion complète des enfants lecteurs de la paroisse : inscriptions, présences, cotisations et suivi annuel.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl">groups</span>
            </div>
            <h3 className="font-label-lg text-label-lg text-on-surface mb-1">Inscriptions</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Gérez les enfants par fraternité
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl">event_available</span>
            </div>
            <h3 className="font-label-lg text-label-lg text-on-surface mb-1">Présences</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Pointage des dimanches
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl">savings</span>
            </div>
            <h3 className="font-label-lg text-label-lg text-on-surface mb-1">Cotisations</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Suivi des contributions
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-on-surface text-center mb-6">
            Que souhaitez-vous faire ?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/inscription"
              className="flex items-center gap-3 p-4 bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="material-symbols-outlined text-3xl text-primary">person_add</span>
              <div>
                <h3 className="font-label-lg text-label-lg text-on-surface">Inscrire des enfants</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Jusqu'à 20 enfants par envoi
                </p>
              </div>
            </Link>
            <Link
              href="/presence"
              className="flex items-center gap-3 p-4 bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="material-symbols-outlined text-3xl text-secondary">fact_check</span>
              <div>
                <h3 className="font-label-lg text-label-lg text-on-surface">Pointer les présences</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Enregistrer la présence du dimanche
                </p>
              </div>
            </Link>
            <Link
              href="/cotisation"
              className="flex items-center gap-3 p-4 bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="material-symbols-outlined text-3xl text-tertiary">payments</span>
              <div>
                <h3 className="font-label-lg text-label-lg text-on-surface">Enregistrer les cotisations</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Suivi des contributions hebdomadaires
                </p>
              </div>
            </Link>
            <Link
              href="/consultation"
              className="flex items-center gap-3 p-4 bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="material-symbols-outlined text-3xl text-primary">analytics</span>
              <div>
                <h3 className="font-label-lg text-label-lg text-on-surface">Consulter les données</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Tableaux, bilans et exports
                </p>
              </div>
            </Link>
            <Link
              href="/import"
              className="flex items-center gap-3 p-4 bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow sm:col-span-2"
            >
              <span className="material-symbols-outlined text-3xl text-secondary">upload_file</span>
              <div>
                <h3 className="font-label-lg text-label-lg text-on-surface">Importer un registre CSV</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Importer des données existantes depuis un fichier
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-on-surface-variant">
          <p className="font-body-sm text-body-sm">
            Système de gestion des Lecteurs Juniors — Paroisse
          </p>
        </div>
      </div>
    </div>
  );
}
