import { NetworkGraph } from "@/components/NetworkGraph";
import { eventsForPerson, loadEdges, loadPeople } from "@/lib/load";

type Search = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function NetworkPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const people = loadPeople();
  const edges = loadEdges();
  const counts = Object.fromEntries(
    people.map((person) => [person.id, eventsForPerson(person.id).length]),
  );

  return (
    <div className="wrap">
      <header className="hero">
        <h1>Rede de interlocução</h1>
        <p className="lede">
          Vorcaro no centro. As arestas vêm das fontes — contrato, intermediação, evento,
          recado, investigação. Clique num nó para ler o vínculo. Confiança baixa ou média
          não some: aparece marcada.
        </p>
        <div className="caveat">
          Esta vista é um índice de coocorrência sourced, não um grafo de culpa. Encontros
          reconstruídos a partir de mensagens de Vorcaro a terceiros não equivalem a
          confirmação independente da presença do outro.
        </div>
      </header>
      <NetworkGraph
        people={people}
        edges={edges}
        counts={counts}
        initialSelected={first(params.pessoa)}
      />
    </div>
  );
}
