import { PeopleIndex } from "@/components/PeopleIndex";
import { eventsForPerson, loadPeople } from "@/lib/load";

type Search = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function PeopleIndexPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const people = loadPeople().map((person) => ({
    ...person,
    eventCount: eventsForPerson(person.id).length,
  }));

  return (
    <div className="wrap">
      <header className="hero">
        <h1>Índice de pessoas</h1>
        <p className="lede">
          Nomes que atravessam a timeline. A ficha descreve o papel nas fontes; o
          vínculo com Vorcaro aparece na rede e nos eventos.
        </p>
      </header>
      <PeopleIndex
        people={people}
        initialQ={first(params.q)}
        initialPin={first(params.pin)}
      />
    </div>
  );
}
