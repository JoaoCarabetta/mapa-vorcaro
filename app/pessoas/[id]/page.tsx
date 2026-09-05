import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { eventsForPerson, loadEdges, loadPeople } from "@/lib/load";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return loadPeople().map((person) => ({ id: person.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const person = loadPeople().find((p) => p.id === id);
  return { title: person?.name ?? "Pessoa" };
}

export default async function PersonPage({ params }: Props) {
  const { id } = await params;
  const person = loadPeople().find((p) => p.id === id);
  if (!person) notFound();
  const events = eventsForPerson(person.id);
  const people = loadPeople();
  const edges = loadEdges().filter((e) => e.from === id || e.to === id);

  return (
    <div className="wrap">
      <p className="brand-kicker">
        <Link href="/pessoas">Pessoas</Link> · {person.group}
      </p>
      <h1>{person.name}</h1>
      <p className="lede">{person.summary}</p>
      <p className="muted">{person.roles.join(" · ")}</p>

      {edges.length > 0 ? (
        <div className="side-card" style={{ marginTop: 20 }}>
          <h2>Vínculos na rede</h2>
          <ul>
            {edges.map((edge) => {
              const otherId = edge.from === id ? edge.to : edge.from;
              const other = people.find((p) => p.id === otherId);
              return (
                <li key={`${edge.from}-${edge.to}-${edge.type}`}>
                  {other ? (
                    <Link href={`/pessoas/${other.id}`}>{other.name}</Link>
                  ) : (
                    otherId
                  )}
                  {" — "}
                  {edge.label}
                </li>
              );
            })}
          </ul>
          <p>
            <Link href="/rede">Ver na visualização de rede</Link>
          </p>
        </div>
      ) : null}

      <h2 className="year-head">Eventos</h2>
      {events.length === 0 ? (
        <div className="empty">Nenhum evento ligado a esta ficha.</div>
      ) : (
        events.map((event) => <EventCard key={event.id} event={event} />)
      )}
    </div>
  );
}
