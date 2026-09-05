"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { groupLabel } from "@/lib/format";
import type { PersonRecord } from "@/lib/types";

const GROUP_ORDER: PersonRecord["group"][] = [
  "nucleo",
  "poder",
  "estado",
  "intermediario",
  "master",
  "familia",
];

type PersonCard = PersonRecord & { eventCount: number };

type Props = {
  people: PersonCard[];
  initialQ?: string;
  initialPin?: string;
};

function PersonTile({
  person,
  pinned,
  onPin,
}: {
  person: PersonCard;
  pinned: boolean;
  onPin: (id: string) => void;
}) {
  return (
    <article className={pinned ? "person-card person-card-pinned" : "person-card"}>
      <Link href={`/pessoas/${person.id}`} className="person-card-link">
        <div className="source-pub">{groupLabel(person.group)}</div>
        <h2 style={{ margin: "8px 0 6px" }}>{person.name}</h2>
        <p className="muted">{person.roles[0]}</p>
        <p>
          {person.eventCount} evento{person.eventCount === 1 ? "" : "s"}
        </p>
      </Link>
      <div className="person-card-actions">
        <button
          type="button"
          className="filter-reset"
          aria-pressed={pinned}
          onClick={() => onPin(person.id)}
        >
          {pinned ? "desafixar" : "fixar no topo"}
        </button>
      </div>
    </article>
  );
}

export function PeopleIndex({ people, initialQ = "", initialPin = "" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initialQ);
  const [pinned, setPinned] = useState(
    initialPin && people.some((person) => person.id === initialPin)
      ? initialPin
      : "",
  );

  const writeQuery = (patch: { q?: string; pin?: string }) => {
    const next = { q, pin: pinned, ...patch };
    const params = new URLSearchParams();
    if (next.q.trim()) params.set("q", next.q.trim());
    if (next.pin) params.set("pin", next.pin);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return people.filter((person) => {
      if (!query) return true;
      const hay = [
        person.name,
        person.shortName ?? "",
        ...(person.aliases ?? []),
        person.summary,
        person.roles.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [people, q]);

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    people: filtered.filter((person) => person.group === group),
  })).filter((bucket) => bucket.people.length > 0);

  const pinnedPerson = pinned
    ? filtered.find((person) => person.id === pinned)
    : undefined;

  const onPin = (id: string) => {
    const next = pinned === id ? "" : id;
    setPinned(next);
    writeQuery({ pin: next });
  };

  return (
    <>
      <form className="filters" onSubmit={(e) => e.preventDefault()} role="search">
        <input
          className="search"
          placeholder="Buscar pessoa (nome, papel, apelido…)"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            writeQuery({ q: e.target.value });
          }}
          aria-label="Buscar pessoas"
        />
      </form>
      {pinnedPerson ? (
        <section aria-labelledby="pessoa-fixada">
          <h2 className="year-head" id="pessoa-fixada">
            Ficha fixada
          </h2>
          <p className="muted">
            <Link href={`/pessoas/${pinnedPerson.id}`}>{pinnedPerson.name}</Link>
            {" · "}
            <button type="button" className="filter-reset" onClick={() => onPin(pinnedPerson.id)}>
              desafixar
            </button>
          </p>
          <div className="people-grid">
            <PersonTile person={pinnedPerson} pinned onPin={onPin} />
          </div>
        </section>
      ) : null}
      {grouped.length === 0 ? (
        <div className="empty">Nenhuma pessoa corresponde a essa busca.</div>
      ) : null}
      {grouped.map(({ group, people: list }) => (
        <section key={group} aria-labelledby={`grupo-${group}`}>
          <h2 className="year-head" id={`grupo-${group}`}>
            {groupLabel(group)}
          </h2>
          <div className="people-grid">
            {list.map((person) => (
              <PersonTile
                key={person.id}
                person={person}
                pinned={pinned === person.id}
                onPin={onPin}
              />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
