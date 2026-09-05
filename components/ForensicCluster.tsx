"use client";

import { useEffect, useState } from "react";
import { ClusterRow } from "@/components/ClusterRow";
import { EventCard } from "@/components/EventCard";
import { confidenceLabel, formatDate, formatMonthHead, monthKey } from "@/lib/format";
import type { EventRecord } from "@/lib/types";

type Props = {
  date: string;
  label: string;
  events: EventRecord[];
  precision?: "day" | "month";
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ForensicCluster({
  date,
  label,
  events,
  precision = "day",
  defaultOpen = false,
  onOpenChange,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const count = events.length;
  const stamp =
    precision === "month" ? formatMonthHead(date) : formatDate(date, "day");
  const flagged = events.find(
    (event) => event.confidence === "low" || event.confidence === "medium",
  );
  const clusterDomId = `cluster-${precision}-${date}`;

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    onOpenChange?.(next);
  };

  return (
    <article
      className="cluster-card"
      data-dia={precision === "day" ? date : undefined}
      data-mes={precision === "month" ? monthKey(date) : undefined}
      data-fichas={count}
    >
      <button
        type="button"
        className="cluster-summary"
        aria-expanded={open}
        aria-controls={clusterDomId}
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
      <div id={clusterDomId}>
        {open ? (
          <div className="cluster-microrows" data-ordem="cronologica">
            {events.map((event) => (
              <ClusterRow key={event.id} event={event} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
