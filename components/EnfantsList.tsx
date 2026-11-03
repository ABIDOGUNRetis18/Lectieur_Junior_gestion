"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Enfant = {
  id: string;
  numero: number;
  nom: string;
  prenoms: string;
  fraterniteId: string;
  fraterniteNom: string;
  statut: string;
  classeEcole: string;
  telephoneParent: string | null;
};

type Props = {
  enfants: Enfant[];
  fraternites: { id: string; nom: string }[];
  filters: { q: string; fraternite: string; statut: string };
};

export default function EnfantsList({ enfants, fraternites, filters }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(filters.q);
  const [frat, setFrat] = useState(filters.fraternite);
  const [statut, setStatut] = useState(filters.statut);

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (frat) params.set("fraternite", frat);
    if (statut && statut !== "ALL") params.set("statut", statut);
    router.push(`/enfants?${params.toString()}`);
  }

  return (
    <div className="px-margin py-space-md space-y-space-md">
      <form
        onSubmit={apply}
        className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
          <input
            className="h-[44px] rounded-lg border border-outline-variant px-space-sm font-body-md"
            placeholder="Rechercher nom ou prénom…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="h-[44px] rounded-lg border border-outline-variant px-space-sm font-body-md"
            value={frat}
            onChange={(e) => setFrat(e.target.value)}
          >
            <option value="">Toutes les fraternités</option>
            {fraternites.map((f) => (
              <option key={f.id} value={f.id}>{f.nom}</option>
            ))}
          </select>
          <select
            className="h-[44px] rounded-lg border border-outline-variant px-space-sm font-body-md"
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIF">Actifs</option>
            <option value="INACTIF">Inactifs</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="h-[44px] px-space-md rounded-lg bg-primary-container text-on-primary font-label-md"
          >
            Filtrer
          </button>
        </div>
      </form>

      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
        <h2 className="font-headline-sm text-headline-sm text-primary">
          {enfants.length} enfant(s)
        </h2>
        {enfants.length === 0 ? (
          <p className="font-body-sm text-on-surface-variant">Aucun enfant ne correspond.</p>
        ) : (
          <ul className="divide-y divide-outline-variant/50">
            {enfants.map((e) => (
              <li key={e.id} className="py-space-sm flex items-center justify-between gap-space-sm">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/enfants/${e.id}`}
                    className="font-body-md text-on-surface font-semibold hover:text-primary truncate block"
                  >
                    LJ-{String(e.numero).padStart(3, "0")} — {e.nom} {e.prenoms}
                  </Link>
                  <p className="font-body-sm text-on-surface-variant truncate">
                    {e.fraterniteNom} · {e.classeEcole}
                    {e.statut === "INACTIF" && (
                      <span className="ml-2 text-error font-label-sm">(inactif)</span>
                    )}
                  </p>
                </div>
                <Link
                  href={`/enfants/${e.id}`}
                  className="shrink-0 h-[36px] px-space-sm rounded-lg border border-outline-variant font-label-sm text-label-sm"
                >
                  Voir
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
