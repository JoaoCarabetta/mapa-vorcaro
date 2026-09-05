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

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
