"use client";

/**
 * Frontière d'erreur de dernier recours (erreur dans le layout racine).
 * Message strictement générique : aucune donnée technique exposée.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f1ea",
          color: "#1a3a5c",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: "100%",
            textAlign: "center",
            background: "#ffffff",
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          <h1 style={{ fontSize: 20, margin: "0 0 12px" }}>Une erreur est survenue</h1>
          <p style={{ fontSize: 14, lineHeight: 1.5, color: "#5b6b7c", margin: "0 0 20px" }}>
            Le service est momentanément indisponible. Réessayez dans un instant.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              height: 44,
              padding: "0 20px",
              borderRadius: 8,
              border: "none",
              background: "#1a3a5c",
              color: "#ffffff",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
          {error.digest ? (
            <p style={{ fontSize: 11, color: "#8a97a5", marginTop: 16 }}>
              Référence : {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
