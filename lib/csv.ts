export function parseCsv(text: string): string[][] {
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
      } else if (c === ",") {
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
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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
