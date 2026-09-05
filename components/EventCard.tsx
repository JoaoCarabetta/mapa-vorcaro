import Link from "next/link";
import {
  confidenceLabel,
  evidenceLabel,
  formatDate,
  formatEventClock,
  tagLabel,
} from "@/lib/format";
import type { EventRecord } from "@/lib/types";

type Props = {
  event: EventRecord;
  compact?: boolean;
};

export function EventCard({ event, compact = false }: Props) {
  const source = event.sources[0];
  const summaryLen = compact ? 160 : 280;
  const summary = event.summary.replace(/\s+/g, " ").trim();
  const clock = formatEventClock(event);

  return (
    <article
      className={compact ? "event-card event-card-compact" : "event-card"}
      data-event-id={event.id}
    >
      <time className="event-date" dateTime={event.date}>
        {formatDate(event.date, event.date_precision)}
        {clock ? <span className="event-clock">{clock}</span> : null}
      </time>
      <div>
        <h2 className="event-title">
          <Link href={`/eventos/${event.id}`}>{event.title}</Link>
        </h2>
        <p className="event-summary">
          {summary.slice(0, summaryLen)}
          {summary.length > summaryLen ? "…" : ""}
        </p>
        <div className="chips">
          <span className="chip">{evidenceLabel(event.evidence_type)}</span>
          {event.confidence ? (
            <span className={event.confidence === "low" ? "chip chip-low" : "chip"}>
              confiança {confidenceLabel(event.confidence)}
            </span>
          ) : null}
          {event.tags.slice(0, compact ? 2 : 4).map((tag) => (
            <span className="chip" key={tag}>
              {tagLabel(tag)}
            </span>
          ))}
        </div>
        {source?.url ? (
          <p className="event-source">
            Fonte:{" "}
            <a href={source.url} rel="noopener noreferrer">
              {source.publisher}
              {source.title ? ` — ${source.title}` : ""}
            </a>
          </p>
        ) : null}
      </div>
    </article>
  );
}
