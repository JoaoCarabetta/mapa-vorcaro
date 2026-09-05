"use client";

import { useEffect, useState } from "react";
import { EventCard } from "@/components/EventCard";
import { formatDate } from "@/lib/format";
import type { EventRecord } from "@/lib/types";

type Props = {
  parent: EventRecord;
  children: EventRecord[];
  defaultOpen?: boolean;
};

export function ForensicCluster({ parent, children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const count = children.length;
  const stamp = formatDate(parent.date, parent.date_precision);

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  return (
    <article className="cluster-card">
      <p className="cluster-kicker">
        Cluster forense · {stamp} · {count} {count === 1 ? "micro-card" : "micro-cards"}{" "}
        (Notas → WhatsApp)
      </p>
      <EventCard event={parent} />
      <details
        className="cluster-details"
        open={open}
        onToggle={(e) => setOpen(e.currentTarget.open)}
      >
        <summary className="cluster-summary">
          Ver {count} carimbos forenses deste dia
        </summary>
        <ul className="cluster-children">
          {children.map((child) => (
            <li key={child.id}>
              <EventCard event={child} compact />
            </li>
          ))}
        </ul>
      </details>
    </article>
  );
}
