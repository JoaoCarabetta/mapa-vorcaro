"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { EdgeRecord, PersonRecord } from "@/lib/types";

const GROUP_COLOR: Record<PersonRecord["group"], string> = {
  nucleo: "#8b1e1e",
  poder: "#1c1610",
  estado: "#3d5246",
  intermediario: "#b08a3c",
  master: "#4a4338",
  familia: "#6b4c7a",
};

type Props = {
  people: PersonRecord[];
  edges: EdgeRecord[];
  counts: Record<string, number>;
};

export function NetworkGraph({ people, edges, counts }: Props) {
  const [selected, setSelected] = useState("daniel-bueno-vorcaro");
  const width = 920;
  const height = 620;
  const cx = width / 2;
  const cy = height / 2;

  const layout = useMemo(() => {
    const others = people.filter((p) => p.id !== "daniel-bueno-vorcaro");
    const positions = new Map<string, { x: number; y: number }>();
    positions.set("daniel-bueno-vorcaro", { x: cx, y: cy });
    others.forEach((person, index) => {
      const angle = (index / others.length) * Math.PI * 2 - Math.PI / 2;
      const ring = 170 + (index % 3) * 70;
      positions.set(person.id, {
        x: cx + Math.cos(angle) * ring,
        y: cy + Math.sin(angle) * ring,
      });
    });
    return positions;
  }, [people, cx, cy]);

  const selectedPerson = people.find((p) => p.id === selected);
  const related = edges.filter((e) => e.from === selected || e.to === selected);

  return (
    <div>
      <p className="legend">
        <span><span className="dot" style={{ background: GROUP_COLOR.nucleo }} /> núcleo</span>
        <span><span className="dot" style={{ background: GROUP_COLOR.poder }} /> poder</span>
        <span><span className="dot" style={{ background: GROUP_COLOR.estado }} /> Estado / BC / Justiça</span>
        <span><span className="dot" style={{ background: GROUP_COLOR.intermediario }} /> intermediário</span>
        <span><span className="dot" style={{ background: GROUP_COLOR.master }} /> Master</span>
        <span><span className="dot" style={{ background: GROUP_COLOR.familia }} /> família / entorno</span>
      </p>
      <div className="network-wrap">
        <svg
          role="img"
          aria-label="Rede de interlocutores de Daniel Bueno Vorcaro"
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="auto"
        >
          {edges.map((edge) => {
            const a = layout.get(edge.from);
            const b = layout.get(edge.to);
            if (!a || !b) return null;
            const active = edge.from === selected || edge.to === selected;
            return (
              <line
                key={`${edge.from}-${edge.to}-${edge.type}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={active ? "#8b1e1e" : "#d4cbb8"}
                strokeWidth={active ? 2.2 : 1}
              />
            );
          })}
          {people.map((person) => {
            const pos = layout.get(person.id);
            if (!pos) return null;
            const r = person.id === "daniel-bueno-vorcaro" ? 22 : 8 + Math.min(counts[person.id] ?? 1, 10);
            return (
              <g
                key={person.id}
                transform={`translate(${pos.x},${pos.y})`}
                style={{ cursor: "pointer" }}
                onClick={() => setSelected(person.id)}
              >
                <title>{`${person.name} — ${counts[person.id] ?? 0} eventos`}</title>
                <circle
                  r={r}
                  fill={GROUP_COLOR[person.group]}
                  stroke={selected === person.id ? "#f4efe4" : "#fffdf8"}
                  strokeWidth={selected === person.id ? 4 : 2}
                />
                <text
                  y={r + 14}
                  textAnchor="middle"
                  fontSize={person.id === "daniel-bueno-vorcaro" ? 13 : 11}
                  fill="#1c1610"
                  fontFamily="IBM Plex Sans, sans-serif"
                >
                  {person.shortName ?? person.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {selectedPerson ? (
        <aside className="side-card" style={{ marginTop: 16 }}>
          <p className="source-pub">{selectedPerson.group}</p>
          <h2 style={{ margin: "6px 0" }}>
            <Link href={`/pessoas/${selectedPerson.id}`}>{selectedPerson.name}</Link>
          </h2>
          <p className="muted">{selectedPerson.summary}</p>
          <p>
            {counts[selectedPerson.id] ?? 0} eventos na timeline
          </p>
          <ul>
            {related.map((edge) => {
              const otherId = edge.from === selected ? edge.to : edge.from;
              const other = people.find((p) => p.id === otherId);
              return (
                <li key={`${edge.from}-${edge.to}-${edge.type}`}>
                  <button
                    type="button"
                    className="filter-reset"
                    onClick={() => setSelected(otherId)}
                  >
                    {other?.name ?? otherId}
                  </button>
                  {" — "}
                  {edge.label} ({edge.confidence})
                </li>
              );
            })}
          </ul>
        </aside>
      ) : null}
    </div>
  );
}
