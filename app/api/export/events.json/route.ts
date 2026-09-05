import { loadEvents } from "@/lib/load";

export async function GET() {
  const events = loadEvents();
  return Response.json(events, {
    headers: {
      "Content-Disposition": 'attachment; filename="mapa-vorcaro-eventos.json"',
    },
  });
}
