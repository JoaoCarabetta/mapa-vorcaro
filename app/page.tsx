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
        </div>
        <div className="caveat">
          <strong>Ressalvas permanentes.</strong> Mensagens de visualização única não
          recuperam, em regra, a resposta do interlocutor. Rótulo de agenda (“Alexandre de
          Moraes BRASILIA”) não é perícia de chip. O escritório Barci de Moraes disputa o
          segundo contrato (Viking / dação). A PF diz que o relatório de 72 horas “não possui
          caráter exaustivo”.
        </div>
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
