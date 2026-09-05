import { Suspense } from "react";
import { TimelineExplorer } from "@/components/TimelineExplorer";
import { loadEvents, loadPeople, uniqueTags, uniqueYears } from "@/lib/load";

export default function HomePage() {
  const events = loadEvents();
  const people = loadPeople().map((p) => ({ id: p.id, name: p.name }));
  const primary = events.filter((e) =>
    ["primary_document", "court", "official"].includes(e.evidence_type),
  ).length;

  return (
    <div className="wrap">
      <header className="hero">
        <p className="brand-kicker">Daniel Bueno Vorcaro · Banco Master · poder</p>
        <h1>Uma timeline sourced da interlocução com o poder</h1>
        <p className="lede">
          Mapa Vorcaro reúne eventos da trajetória do banqueiro e das peças públicas da
          PET 16.662 — mensagens, contratos, fórum de Londres, BRB e Operação Compliance Zero.
          Cada ficha cita ao menos uma URL. O que não tem fonte não entra.
        </p>
        <div className="meta-row">
          <span className="pill">{events.length} eventos</span>
          <span className="pill">{people.length} pessoas</span>
          <span className="pill">{primary} com documento primário, peça ou fonte oficial</span>
          <span className="pill">
            {events.filter((e) => e.cluster_role === "parent").length} grupos do dia
          </span>
        </div>
        <p className="muted" style={{ margin: 0 }}>
          <a href="/metodologia#ressalvas">Ressalvas de método</a>
          — visualização única, rótulo de agenda ≠ chip, disputa Barci, relatório de 72h.
        </p>
      </header>
      <Suspense fallback={<p className="muted">Carregando filtros…</p>}>
        <TimelineExplorer
          events={events}
          people={people}
          tags={uniqueTags(events)}
          years={uniqueYears(events)}
        />
      </Suspense>
    </div>
  );
}
