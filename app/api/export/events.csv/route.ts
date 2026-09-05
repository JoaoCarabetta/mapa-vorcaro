import { loadEvents } from "@/lib/load";

function csvEscape(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export async function GET() {
  const events = loadEvents();
  const header = [
    "id",
    "date",
    "date_precision",
    "title",
    "summary",
    "tags",
    "people",
    "evidence_type",
    "confidence",
    "source_urls",
  ];
  const rows = events.map((event) =>
    [
      event.id,
      event.date,
      event.date_precision,
      event.title,
      event.summary.replace(/\s+/g, " ").trim(),
      event.tags.join("|"),
      event.people.map((p) => p.name).join("|"),
      event.evidence_type,
      event.confidence ?? "",
      event.sources.map((s) => s.url).join(" "),
    ]
      .map(csvEscape)
      .join(","),
  );
  const body = [header.join(","), ...rows].join("\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mapa-vorcaro-eventos.csv"',
    },
  });
}
