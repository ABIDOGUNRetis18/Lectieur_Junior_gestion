function detectDelimiter(text: string): "," | ";" {
  const firstLine = text.split(/\r?\n/).find((l) => l.trim() !== "") ?? "";
  let commas = 0;
  let semicolons = 0;
  let inQuotes = false;
  for (const c of firstLine) {
    if (c === '"') inQuotes = !inQuotes;
    else if (!inQuotes) {
      if (c === ",") commas++;
      else if (c === ";") semicolons++;
    }
  }
  return semicolons > commas ? ";" : ",";
}

export function parseCsv(text: string): string[][] {
  text = text.replace(/^\uFEFF/, "");
  const delimiter = detectDelimiter(text);
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const len = text.length;

  function pushField() {
    current.push(field);
    field = "";
  }
  function pushRow() {
    // skip completely empty rows
    if (current.length > 0 && current.some((c) => c.trim() !== "")) {
      rows.push(current);
    }
    current = [];
  }

  while (i < len) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        field += c;
        i++;
        continue;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (c === delimiter) {
        pushField();
        i++;
        continue;
      } else if (c === "\n") {
        pushField();
        pushRow();
        i++;
        continue;
      } else if (c === "\r") {
        // handle CRLF
        if (text[i + 1] === "\n") {
          i++;
          continue;
        }
        pushField();
        pushRow();
        i++;
        continue;
      } else {
        field += c;
        i++;
        continue;
      }
    }
  }
  // last field/row
  if (field !== "" || current.length > 0) {
    pushField();
    pushRow();
  }
  return rows;
}

export function normalizeHeader(h: string): string {
  return h
    .replace(/^\uFEFF/, "")
    .replace(/\u00A0/g, " ")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const CLASSE_ECOLE_MAP: Record<string, string> = {
  "avant le cm1": "AVANT_CM1", "avant cm1": "AVANT_CM1", "cm1": "CM1", "cm2": "CM2",
  "6eme": "SIXIEME", "6ème": "SIXIEME", "sixieme": "SIXIEME", "6e": "SIXIEME",
  "5eme": "CINQUIEME", "5ème": "CINQUIEME", "cinquieme": "CINQUIEME", "5e": "CINQUIEME",
  "4eme": "QUATRIEME", "4ème": "QUATRIEME", "quatrieme": "QUATRIEME", "4e": "QUATRIEME",
  "3eme": "TROISIEME", "3ème": "TROISIEME", "troisieme": "TROISIEME", "3e": "TROISIEME",
  "seconde": "SECONDE", "premiere": "PREMIERE", "première": "PREMIERE", "terminale": "TERMINALE",
  "etudes superieures": "SUPERIEUR", "études supérieures": "SUPERIEUR", "superieur": "SUPERIEUR",
  "master 2 securite informatique": "SUPERIEUR", "master 2 sécurité informatique": "SUPERIEUR",
  "scolarite terminee": "TERMINEE", "scolarité terminée": "TERMINEE", "terminee": "TERMINEE",
  "ce2": "AVANT_CM1", "fini": "TERMINEE", "jss3": "TROISIEME",
};

export const CLASSE_CAT_MAP: Record<string, string> = {
  "1ere annee": "ANNEE_1", "1ère année": "ANNEE_1", "1ere année": "ANNEE_1", "1": "ANNEE_1",
  "annee 1": "ANNEE_1", "anee 1": "ANNEE_1",
  "2eme annee": "ANNEE_2", "2ème année": "ANNEE_2", "2": "ANNEE_2", "annee 2": "ANNEE_2", "2e annee": "ANNEE_2",
  "3eme annee": "ANNEE_3", "3ème année": "ANNEE_3", "3": "ANNEE_3", "annee 3": "ANNEE_3", "3eme": "ANNEE_3", "troisieme": "ANNEE_3",
  "4eme annee": "ANNEE_4", "4ème année": "ANNEE_4", "4": "ANNEE_4", "annee 4": "ANNEE_4", "4eme": "ANNEE_4", "4e annee": "ANNEE_4",
  "5eme annee": "ANNEE_5", "5ème année": "ANNEE_5", "5": "ANNEE_5", "annee 5": "ANNEE_5", "5eme": "ANNEE_5", "cinquieme annee": "ANNEE_5",
  "termine": "TERMINE", "terminé": "TERMINE", "terminee": "TERMINE", "terminée": "TERMINE", "fini": "TERMINE",
};

const HEADER_MAP: Record<string, string> = {
  "nom": "nom",
  "nom de famille": "nom",
  "nom famille": "nom",
  "family name": "nom",
  "prenoms": "prenoms",
  "prenom": "prenoms",
  "prénoms": "prenoms",
  "prénom": "prenoms",
  "prenoms usuels": "prenoms",
  "date de naissance": "dateNaissance",
  "date naissance": "dateNaissance",
  "naissance": "dateNaissance",
  "date": "dateNaissance",
  "classe a l ecole": "classeEcole",
  "classe ecole": "classeEcole",
  "classe": "classeEcole",
  "classe a l'ecole": "classeEcole",
  "serie": "serie",
  "serie (facultative)": "serie",
  "classe au catechisme": "classeCatechisme",
  "classe catechisme": "classeCatechisme",
  "catechisme": "classeCatechisme",
  "telephone": "telephoneParent",
  "telephone parent": "telephoneParent",
  "tel": "telephoneParent",
  "tel parent": "telephoneParent",
  "telephone du parent": "telephoneParent",
  "fraternite": "fraternite",
  "fraternité": "fraternite",
  "statut": "statut",
  "statut enfant": "statut",
};

export function mapHeaders(headers: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  headers.forEach((h, idx) => {
    const norm = normalizeHeader(h);
    const key = HEADER_MAP[norm];
    if (key && map[key] === undefined) {
      map[key] = idx;
    }
  });
  return map;
}
