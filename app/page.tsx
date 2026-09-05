import { TimelineExplorer } from "@/components/TimelineExplorer";
import { loadEvents, loadPeople, uniqueTags, uniqueYears } from "@/lib/load";

type Search = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const events = loadEvents();
  const people = loadPeople().map((p) => ({ id: p.id, name: p.name }));
  const primary = events.filter((e) =>
    ["primary_document", "court", "official"].includes(e.evidence_type),
  ).length;

  return (
    <div className="wrap">
      <header className="hero">
        <p className="brand-kicker">Daniel Bueno Vorcaro · Banco Master · poder</p>
        <h1>A cronologia documentada da interlocução com o poder</h1>
        <p className="lede">
          Arquivo jornalístico da trajetória do banqueiro e das peças públicas da
          PET 16.662 — mensagens, contratos, fórum de Londres, BRB e Operação Compliance Zero.
          Cada ficha cita ao menos uma URL. O que não tem fonte não entra.
        </p>
        <div className="meta-row">
          <span className="pill">{events.length} eventos</span>
          <span className="pill">{people.length} pessoas</span>
          <span className="pill">{primary} com documento primário, peça ou fonte oficial</span>
          <span className="pill">
            {events.filter((e) => e.cluster_role === "parent").length} grupos forenses
            (out–nov/2025)
          </span>
        </div>
        <p className="muted" style={{ margin: 0 }}>
          <a href="/metodologia#ressalvas">Ressalvas de método</a>
          — visualização única, rótulo de agenda ≠ chip, disputa Barci, relatório de 72h.
        </p>
      </header>
      <TimelineExplorer
        events={events}
        people={people}
        tags={uniqueTags(events)}
        years={uniqueYears(events)}
        initialQuery={{
          q: first(params.q),
          pessoa: first(params.pessoa),
          tag: first(params.tag),
          ano: first(params.ano),
          evidencia: first(params.evidencia),
          confianca: first(params.confianca),
          de: first(params.de),
          ate: first(params.ate),
          dia: first(params.dia),
          mes: first(params.mes),
        }}
      />
    </div>
  );
}
