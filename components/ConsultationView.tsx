"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { tracerExportAction } from "@/lib/actions/session";

type Enfant = { id: string; nom: string; prenoms: string; fraterniteId: string; fraterniteNom: string };
type Data = {
  filters: { annee: number; mois: number | null; fraterniteId: string | null };
  dimanches: string[];
  enfants: Enfant[];
  presenceMap: Record<string, Record<string, string>>;
  cotisationMap: Record<string, Record<string, number>>;
  bilan: Record<string, { present: number; permission: number; absent: number; taux: number; cotisationTotal: number }>;
  totauxParDimanche: Record<string, { present: number; permission: number; absent: number; cotisation: number }>;
  cotisationParFrat: Record<string, number>;
  cotisationParMois: Record<number, number>;
  fraternites: { id: string; nom: string }[];
  montantCotisation: number;
};

const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const PILL: Record<string, string> = {
  PRESENT: "bg-secondary-container text-on-secondary-container",
  PERMISSION: "bg-tertiary-fixed text-on-tertiary-fixed",
  ABSENT: "bg-error-container text-on-error-container",
};
const PILL_TXT: Record<string, string> = { PRESENT: "P", PERMISSION: "E", ABSENT: "A" };

export default function ConsultationView({ data }: { data: Data }) {
  const router = useRouter();
  const [annee, setAnnee] = useState(data.filters.annee);
  const [mois, setMois] = useState<string>(data.filters.mois ? String(data.filters.mois) : "");
  const [frat, setFrat] = useState(data.filters.fraterniteId ?? "");

  // Un responsable n'a qu'une fraternité : le filtre serait inutile
  const showFraterniteFilter = data.fraternites.length > 1;

  function apply() {
    const params = new URLSearchParams();
    params.set("annee", String(annee));
    if (mois) params.set("mois", mois);
    if (frat) params.set("fraternite", frat);
    router.push(`/consultation?${params.toString()}`);
  }

  // --- Export Excel ---
  async function exportExcel() {
    // Traçage best-effort : un échec ne doit pas bloquer l'export
    await tracerExportAction("EXCEL", data.filters.annee).catch(() => undefined);
    const exportedAt = new Date().toLocaleString("fr-FR");
    const wb = XLSX.utils.book_new();
    // Feuille d'info (filigrane / traçabilité)
    const wsInfo = XLSX.utils.aoa_to_sheet([
      ["Export Lecteurs Juniors"],
      ["Consultation", data.filters.annee],
      ["Exporté le", exportedAt],
      ["Filtres", `Mois : ${data.filters.mois ?? "Toute l'année"} — Fraternité : ${data.filters.fraterniteId ?? "Toutes"}`],
      ["Document confidentiel — ne pas diffuser hors de la paroisse."],
    ]);
    XLSX.utils.book_append_sheet(wb, wsInfo, "Info");
    // Feuille présence
    const header = ["Nom", "Prénoms", "Fraternité", ...data.dimanches.map((d) => d), "P", "Perm", "A"];
    const rows = data.enfants.map((e) => {
      const b = data.bilan[e.id];
      return [
        e.nom,
        e.prenoms,
        e.fraterniteNom,
        ...data.dimanches.map((d) => PILL_TXT[data.presenceMap[e.id]?.[d] ?? ""] ?? "-"),
        b?.present ?? 0,
        b?.permission ?? 0,
        b?.absent ?? 0,
      ];
    });
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "Présences");

    // Feuille cotisations
    const cHeader = ["Nom", "Prénoms", "Fraternité", ...data.dimanches.map((d) => d), "Total"];
    const cRows = data.enfants.map((e) => [
      e.nom,
      e.prenoms,
      e.fraterniteNom,
      ...data.dimanches.map((d) => data.cotisationMap[e.id]?.[d] ?? 0),
      data.bilan[e.id]?.cotisationTotal ?? 0,
    ]);
    const ws2 = XLSX.utils.aoa_to_sheet([cHeader, ...cRows]);
    XLSX.utils.book_append_sheet(wb, ws2, "Cotisations");

    // Bilan annuel
    const bHeader = ["Nom", "Prénoms", "Présents", "Permissions", "Absents", "Taux %", "Cotisation totale"];
    const bRows = data.enfants.map((e) => {
      const b = data.bilan[e.id];
      return [e.nom, e.prenoms, b?.present ?? 0, b?.permission ?? 0, b?.absent ?? 0, (b?.taux ?? 0) + "%", b?.cotisationTotal ?? 0];
    });
    const ws3 = XLSX.utils.aoa_to_sheet([bHeader, ...bRows]);
    XLSX.utils.book_append_sheet(wb, ws3, "Bilan annuel");

    XLSX.writeFile(wb, `consultation_${data.filters.annee}.xlsx`);
  }

  // --- Export PDF ---
  async function exportPDF() {
    await tracerExportAction("PDF", data.filters.annee).catch(() => undefined);
    const exportedAt = new Date().toLocaleString("fr-FR");
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text(`Consultation ${data.filters.annee}`, 14, 14);
    doc.setFontSize(8);
    doc.text(`Exporté le ${exportedAt} — Document confidentiel Lecteurs Juniors`, 14, 19);
    const head = [["Nom", "Prénoms", ...data.dimanches.map((d) => d.slice(5)), "P", "Perm", "A"]];
    const body = data.enfants.map((e) => {
      const b = data.bilan[e.id];
      return [
        e.nom,
        e.prenoms,
        ...data.dimanches.map((d) => PILL_TXT[data.presenceMap[e.id]?.[d] ?? ""] ?? "-"),
        String(b?.present ?? 0),
        String(b?.permission ?? 0),
        String(b?.absent ?? 0),
      ];
    });
    autoTable(doc, {
      head,
      body,
      startY: 24,
      styles: { fontSize: 8 },
      didParseCell: () => {},
    });
    // Pied de page sur chaque page (filigrane)
    const pageCount = doc.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFontSize(7);
      doc.text(`Lecteurs Juniors — Confidentiel — Exporté le ${exportedAt} — Page ${p}/${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 8, { align: "center" });
    }
    doc.save(`consultation_${data.filters.annee}.pdf`);
  }

  return (
    <div className="px-margin py-space-md space-y-space-lg">
      {/* Filtres */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
        <h2 className="font-headline-sm text-headline-sm text-primary">Filtres</h2>
        <div className={`grid grid-cols-1 gap-space-sm ${showFraterniteFilter ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          <div className="space-y-space-xs">
            <label className="block font-label-md text-label-md text-on-surface">Année</label>
            <select className="w-full h-[44px] rounded-lg border border-outline-variant px-space-sm" value={annee} onChange={(e) => setAnnee(Number(e.target.value))}>
              {[data.filters.annee - 1, data.filters.annee, data.filters.annee + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="space-y-space-xs">
            <label className="block font-label-md text-label-md text-on-surface">Mois</label>
            <select className="w-full h-[44px] rounded-lg border border-outline-variant px-space-sm" value={mois} onChange={(e) => setMois(e.target.value)}>
              <option value="">Toute l&apos;année</option>
              {MOIS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          {showFraterniteFilter && (
            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface">Fraternité</label>
              <select className="w-full h-[44px] rounded-lg border border-outline-variant px-space-sm" value={frat} onChange={(e) => setFrat(e.target.value)}>
                <option value="">Toutes</option>
                {data.fraternites.map((f) => (
                  <option key={f.id} value={f.id}>{f.nom}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-space-sm pt-1">
          <button onClick={apply} className="h-[44px] px-space-md rounded-lg bg-primary-container text-on-primary font-label-md">
            Appliquer
          </button>
          <button onClick={exportExcel} className="h-[44px] px-space-md rounded-lg bg-secondary text-on-secondary font-label-md">
            Export Excel
          </button>
          <button onClick={exportPDF} className="h-[44px] px-space-md rounded-lg bg-surface-container-high text-on-surface font-label-md">
            Export PDF
          </button>
        </div>
      </section>

      {/* Tableau présence mensuel */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm overflow-x-auto">
        <h2 className="font-headline-sm text-headline-sm text-primary">
          Présences — {data.filters.mois ? MOIS[data.filters.mois - 1] : "Année"} {data.filters.annee}
        </h2>
        {data.enfants.length === 0 ? (
          <p className="font-body-sm text-on-surface-variant">Aucun enfant.</p>
        ) : (
          <table className="min-w-[720px] w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left p-2 font-label-md sticky left-0 bg-surface-container-lowest z-10">Nom</th>
                <th className="text-left p-2 font-label-md">Prénoms</th>
                {data.dimanches.map((d) => (
                  <th key={d} className="p-2 font-label-sm text-center">{d.slice(8)}</th>
                ))}
                <th className="p-2 font-label-sm text-center">P</th>
                <th className="p-2 font-label-sm text-center">Perm</th>
                <th className="p-2 font-label-sm text-center">A</th>
              </tr>
            </thead>
            <tbody>
              {data.enfants.map((e) => {
                const b = data.bilan[e.id];
                return (
                  <tr key={e.id} className="border-b border-outline-variant/50">
                    <td className="p-2 font-body-md sticky left-0 bg-surface-container-lowest z-10">{e.nom}</td>
                    <td className="p-2 font-body-md">{e.prenoms}</td>
                    {data.dimanches.map((d) => {
                      const etat = data.presenceMap[e.id]?.[d];
                      return (
                        <td key={d} className="p-2 text-center">
                          {etat ? (
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${PILL[etat]}`}>
                              {PILL_TXT[etat]}
                            </span>
                          ) : (
                            <span className="text-outline">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-2 text-center font-bold text-secondary">{b?.present ?? 0}</td>
                    <td className="p-2 text-center font-bold text-tertiary">{b?.permission ?? 0}</td>
                    <td className="p-2 text-center font-bold text-error">{b?.absent ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-outline">
                <td className="p-2 font-label-md" colSpan={2}>Total</td>
                {data.dimanches.map((d) => {
                  const t = data.totauxParDimanche[d];
                  return (
                    <td key={d} className="p-2 text-center text-xs">
                      {t ? `${t.present}/${t.permission}/${t.absent}` : "-"}
                    </td>
                  );
                })}
                <td className="p-2 text-center font-bold">
                  {data.enfants.reduce((s, e) => s + (data.bilan[e.id]?.present ?? 0), 0)}
                </td>
                <td className="p-2 text-center font-bold">
                  {data.enfants.reduce((s, e) => s + (data.bilan[e.id]?.permission ?? 0), 0)}
                </td>
                <td className="p-2 text-center font-bold">
                  {data.enfants.reduce((s, e) => s + (data.bilan[e.id]?.absent ?? 0), 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </section>

      {/* Bilan annuel par enfant */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm overflow-x-auto">
        <h2 className="font-headline-sm text-headline-sm text-primary">Bilan annuel par enfant ({data.filters.annee})</h2>
        <table className="min-w-[560px] w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="text-left p-2 font-label-md sticky left-0 bg-surface-container-lowest z-10">Nom</th>
              <th className="text-left p-2 font-label-md">Prénoms</th>
              <th className="p-2 font-label-sm text-center">Présents</th>
              <th className="p-2 font-label-sm text-center">Permissions</th>
              <th className="p-2 font-label-sm text-center">Absences</th>
              <th className="p-2 font-label-sm text-center">Taux</th>
              <th className="p-2 font-label-sm text-center">Cotisation</th>
            </tr>
          </thead>
          <tbody>
            {data.enfants.map((e) => {
              const b = data.bilan[e.id];
              return (
                <tr key={e.id} className="border-b border-outline-variant/50">
                  <td className="p-2 font-body-md sticky left-0 bg-surface-container-lowest z-10">{e.nom}</td>
                  <td className="p-2 font-body-md">{e.prenoms}</td>
                  <td className="p-2 text-center">{b?.present ?? 0}</td>
                  <td className="p-2 text-center">{b?.permission ?? 0}</td>
                  <td className="p-2 text-center">{b?.absent ?? 0}</td>
                  <td className="p-2 text-center font-bold">{b?.taux ?? 0}%</td>
                  <td className="p-2 text-center">{b?.cotisationTotal ?? 0} F</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Cotisations par fraternité et par mois */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
        <h2 className="font-headline-sm text-headline-sm text-primary">Cotisations</h2>
        <div className={`grid grid-cols-1 gap-space-md ${showFraterniteFilter ? "sm:grid-cols-2" : ""}`}>
          {showFraterniteFilter && (
            <div>
              <h3 className="font-label-md text-label-md text-on-surface mb-1">Par fraternité (année)</h3>
              <ul className="space-y-1">
                {data.fraternites.map((f) => (
                  <li key={f.id} className="flex justify-between font-body-sm">
                    <span>{f.nom}</span>
                    <span className="font-bold">{data.cotisationParFrat[f.id] ?? 0} F</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h3 className="font-label-md text-label-md text-on-surface mb-1">Par mois (année)</h3>
            <ul className="space-y-1">
              {MOIS.map((m, i) => {
                const v = data.cotisationParMois[i + 1] ?? 0;
                if (v === 0) return null;
                return (
                  <li key={i} className="flex justify-between font-body-sm">
                    <span>{m}</span>
                    <span className="font-bold">{v} F</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
