import Link from "next/link";
import { confidenceLabel, evidenceLabel, formatDate } from "@/lib/format";
import type { EventRecord } from "@/lib/types";

export function EventCard({ event }: { event: EventRecord }) {
  return (
    <Link className="event-card" href={`/eventos/${event.id}`}>
      <time className="event-date" dateTime={event.date}>
        {formatDate(event.date, event.date_precision)}
      </time>
      <div>
        <h2 className="event-title">{event.title}</h2>
        <p className="event-summary">
          {event.summary.replace(/\s+/g, " ").trim().slice(0, 280)}
          {event.summary.length > 280 ? "…" : ""}
        </p>
        <div className="chips">
          <span className="chip">{evidenceLabel(event.evidence_type)}</span>
          {event.confidence ? (
            <span className={event.confidence === "low" ? "chip chip-low" : "chip"}>
              confiança {confidenceLabel(event.confidence)}
            </span>
          ) : null}
          {event.tags.slice(0, 4).map((tag) => (
            <span className="chip" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
