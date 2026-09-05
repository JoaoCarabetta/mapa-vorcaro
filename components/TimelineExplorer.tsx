"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { ForensicCluster } from "@/components/ForensicCluster";
import type { EventRecord } from "@/lib/types";

type Props = {
  events: EventRecord[];
  people: { id: string; name: string }[];
  tags: string[];
  years: number[];
};

function matchesQuery(event: EventRecord, query: string) {
  if (!query) return true;
  const hay = [
    event.title,
    event.summary,
    event.notes ?? "",
    event.tags.join(" "),
    event.people.map((p) => p.name).join(" "),
    event.sources.map((s) => `${s.publisher} ${s.title ?? ""} ${s.quote ?? ""}`).join(" "),
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(query);
}

export function TimelineExplorer({ events, people, tags, years }: Props) {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [person, setPerson] = useState(params.get("pessoa") ?? "");
  const [tag, setTag] = useState(params.get("tag") ?? "");
  const [year, setYear] = useState(params.get("ano") ?? "");
  const [evidence, setEvidence] = useState(params.get("evidencia") ?? "");
  const [confidence, setConfidence] = useState(params.get("confianca") ?? "");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return events.filter((event) => {
      if (year && !event.date.startsWith(year)) return false;
      if (tag && !event.tags.includes(tag)) return false;
      if (evidence && event.evidence_type !== evidence) return false;
      if (confidence && event.confidence !== confidence) return false;
      if (person) {
        const match = event.people.some(
          (p) => p.id === person || p.name === person,
        );
        if (!match) return false;
      }
      return matchesQuery(event, query);
    });
  }, [events, q, person, tag, year, evidence, confidence]);

  const byId = useMemo(
    () => new Map(events.map((event) => [event.id, event])),
    [events],
  );

  const childrenByCluster = useMemo(() => {
    const map = new Map<string, EventRecord[]>();
    for (const event of events) {
      if (event.cluster_role !== "child" || !event.cluster_id) continue;
      const list = map.get(event.cluster_id) ?? [];
      list.push(event);
      map.set(event.cluster_id, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
    }
    return map;
  }, [events]);

  const topLevel = useMemo(() => {
    const filteredIds = new Set(filtered.map((event) => event.id));
    const extraParents = new Set<string>();
    const openClusters = new Set<string>();

    for (const event of filtered) {
      if (event.cluster_role === "child" && event.cluster_id) {
        openClusters.add(event.cluster_id);
        const parent = events.find(
          (candidate) =>
            candidate.cluster_id === event.cluster_id &&
            candidate.cluster_role === "parent",
        );
        if (parent) extraParents.add(parent.id);
      }
    }

    const visible = events.filter((event) => {
      if (event.cluster_role === "child") return false;
      if (filteredIds.has(event.id) || extraParents.has(event.id)) return true;
      return false;
    });

    return { visible, openClusters };
  }, [events, filtered]);

  const grouped = useMemo(() => {
    const map = new Map<string, EventRecord[]>();
    for (const event of topLevel.visible) {
      const key = event.date.slice(0, 4);
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [topLevel.visible]);

  const reset = () => {
    setQ("");
    setPerson("");
    setTag("");
    setYear("");
    setEvidence("");
    setConfidence("");
  };

  const active = q || person || tag || year || evidence || confidence;
  const clusterCount = [...childrenByCluster.keys()].length;
  const microCount = [...childrenByCluster.values()].reduce(
    (sum, list) => sum + list.length,
    0,
  );

  return (
    <section>
      <form className="filters" onSubmit={(e) => e.preventDefault()} role="search">
        <label className="sr-only" htmlFor="busca">
          Busca em título, resumo, pessoas, tags e fontes
        </label>
        <div className="filters-grid">
          <input
            id="busca"
            className="search"
            placeholder="Buscar na timeline (texto, pessoas, fontes…)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="select" value={person} onChange={(e) => setPerson(e.target.value)} aria-label="Filtrar por pessoa">
            <option value="">Todas as pessoas</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select className="select" value={tag} onChange={(e) => setTag(e.target.value)} aria-label="Filtrar por tag">
            <option value="">Todas as tags</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select className="select" value={year} onChange={(e) => setYear(e.target.value)} aria-label="Filtrar por ano">
            <option value="">Todos os anos</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
          <select className="select" value={evidence} onChange={(e) => setEvidence(e.target.value)} aria-label="Filtrar por tipo de evidência">
            <option value="">Todo tipo de evidência</option>
            <option value="primary_document">documento primário</option>
            <option value="court">peça judicial</option>
            <option value="official">fonte oficial</option>
            <option value="press">imprensa</option>
            <option value="other">outra</option>
          </select>
        </div>
        <div className="filters-grid" style={{ gridTemplateColumns: "1fr auto" }}>
          <select className="select" value={confidence} onChange={(e) => setConfidence(e.target.value)} aria-label="Filtrar por confiança">
            <option value="">Qualquer confiança</option>
            <option value="high">alta</option>
            <option value="medium">média</option>
            <option value="low">baixa</option>
          </select>
          {active ? (
            <button type="button" className="filter-reset" onClick={reset}>
              Limpar filtros ({filtered.length} de {events.length})
            </button>
          ) : (
            <p className="muted" style={{ margin: 0 }}>
              {events.length} eventos sourced · {clusterCount} clusters forenses · {microCount} micro-cards agrupados
            </p>
          )}
        </div>
      </form>

      {topLevel.visible.length === 0 ? (
        <div className="empty">
          <p>Nenhum evento corresponde a esses filtros.</p>
          <button type="button" className="btn secondary" onClick={reset}>
            Limpar e voltar à timeline completa
          </button>
        </div>
      ) : (
        <div className="timeline">
          {grouped.map(([yearKey, list]) => (
            <section key={yearKey} aria-labelledby={`ano-${yearKey}`}>
              <h2 className="year-head" id={`ano-${yearKey}`}>
                {yearKey}
              </h2>
              {list.map((event) => {
                const children =
                  event.cluster_role === "parent"
                    ? (childrenByCluster.get(event.cluster_id ?? "") ?? [])
                    : [];
                if (children.length > 0 && event.cluster_id) {
                  return (
                    <ForensicCluster
                      key={event.id}
                      parent={event}
                      children={children}
                      defaultOpen={topLevel.openClusters.has(event.cluster_id)}
                    />
                  );
                }
                return <EventCard key={event.id} event={byId.get(event.id) ?? event} />;
              })}
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
