"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { changerStatutEnfantAction, supprimerEnfantAction, supprimerEnfantsAction } from "@/lib/actions/enfants";
import { confirmDialog } from "@/lib/confirm";
import { toastSuccess, toastError } from "@/lib/toast";
import { CATECHISME_LABELS, formatClasseEcole } from "@/lib/schemas/inscription";
import { formatTelephone } from "@/lib/normalization";

type Enfant = {
  id: string;
  nom: string;
  prenoms: string;
  dateNaissance: Date;
  classeEcole: string;
  serie: string | null;
  classeCatechisme: string;
  telephoneParent: string | null;
  statut: "ACTIF" | "INACTIF";
  fraternite: { nom: string } | null;
  createdAt: Date;
};

type Fraternite = {
  id: string;
  nom: string;
};

interface ChildrenTableProps {
  enfants: Enfant[];
  fraternites: Fraternite[];
}

export default function ChildrenTable({ enfants, fraternites }: ChildrenTableProps) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [frat, setFrat] = useState("");
  const [statut, setStatut] = useState("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Un responsable ne gère qu'une seule fraternité : le filtre serait inutile
  const showFraterniteFilter = fraternites.length > 1;

  const filteredEnfants = useMemo(() => {
    return enfants.filter((enfant) => {
      const matchesSearch =
        q === "" ||
        enfant.nom.toLowerCase().includes(q.toLowerCase()) ||
        enfant.prenoms.toLowerCase().includes(q.toLowerCase());

      const matchesFraternite = frat === "" || enfant.fraternite?.nom === frat;

      const matchesStatut = statut === "ALL" || enfant.statut === statut;

      return matchesSearch && matchesFraternite && matchesStatut;
    });
  }, [enfants, q, frat, statut]);

  const selectedCount = filteredEnfants.filter((e) => selected.has(e.id)).length;
  const allVisibleSelected = filteredEnfants.length > 0 && selectedCount === filteredEnfants.length;
  const someVisibleSelected = selectedCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someVisibleSelected;
  }, [someVisibleSelected]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filteredEnfants.forEach((e) => next.delete(e.id));
      } else {
        filteredEnfants.forEach((e) => next.add(e.id));
      }
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function supprimerEnfantRow(enfant: (typeof enfants)[number]) {
    const confirmed = await confirmDialog({
      title: `Supprimer ${enfant.nom} ${enfant.prenoms} ?`,
      message: "Cette action est irréversible. Les présences et cotisations associées seront également supprimées.",
      confirmLabel: "Supprimer",
      danger: true,
    });
    if (!confirmed) return;
    setBusyId(enfant.id);
    const res = await supprimerEnfantAction(enfant.id);
    setBusyId(null);
    if (res.ok) {
      toastSuccess(res.message);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(enfant.id);
        return next;
      });
      router.refresh();
    } else {
      toastError(res.error);
    }
  }

  async function supprimerSelection() {
    const ids = filteredEnfants.filter((e) => selected.has(e.id)).map((e) => e.id);
    if (ids.length === 0) return;
    const confirmed = await confirmDialog({
      title: `Supprimer ${ids.length} enfant(s) ?`,
      message: "Cette action est irréversible. Toutes les présences et cotisations associées seront également supprimées.",
      confirmLabel: `Supprimer (${ids.length})`,
      danger: true,
    });
    if (!confirmed) return;
    setBulkBusy(true);
    const res = await supprimerEnfantsAction(ids);
    setBulkBusy(false);
    if (res.ok) {
      toastSuccess(res.message);
      clearSelection();
      router.refresh();
    } else {
      toastError(res.error);
    }
  }

  async function changerStatutRow(
    enfant: (typeof enfants)[number],
    statut: "ACTIF" | "INACTIF"
  ) {
    setBusyId(enfant.id);
    const res = await changerStatutEnfantAction(enfant.id, statut);
    setBusyId(null);
    if (res.ok) {
      toastSuccess(res.message);
      router.refresh();
    } else {
      toastError(res.error);
    }
  }

  return (
    <div className="space-y-space-md">
      {/* Filters */}
      <form className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
        <div className={`grid grid-cols-1 gap-space-sm ${showFraterniteFilter ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          <input
            className="h-[44px] rounded-lg border border-outline-variant px-space-sm font-body-md"
            placeholder="Rechercher nom, prénom ou ID…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {showFraterniteFilter && (
            <select
              className="h-[44px] rounded-lg border border-outline-variant px-space-sm font-body-md"
              value={frat}
              onChange={(e) => setFrat(e.target.value)}
            >
              <option value="">Toutes les fraternités</option>
              {fraternites.map((f) => (
                <option key={f.id} value={f.nom}>{f.nom}</option>
              ))}
            </select>
          )}
          <select
            className="h-[44px] rounded-lg border border-outline-variant px-space-sm font-body-md"
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            aria-label="Filtrer par statut"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIF">Actifs</option>
            <option value="INACTIF">Inactifs</option>
          </select>
        </div>
        <div className="text-sm text-on-surface-variant">
          {filteredEnfants.length} enfant{filteredEnfants.length !== 1 ? "s" : ""} affiché{filteredEnfants.length !== 1 ? "s" : ""}
        </div>
      </form>

      {/* Barre d'actions groupées */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-space-sm bg-primary-container/10 border border-primary-container rounded-xl px-space-md py-3">
          <p className="font-label-md text-label-md text-on-surface">
            <span className="font-bold text-primary">{selectedCount}</span> enfant(s) sélectionné(s)
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={clearSelection}
              className="h-[40px] px-space-sm rounded-lg border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-highest transition-colors"
            >
              Tout décocher
            </button>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="h-[40px] px-space-sm rounded-lg border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-highest transition-colors"
            >
              Tout cocher
            </button>
            <button
              type="button"
              onClick={supprimerSelection}
              disabled={bulkBusy}
              className="h-[40px] px-space-md rounded-lg bg-error text-on-error font-label-md text-label-md hover:bg-error/90 transition-colors flex items-center gap-1 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              {bulkBusy ? "Suppression..." : `Supprimer la sélection (${selectedCount})`}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-primary-container">
              <tr>
                <th className="px-3 py-2 text-left whitespace-nowrap">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    aria-label="Cocher tous les enfants affichés"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 accent-[#1e3a8a] cursor-pointer"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-on-primary-container uppercase tracking-wider whitespace-nowrap">
                  Fraternité
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-on-primary-container uppercase tracking-wider whitespace-nowrap">
                  Nom
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-on-primary-container uppercase tracking-wider whitespace-nowrap">
                  Prénom
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-on-primary-container uppercase tracking-wider whitespace-nowrap">
                  Naissance
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-on-primary-container uppercase tracking-wider whitespace-nowrap">
                  Classe
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-on-primary-container uppercase tracking-wider whitespace-nowrap">
                  Catéchisme
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-on-primary-container uppercase tracking-wider whitespace-nowrap">
                  Téléphone
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-on-primary-container uppercase tracking-wider whitespace-nowrap">
                  Inscription
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-on-primary-container uppercase tracking-wider whitespace-nowrap">
                  Statut
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-on-primary-container uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredEnfants.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-3 py-8 text-center text-on-surface-variant">
                    Aucun enfant trouvé
                  </td>
                </tr>
              ) : (
                filteredEnfants.map((enfant) => (
                  <tr
                    key={enfant.id}
                    className="hover:bg-surface-container-highest transition-colors align-middle"
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        aria-label={`Sélectionner ${enfant.nom} ${enfant.prenoms}`}
                        checked={selected.has(enfant.id)}
                        onChange={() => toggleSelect(enfant.id)}
                        className="w-5 h-5 accent-[#1e3a8a] cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-2 text-on-surface whitespace-nowrap text-sm">
                      {enfant.fraternite?.nom ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-on-surface font-medium whitespace-nowrap text-sm">
                      <Link
                        href={`/enfants/${enfant.id}`}
                        className="text-primary hover:underline"
                      >
                        {enfant.nom}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-on-surface whitespace-nowrap text-sm">
                      {enfant.prenoms}
                    </td>
                    <td className="px-3 py-2 text-on-surface whitespace-nowrap text-sm">
                      {new Date(enfant.dateNaissance).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })}
                    </td>
                    <td className="px-3 py-2 text-on-surface whitespace-nowrap text-sm">
                      {formatClasseEcole(enfant.classeEcole, enfant.serie)}
                    </td>
                    <td className="px-3 py-2 text-on-surface whitespace-nowrap text-sm">
                      {CATECHISME_LABELS[enfant.classeCatechisme] ?? enfant.classeCatechisme}
                    </td>
                    <td className="px-3 py-2 text-on-surface whitespace-nowrap text-sm">
                      {formatTelephone(enfant.telephoneParent) || "—"}
                    </td>
                    <td className="px-3 py-2 text-on-surface whitespace-nowrap text-sm">
                      {new Date(enfant.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <select
                        className={`h-[36px] w-full min-w-[110px] max-w-[150px] rounded-lg border font-body-sm text-body-sm px-2 ${
                          enfant.statut === "ACTIF"
                            ? "bg-secondary/10 border-secondary text-secondary"
                            : "bg-error-container/40 border-error text-error"
                        }`}
                        value={enfant.statut}
                        onChange={(e) => changerStatutRow(enfant, e.target.value as "ACTIF" | "INACTIF")}
                        aria-label={`Changer le statut de ${enfant.nom} ${enfant.prenoms}`}
                      >
                        <option value="ACTIF">Actif</option>
                        <option value="INACTIF">Inactif</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/enfants/${enfant.id}`}
                          aria-label={`Modifier ${enfant.nom} ${enfant.prenoms}`}
                          title="Modifier"
                          className="inline-flex items-center justify-center w-[36px] h-[36px] rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">settings</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => supprimerEnfantRow(enfant)}
                          disabled={busyId === enfant.id}
                          aria-label={`Supprimer ${enfant.nom} ${enfant.prenoms}`}
                          title="Supprimer"
                          className="inline-flex items-center justify-center w-[36px] h-[36px] rounded-lg border border-error text-error hover:bg-error-container/40 transition-colors disabled:opacity-60"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
