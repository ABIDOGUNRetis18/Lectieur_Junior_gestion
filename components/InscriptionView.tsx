"use client";

import { useState } from "react";
import InscriptionForm from "@/components/InscriptionForm";
import ImportForm from "@/components/ImportForm";

type Props = {
  fraternites: { id: string; nom: string }[];
};

export default function InscriptionView({ fraternites }: Props) {
  const [mode, setMode] = useState<"manuel" | "import">("manuel");

  return (
    <div className="space-y-space-md">
      <div className="flex gap-space-xs bg-surface-container-low rounded-xl p-1 mx-margin mt-space-md">
        <button
          type="button"
          onClick={() => setMode("manuel")}
          className={`flex-1 h-[44px] rounded-lg font-label-md text-label-md transition-all ${
            mode === "manuel"
              ? "bg-primary-container text-on-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[18px] align-middle mr-1">edit_note</span>
          Saisie manuelle
        </button>
        <button
          type="button"
          onClick={() => setMode("import")}
          className={`flex-1 h-[44px] rounded-lg font-label-md text-label-md transition-all ${
            mode === "import"
              ? "bg-primary-container text-on-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[18px] align-middle mr-1">upload_file</span>
          Importer un fichier
        </button>
      </div>

      {mode === "manuel" ? (
        <InscriptionForm fraternites={fraternites} />
      ) : (
        <ImportForm fraternites={fraternites} />
      )}
    </div>
  );
}
