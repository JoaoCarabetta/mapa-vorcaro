export function formatDate(
  iso: string,
  precision: "day" | "month" | "year",
): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (precision === "year" || !month) return String(year);
  const months = [
    "jan.",
    "fev.",
    "mar.",
    "abr.",
    "maio",
    "jun.",
    "jul.",
    "ago.",
    "set.",
    "out.",
    "nov.",
    "dez.",
  ];
  const monthLabel = months[month - 1] ?? iso;
  if (precision === "month" || !day) return `${monthLabel} ${year}`;
  return `${String(day).padStart(2, "0")} ${monthLabel} ${year}`;
}

export function evidenceLabel(type: string): string {
  switch (type) {
    case "primary_document":
      return "documento primário";
    case "court":
      return "peça judicial";
    case "official":
      return "fonte oficial";
    case "press":
      return "imprensa";
    default:
      return "outra";
  }
}

export function confidenceLabel(level?: string): string {
  switch (level) {
    case "high":
      return "alta";
    case "medium":
      return "média";
    case "low":
      return "baixa";
    default:
      return "não marcada";
  }
}

const TAG_LABELS: Record<string, string> = {
  "nota-forense": "nota forense",
  notas: "notas",
  whatsapp: "WhatsApp",
  "view-once": "visualização única",
  crise: "crise",
  "crise-master": "crise Master",
  "compliance-zero": "Compliance Zero",
  "power-interlocutor": "interlocutor do poder",
  "seal-lift": "quebra de sigilo",
  master: "Master",
  maxima: "Máxima",
  bio: "bio",
  brb: "BRB",
  barci: "Barci",
  viking: "Viking",
  growth: "expansão",
  politics: "política",
  politica: "política",
  aeronaves: "aeronaves",
  lux: "luxo",
  education: "formação",
  multipar: "Multipar",
  fasano: "Fasano",
  atletico: "Atlético",
  zettel: "Zettel",
  tirreno: "Tirreno",
};

export function tagLabel(tag: string): string {
  return TAG_LABELS[tag] ?? tag.replace(/-/g, " ");
}

/** Visible UTC stamp from a forensic title, or null. */
export function formatEventClock(event: { title: string }): string | null {
  const match = event.title.match(/(\d{2}:\d{2}:\d{2})(?:\s*UTC)?/i);
  return match ? `${match[1]} UTC` : null;
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** UTC clock from title (Nota forense → WhatsApp HH:MM:SS UTC), else summary, else midnight. */
export function eventClock(event: { title: string; summary?: string }): string {
  const fromTitle = event.title.match(/(\d{2}):(\d{2}):(\d{2})/);
  if (fromTitle) return `${fromTitle[1]}${fromTitle[2]}${fromTitle[3]}`;
  const fromSummary = (event.summary ?? "").match(/(\d{2}):(\d{2}):(\d{2})/);
  if (fromSummary) return `${fromSummary[1]}${fromSummary[2]}${fromSummary[3]}`;
  return "000000";
}

export function compareEventsChrono<
  T extends { date: string; id: string; title: string; summary?: string },
>(a: T, b: T): number {
  const byDate = a.date.localeCompare(b.date);
  if (byDate !== 0) return byDate;
  const byTime = eventClock(a).localeCompare(eventClock(b));
  if (byTime !== 0) return byTime;
  return a.id.localeCompare(b.id);
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function formatMonthHead(iso: string): string {
  const [year, month] = iso.split("-").map(Number);
  const months = [
    "jan.",
    "fev.",
    "mar.",
    "abr.",
    "maio",
    "jun.",
    "jul.",
    "ago.",
    "set.",
    "out.",
    "nov.",
    "dez.",
  ];
  return `${months[(month ?? 1) - 1] ?? iso} ${year}`;
}
