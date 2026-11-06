import Image from "next/image";
import Link from "next/link";

export const instant = false;

export default function ConfidentialitePage() {
  return (
    <main className="flex flex-col relative w-full bg-surface min-h-screen">
      <div className="p-margin max-w-[720px] mx-auto w-full flex flex-col space-y-space-lg py-space-md">
        <header className="flex flex-col items-center text-center pt-space-md pb-space-xs space-y-space-sm">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-container flex items-center justify-center shadow-sm border border-surface-container-highest/60">
            <Image
              alt="Logo Paroisse Saint-Michel Gbeto"
              className="w-full h-full object-cover"
              src="/logo-saint-michel-carre.webp"
              width={80}
              height={80}
            />
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight font-bold">
            Confidentialité
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Lecteurs Juniors — Paroisse Saint-Michel Gbeto • Cotonou • Archidiocèse de Cotonou, Bénin
          </p>
        </header>

        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm font-body-md text-body-md text-on-surface leading-relaxed">
          <h2 className="font-headline-sm text-headline-sm text-primary">Données traitées</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Enfants inscrits : nom, prénoms, date de naissance, classe d&apos;école, classe de catéchisme, fraternité, téléphone du parent (facultatif).</li>
            <li>Utilisateurs (responsables/admin) : nom complet, e-mail, rôle, fraternité d&apos;affectation.</li>
            <li>Activité : présences dominicales (présent / excusé / absent), cotisations, dates d&apos;inscription et de modification.</li>
            <li>Sécurité : dates de connexion / déconnexion, échecs de connexion, exports — conservées dans l&apos;historique d&apos;audit.</li>
          </ul>

          <h2 className="font-headline-sm text-headline-sm text-primary">Finalité &amp; base légale</h2>
          <p>
            La plateforme gère l&apos;appel dominical, les inscriptions et les cotisations des Lecteurs Juniors.
            L&apos;inscription d&apos;un enfant requiert le <strong>consentement parental</strong> (case à cocher obligatoire,
            tracée dans l&apos;historique avec la date d&apos;inscription).
          </p>

          <h2 className="font-headline-sm text-headline-sm text-primary">Hébergement</h2>
          <p>
            Base de données Neon (PostgreSQL, Union européenne), site hébergé sur Vercel.
            Les e-mails OTP sont envoyés via SMTP Gmail. Aucune revente de données, aucune publicité.
          </p>

          <h2 className="font-headline-sm text-headline-sm text-primary">Durée de conservation</h2>
          <p>
            Les données des enfants sont conservées tant qu&apos;ils sont actifs. Après désactivation, elles restent
            disponibles pour l&apos;administrateur ; la suppression définitive (droit à l&apos;oubli) est possible sur demande
            et est journalisée dans l&apos;historique. L&apos;audit est exporté quotidiennement et conservé 90 jours hors ligne.
          </p>

          <h2 className="font-headline-sm text-headline-sm text-primary">Vos droits</h2>
          <p>
            Vous pouvez demander l&apos;accès, la rectification ou la suppression des données d&apos;un enfant :
            contactez le secrétariat paroissial. Toute demande de suppression est exécutée sous 30 jours
            et tracée dans l&apos;historique (`SUPPRESSION`).
          </p>

          <h2 className="font-headline-sm text-headline-sm text-primary">Contact</h2>
          <p>
            Secrétariat paroissial — Paroisse Saint-Michel Gbeto, Cotonou, Bénin.
            Archidiocèse de Cotonou • Bénin.
          </p>
        </div>

        <Link
          href="/"
          className="w-full h-[52px] min-h-[52px] border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors flex items-center justify-center space-x-1 gap-space-sm"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
