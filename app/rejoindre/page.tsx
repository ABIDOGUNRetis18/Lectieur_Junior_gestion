import Image from "next/image";
import { connection } from "next/server";
import { getFraternitesPubliquesAction } from "@/lib/actions/rejoindre";
import RejoindreForm from "@/components/RejoindreForm";
import Link from "next/link";

export const instant = false;

export default async function RejoindrePage() {
  await connection();
  const res = await getFraternitesPubliquesAction();
  const fraternites = res.ok ? res.fraternites : [];

  return (
    <main className="flex flex-col relative w-full bg-surface min-h-screen">
      <div className="p-margin max-w-[480px] mx-auto w-full flex flex-col space-y-space-lg">
        {/* Brand & Parish Header */}
        <header className="flex flex-col items-center text-center pt-space-md pb-space-xs space-y-space-sm">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-container flex items-center justify-center shadow-sm border border-surface-container-highest/60">
            <Image
              alt="Logo Paroisse Saint-Michel Gbeto"
              className="w-full h-full object-cover"
              src="/logo-saint-michel-carre.webp"
              width={80}
              height={80}
              priority
            />
          </div>
          <div className="space-y-1">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight font-bold">
              Lecteurs Juniors
            </h1>
            <div className="flex items-center justify-center space-x-1.5 text-on-surface-variant font-label-md text-label-md">
              <span className="material-symbols-outlined text-[15px] text-surface-tint">church</span>
              <span>Paroisse Saint-Michel Gbeto • Cotonou</span>
            </div>
          </div>
        </header>

        <RejoindreForm fraternites={fraternites} />

        {/* Bouton retour accueil */}
        <Link
          href="/"
          className="w-full h-[52px] min-h-[52px] border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors flex items-center justify-center space-x-1 gap-space-sm"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          Retour à l&apos;accueil
        </Link>

        {/* Support & Pastoral Office Footer Note */}
        <footer className="text-center pt-space-md pb-space-lg space-y-1 text-on-surface-variant/80">
          <p className="font-body-sm text-body-sm text-outline">
            Besoin d&apos;aide ? Contactez le secrétariat paroissial.
          </p>
          <p className="font-label-sm text-label-sm tracking-wide text-outline">
            Archidiocèse de Cotonou • Bénin
          </p>
        </footer>
      </div>
    </main>
  );
}
