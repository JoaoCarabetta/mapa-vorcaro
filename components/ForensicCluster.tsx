"use client";

import { useEffect, useState } from "react";
import { ClusterRow } from "@/components/ClusterRow";
import { EventCard } from "@/components/EventCard";
import { confidenceLabel, formatDate } from "@/lib/format";
import type { EventRecord } from "@/lib/types";

type Props = {
  date: string;
  label: string;
  events: EventRecord[];
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ForensicCluster({
  date,
  label,
  events,
  defaultOpen = false,
  onOpenChange,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const count = events.length;
  const stamp = formatDate(date, "day");
  const flagged = events.find(
    (event) => event.confidence === "low" || event.confidence === "medium",
  );

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    onOpenChange?.(next);
  };

  return (
    <article className="cluster-card" data-dia={date} data-fichas={count}>
      <button
        type="button"
        className="cluster-summary"
        aria-expanded={open}
        aria-controls={`cluster-${date}`}
        onClick={toggle}
      >
        <time className="cluster-date" dateTime={date}>
          {stamp}
        </time>
        <span className="cluster-label">{label}</span>
        <span className="cluster-count">
          {count} {count === 1 ? "ficha" : "fichas"}
        </span>
        {flagged ? (
          <span
            className={
              flagged.confidence === "low" ? "chip chip-low" : "chip"
            }
          >
            confiança {confidenceLabel(flagged.confidence)}
          </span>
        ) : null}
        <span className="cluster-toggle">
          {open ? "Recolher fichas" : "Abrir fichas"}
        </span>
      </button>
      <div id={`cluster-${date}`}>
        {open ? (
          <div className="cluster-children" data-ordem="cronologica">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="cluster-microrows" data-ordem="cronologica">
            {events.map((event) => (
              <ClusterRow key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
