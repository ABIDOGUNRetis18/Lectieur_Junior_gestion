"use client";

import { useState } from "react";
import RejoindreForm from "@/components/RejoindreForm";
import { getFraternitesPubliquesAction } from "@/lib/actions/rejoindre";

type Frat = { id: string; nom: string };

export default function CreerCompteModal() {
  const [open, setOpen] = useState(false);
  const [fraternites, setFraternites] = useState<Frat[]>([]);
  const [loading, setLoading] = useState(false);

  function handleOpen() {
    setOpen(true);
    if (fraternites.length === 0) {
      setLoading(true);
      getFraternitesPubliquesAction()
        .then((res) => {
          if (res.ok) setFraternites(res.fraternites);
        })
        .finally(() => setLoading(false));
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="shrink-0 inline-flex items-center justify-center gap-space-xs h-[44px] px-space-sm sm:px-space-md rounded-lg border border-primary-container text-primary-container font-label-lg text-label-lg hover:bg-primary-container hover:text-on-primary transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">person_add</span>
        <span className="hidden sm:inline">Créer un compte</span>
        <span className="sm:hidden">Inscrire</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-space-md"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-space-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-space-sm">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Créer un compte
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
                aria-label="Fermer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            {loading ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">Chargement...</p>
            ) : (
              <RejoindreForm fraternites={fraternites} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
