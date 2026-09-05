"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { ForensicCluster } from "@/components/ForensicCluster";
import {
  compareEventsChrono,
  formatMonthHead,
  monthKey,
  tagLabel,
} from "@/lib/format";
import type { EventRecord } from "@/lib/types";

type TimelineQuery = {
  q?: string;
  pessoa?: string;
  tag?: string;
  ano?: string;
  evidencia?: string;
  confianca?: string;
  de?: string;
  ate?: string;
  dia?: string;
};

type Props = {
  events: EventRecord[];
  people: { id: string; name: string }[];
  tags: string[];
  years: number[];
  initialQuery?: TimelineQuery;
};

function matchesQuery(event: EventRecord, query: string) {
  if (!query) return true;
  const hay = [
    event.title,
    event.summary,
    event.notes ?? "",
    event.tags.join(" "),
    event.people.map((p) => p.name).join(" "),
    event.sources
      .map((s) => `${s.publisher} ${s.title ?? ""} ${s.quote ?? ""}`)
      .join(" "),
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(query);
}

function clusterLabel(events: EventRecord[]): string {
  const forensic = events.filter(
    (event) =>
      event.tags.some((tag) =>
        ["nota-forense", "notas", "whatsapp", "view-once", "crise"].includes(tag),
      ) || /nota forense|whatsapp/i.test(event.title),
  );
  if (forensic.length >= Math.ceil(events.length / 2)) {
    return "Notas para WhatsApp";
  }
  const counts = new Map<string, number>();
  for (const event of events) {
    for (const tag of event.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] >= events.length) return tagLabel(top[0]);
  return "Vários fios";
}

type DayBucket = {
  date: string;
  month: string;
  year: string;
  events: EventRecord[];
  dayCount: number;
};

export function TimelineExplorer({
  events,
  people,
  tags,
  years,
  initialQuery = {},
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [dia, setDia] = useState(initialQuery.dia ?? "");
  const [q, setQ] = useState(initialQuery.q ?? "");
  const [person, setPerson] = useState(initialQuery.pessoa ?? "");
  const [tag, setTag] = useState(initialQuery.tag ?? "");
  const [year, setYear] = useState(initialQuery.ano ?? "");
  const [evidence, setEvidence] = useState(initialQuery.evidencia ?? "");
  const [confidence, setConfidence] = useState(initialQuery.confianca ?? "");
  const [fromDate, setFromDate] = useState(initialQuery.de ?? "");
  const [toDate, setToDate] = useState(initialQuery.ate ?? "");

  const writeQuery = useCallback(
    (patch: Record<string, string>) => {
      const next = {
        q,
        pessoa: person,
        tag,
        ano: year,
        evidencia: evidence,
        confianca: confidence,
        de: fromDate,
        ate: toDate,
        dia,
        ...patch,
      };
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(next)) {
        if (value) params.set(key, value);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [
      q,
      person,
      tag,
      year,
      evidence,
      confidence,
      fromDate,
      toDate,
      dia,
      pathname,
      router,
    ],
  );

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
      const start = event.date;
      const end = event.date_end ?? event.date;
      if (fromDate && end < fromDate) return false;
      if (toDate && start > toDate) return false;
      return matchesQuery(event, query);
    });
  }, [events, q, person, tag, year, evidence, confidence, fromDate, toDate]);

  const dayBuckets = useMemo(() => {
    const matchingDays = new Set(
      filtered
        .map((event) => event.date)
        .filter((date) => {
          if (fromDate && date < fromDate) return false;
          if (toDate && date > toDate) return false;
          return true;
        }),
    );
    if (dia) matchingDays.add(dia);

    const byDay = new Map<string, EventRecord[]>();
    for (const event of events) {
      if (event.date_precision !== "day") continue;
      if (!matchingDays.has(event.date)) continue;
      const list = byDay.get(event.date) ?? [];
      list.push(event);
      byDay.set(event.date, list);
    }

    const buckets: DayBucket[] = [];
    for (const [date, list] of [...byDay.entries()].sort()) {
      if (list.length < 2) continue;
      buckets.push({
        date,
        month: monthKey(date),
        year: date.slice(0, 4),
        events: list.slice().sort(compareEventsChrono),
        dayCount: list.length,
      });
    }

    const singles = filtered.filter((event) => {
      if (fromDate && event.date < fromDate) return false;
      if (toDate && event.date > toDate) return false;
      if (event.date_precision !== "day") return true;
      return !buckets.some((item) => item.date === event.date);
    });

    return { buckets, singles: singles.sort(compareEventsChrono) };
  }, [events, filtered, dia]);

  const timeline = useMemo(() => {
    type Item =
      | { kind: "cluster"; bucket: DayBucket }
      | { kind: "event"; event: EventRecord };

    const items: Item[] = [];
    const clusteredDates = new Set(
      dayBuckets.buckets.map((bucket) => bucket.date),
    );

    for (const bucket of dayBuckets.buckets) {
      items.push({ kind: "cluster", bucket });
    }
    for (const event of dayBuckets.singles) {
      if (clusteredDates.has(event.date) && event.date_precision === "day") {
        continue;
      }
      items.push({ kind: "event", event });
    }

    items.sort((a, b) => {
      const dateA = a.kind === "cluster" ? a.bucket.date : a.event.date;
      const dateB = b.kind === "cluster" ? b.bucket.date : b.event.date;
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      if (a.kind === "cluster" && b.kind === "event") return -1;
      if (a.kind === "event" && b.kind === "cluster") return 1;
      if (a.kind === "event" && b.kind === "event") {
        return compareEventsChrono(a.event, b.event);
      }
      return 0;
    });

    const yearsMap = new Map<string, Map<string, Item[]>>();
    for (const item of items) {
      const date = item.kind === "cluster" ? item.bucket.date : item.event.date;
      const yearKey = date.slice(0, 4);
      const month = monthKey(date);
      const yearGroup = yearsMap.get(yearKey) ?? new Map<string, Item[]>();
      const monthList = yearGroup.get(month) ?? [];
      monthList.push(item);
      yearGroup.set(month, monthList);
      yearsMap.set(yearKey, yearGroup);
    }

    return [...yearsMap.entries()].map(([yearKey, months]) => ({
      yearKey,
      months: [...months.entries()].map(([month, monthItems]) => ({
        month,
        items: monthItems,
      })),
    }));
  }, [dayBuckets]);

  const reset = () => {
    setQ("");
    setPerson("");
    setTag("");
    setYear("");
    setEvidence("");
    setConfidence("");
    setFromDate("");
    setToDate("");
    setDia("");
    writeQuery({
      q: "",
      pessoa: "",
      tag: "",
      ano: "",
      evidencia: "",
      confianca: "",
      de: "",
      ate: "",
      dia: "",
    });
  };

  const active =
    q ||
    person ||
    tag ||
    year ||
    evidence ||
    confidence ||
    fromDate ||
    toDate ||
    dia;
  const clusterCount = dayBuckets.buckets.length;
  const fichaCount = dayBuckets.buckets.reduce(
    (sum, b) => sum + b.events.length,
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
            onChange={(e) => {
              setQ(e.target.value);
              writeQuery({ q: e.target.value });
            }}
          />
          <select
            className="select"
            value={person}
            onChange={(e) => {
              setPerson(e.target.value);
              writeQuery({ pessoa: e.target.value });
            }}
            aria-label="Filtrar por pessoa"
          >
            <option value="">Todas as pessoas</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            className="select"
            value={tag}
            onChange={(e) => {
              setTag(e.target.value);
              writeQuery({ tag: e.target.value });
            }}
            aria-label="Filtrar por tag"
          >
            <option value="">Todas as tags</option>
            {tags.map((t) => (
            <option key={t} value={t}>
              {tagLabel(t)}
            </option>
            ))}
          </select>
          <select
            className="select"
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              writeQuery({ ano: e.target.value });
            }}
            aria-label="Filtrar por ano"
          >
            <option value="">Todos os anos</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
          <select
            className="select"
            value={evidence}
            onChange={(e) => {
              setEvidence(e.target.value);
              writeQuery({ evidencia: e.target.value });
            }}
            aria-label="Filtrar por tipo de evidência"
          >
            <option value="">Todo tipo de evidência</option>
            <option value="primary_document">documento primário</option>
            <option value="court">peça judicial</option>
            <option value="official">fonte oficial</option>
            <option value="press">imprensa</option>
            <option value="other">outra</option>
          </select>
        </div>
        <details className="filters-more">
          <summary>Mais filtros</summary>
          <select
            className="select"
            value={confidence}
            onChange={(e) => {
              setConfidence(e.target.value);
              writeQuery({ confianca: e.target.value });
            }}
            aria-label="Filtrar por confiança"
          >
            <option value="">Toda confiança</option>
            <option value="high">alta</option>
            <option value="medium">média</option>
            <option value="low">baixa</option>
          </select>
        </details>
        <div className="filters-range">
          <label className="range-label">
            <span>De</span>
            <input
              type="date"
              className="select"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                writeQuery({ de: e.target.value });
              }}
              aria-label="Data inicial"
            />
          </label>
          <label className="range-label">
            <span>Até</span>
            <input
              type="date"
              className="select"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                writeQuery({ ate: e.target.value });
              }}
              aria-label="Data final"
            />
          </label>
        </div>
        <div className="filters-meta">
          {active ? (
            <button type="button" className="filter-reset" onClick={reset}>
              Limpar filtros ({filtered.length} de {events.length})
            </button>
          ) : (
            <p className="muted" style={{ margin: 0 }}>
              {events.length} eventos com fonte · {clusterCount} grupos do dia ·{" "}
              {fichaCount} fichas agrupadas
            </p>
          )}
        </div>
      </form>

      {timeline.length === 0 ? (
        <div className="empty">
          <p>Nenhum evento corresponde a esses filtros.</p>
          <button type="button" className="btn secondary" onClick={reset}>
            Limpar e voltar à timeline completa
          </button>
        </div>
      ) : (
        <div className="timeline">
          {timeline.map(({ yearKey, months }) => (
            <section key={yearKey} aria-labelledby={`ano-${yearKey}`}>
              <h2 className="year-head" id={`ano-${yearKey}`}>
                {yearKey}
              </h2>
              {months.map(({ month, items }) => (
                <section key={month} aria-labelledby={`mes-${month}`}>
                  <h3 className="month-head" id={`mes-${month}`}>
                    {formatMonthHead(`${month}-01`)}
                  </h3>
                  {items.map((item) => {
                    if (item.kind === "cluster") {
                      const { bucket } = item;
                      return (
                        <ForensicCluster
                          key={`dia-${bucket.date}`}
                          date={bucket.date}
                          label={clusterLabel(bucket.events)}
                          events={bucket.events}
                          defaultOpen={dia === bucket.date}
                          onOpenChange={(open) => {
                            setDia(open ? bucket.date : "");
                            writeQuery({ dia: open ? bucket.date : "" });
                          }}
                        />
                      );
                    }
                    return <EventCard key={item.event.id} event={item.event} />;
                  })}
                </section>
              ))}
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
