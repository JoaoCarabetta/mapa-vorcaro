import Link from "next/link";
import { notFound } from "next/navigation";
import { confidenceLabel, evidenceLabel, formatDate, formatEventClock, tagLabel } from "@/lib/format";
import { forensicChildrenOf, getEventById, loadEvents, loadPeople, personRefMatches } from "@/lib/load";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return loadEvents().map((event) => ({ id: event.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = getEventById(id);
  return { title: event?.title ?? "Evento" };
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  const event = getEventById(id);
  if (!event) notFound();
  const people = loadPeople();
  const quotes = event.sources.filter((s) => s.quote);
  const all = loadEvents();
  const clusterParent =
    event.cluster_role === "child"
      ? all.find(
          (candidate) =>
            candidate.cluster_id === event.cluster_id &&
            candidate.cluster_role === "parent",
        )
      : undefined;
  const clusterChildren =
    event.cluster_role === "parent"
      ? forensicChildrenOf(all, event.cluster_id)
      : [];
  const index = all.findIndex((candidate) => candidate.id === event.id);
  const prev = index > 0 ? all[index - 1] : undefined;
  const next = index >= 0 && index < all.length - 1 ? all[index + 1] : undefined;

  return (
    <div className="wrap">
      <p className="brand-kicker">
        <Link href={`/?dia=${event.date}`}>Linha do tempo</Link>
        {" · "}
        {formatDate(event.date, event.date_precision)}
      </p>
      <h1>{event.title}</h1>
      <div className="chips" style={{ margin: "12px 0 24px" }}>
        <span className="chip">{evidenceLabel(event.evidence_type)}</span>
        <span className={event.confidence === "low" ? "chip chip-low" : "chip"}>
          confiança {confidenceLabel(event.confidence)}
        </span>
        {event.tags.map((tag) => (
          <Link className="chip" key={tag} href={`/?tag=${encodeURIComponent(tag)}`}>
            {tagLabel(tag)}
          </Link>
        ))}
      </div>

      <div className="detail-grid">
        <article className="prose">
          {event.summary
            .trim()
            .split(/\n\n+/)
            .map((para) => (
              <p key={para.slice(0, 24)}>{para.replace(/\s+/g, " ").trim()}</p>
            ))}
          {event.notes ? (
            <div className="caveat">
              <strong>Nota de método.</strong> {event.notes}
            </div>
          ) : null}
          {clusterParent ? (
            <p>
              Ficha deste dia, agrupada em{" "}
              <Link href={`/?dia=${event.date}`}>{clusterParent.title}</Link>.
            </p>
          ) : null}
          {clusterChildren.length > 0 ? (
            <div>
              <h2>Outras fichas deste dia ({clusterChildren.length})</h2>
              <ol data-ordem="cronologica">
                {clusterChildren.map((child) => (
                  <li key={child.id}>
                    <Link href={`/eventos/${child.id}`}>{child.title}</Link>
                    {formatEventClock(child) ? (
                      <span className="muted"> · {formatEventClock(child)}</span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
          {quotes.map((source) => (
            <blockquote className="quote" key={source.quote}>
              “{source.quote}”
              <br />
              <small className="muted">
                {source.publisher}
                {source.title ? ` — ${source.title}` : ""}
              </small>
            </blockquote>
          ))}
        </article>
        <aside>
          <div className="side-card">
            <h2>Pessoas</h2>
            <ul>
              {event.people.map((person) => {
                const known = people.find((p) => personRefMatches(p, person));
                return (
                  <li key={`${person.name}-${person.role ?? ""}`}>
                    {known ? (
                      <Link href={`/pessoas/${known.id}`}>{person.name}</Link>
                    ) : (
                      person.name
                    )}
                    {person.role ? <span className="muted"> — {person.role}</span> : null}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="side-card">
            <h2>Fontes</h2>
            <ul className="source-list">
              {event.sources.map((source) => (
                <li className="source-item" key={source.url}>
                  <div className="source-pub">{source.publisher}</div>
                  <a href={source.url} rel="noopener noreferrer">
                    {source.title ?? source.url}
                  </a>
                  {source.accessed ? (
                    <div className="muted">acesso {source.accessed}</div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
      <nav className="ficha-nav" aria-label="Fichas vizinhas">
        {prev ? (
          <Link href={`/eventos/${prev.id}`}>← {prev.title}</Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/eventos/${next.id}`}>{next.title} →</Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
