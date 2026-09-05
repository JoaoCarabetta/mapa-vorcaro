import Link from "next/link";
import { evidenceLabel } from "@/lib/format";
import type { EventRecord } from "@/lib/types";

export function ClusterRow({ event }: { event: EventRecord }) {
  const publisher = event.sources[0]?.publisher ?? "fonte";
  return (
    <Link className="cluster-row" href={`/eventos/${event.id}`}>
      <span className="cluster-row-title">{event.title}</span>
      <span className="cluster-row-meta">
        <span className="chip">{evidenceLabel(event.evidence_type)}</span>
        <span className="cluster-row-pub">{publisher}</span>
      </span>
    </Link>
  );
}
