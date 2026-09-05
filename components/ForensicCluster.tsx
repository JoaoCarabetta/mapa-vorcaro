"use client";

import { useEffect, useState } from "react";
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

  return (
    <article className="cluster-card" data-dia={date} data-fichas={count}>
      <details
        className="cluster-details"
        open={open}
        onToggle={(e) => {
          const next = e.currentTarget.open;
          setOpen(next);
          onOpenChange?.(next);
        }}
      >
        <summary
          className="cluster-summary"
          aria-label={`${stamp}: ${label}, ${count} ${count === 1 ? "ficha" : "fichas"}`}
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
        </summary>
        <div className="cluster-children">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </details>
    </article>
  );
}
