import Link from "next/link";
import { eventsForPerson, loadPeople } from "@/lib/load";

export default function PeopleIndexPage() {
  const people = loadPeople();
  return (
    <div className="wrap">
      <header className="hero">
        <h1>Índice de pessoas</h1>
        <p className="lede">
          Nomes que atravessam a timeline. A ficha descreve o papel nas fontes; o
          vínculo com Vorcaro aparece na rede e nos eventos.
        </p>
      </header>
      <div className="people-grid">
        {people.map((person) => {
          const count = eventsForPerson(person.id).length;
          return (
            <Link className="person-card" key={person.id} href={`/pessoas/${person.id}`}>
              <div className="source-pub">{person.group}</div>
              <h2 style={{ margin: "8px 0 6px" }}>{person.name}</h2>
              <p className="muted">{person.roles[0]}</p>
              <p>{count} evento{count === 1 ? "" : "s"}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
