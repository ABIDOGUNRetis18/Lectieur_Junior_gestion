const TZ = "Africa/Porto-Novo";

export type GroupeDimanches = {
  premierDimanche: Date;
  moisDebutAnnee: number;
  moisSansReunion: number[];
};

export function getMonthInTZ(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "numeric" }).formatToParts(date);
  return parseInt(parts.find((p) => p.type === "month")!.value, 10);
}

export function isSundayInTZ(date: Date): boolean {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).formatToParts(date);
  return parts.find((p) => p.type === "weekday")?.value === "Sun";
}

export function getDimanchesValides(groupe: GroupeDimanches, limit = 12): Date[] {
  const result: Date[] = [];
  const debut = new Date(groupe.premierDimanche);
  debut.setUTCHours(0, 0, 0, 0);
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);

  let d = new Date(debut);
  while (d <= end) {
    const month = getMonthInTZ(d);
    if (!groupe.moisSansReunion.includes(month)) {
      result.push(new Date(d));
    }
    d = new Date(d.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  const recent = result.slice(-limit);
  return recent.reverse(); // most recent first
}

export function isDimancheValide(date: Date, groupe: GroupeDimanches): boolean {
  if (!isSundayInTZ(date)) return false;
  if (date.getTime() < groupe.premierDimanche.getTime()) return false;
  const diffDays = Math.round(
    (date.getTime() - groupe.premierDimanche.getTime()) / (24 * 60 * 60 * 1000)
  );
  if (diffDays % 7 !== 0) return false;
  const month = getMonthInTZ(date);
  if (groupe.moisSansReunion.includes(month)) return false;
  return true;
}

export function formatDateISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatDateFr(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
