import Link from "next/link";
import { eventsForPerson, loadPeople } from "@/lib/load";
import type { PersonRecord } from "@/lib/types";

const GROUP_ORDER: PersonRecord["group"][] = [
  "nucleo",
  "poder",
  "estado",
  "intermediario",
  "master",
  "familia",
];

const GROUP_LABEL: Record<PersonRecord["group"], string> = {
  nucleo: "Núcleo",
  poder: "Poder",
  estado: "Estado / BC / Justiça",
  intermediario: "Intermediários",
  master: "Master",
  familia: "Família / entorno",
};

export default function PeopleIndexPage() {
  const people = loadPeople();
  const grouped = GROUP_ORDER.map((group) => ({
    group,
    people: people.filter((person) => person.group === group),
  })).filter((bucket) => bucket.people.length > 0);

  return (
    <div className="wrap">
      <header className="hero">
        <h1>Índice de pessoas</h1>
        <p className="lede">
          Nomes que atravessam a timeline. A ficha descreve o papel nas fontes; o
          vínculo com Vorcaro aparece na rede e nos eventos.
        </p>
      </header>
      {grouped.map(({ group, people: list }) => (
        <section key={group} aria-labelledby={`grupo-${group}`}>
          <h2 className="year-head" id={`grupo-${group}`}>
            {GROUP_LABEL[group]}
          </h2>
          <div className="people-grid">
            {list.map((person) => {
              const count = eventsForPerson(person.id).length;
              return (
                <Link
                  className="person-card"
                  key={person.id}
                  href={`/pessoas/${person.id}`}
                >
                  <div className="source-pub">{GROUP_LABEL[person.group]}</div>
                  <h2 style={{ margin: "8px 0 6px" }}>{person.name}</h2>
                  <p className="muted">{person.roles[0]}</p>
                  <p>
                    {count} evento{count === 1 ? "" : "s"}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
