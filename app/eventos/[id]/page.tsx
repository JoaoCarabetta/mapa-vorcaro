import Link from "next/link";
import { notFound } from "next/navigation";
import { confidenceLabel, evidenceLabel, formatDate } from "@/lib/format";
import { getEventById, loadEvents, loadPeople } from "@/lib/load";
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

  return (
    <div className="wrap">
      <p className="brand-kicker">
        <Link href="/">Timeline</Link> · {formatDate(event.date, event.date_precision)}
      </p>
      <h1>{event.title}</h1>
      <div className="chips" style={{ margin: "12px 0 24px" }}>
        <span className="chip">{evidenceLabel(event.evidence_type)}</span>
        <span className={event.confidence === "low" ? "chip chip-low" : "chip"}>
          confiança {confidenceLabel(event.confidence)}
        </span>
        {event.tags.map((tag) => (
          <Link className="chip" key={tag} href={`/?tag=${encodeURIComponent(tag)}`}>
            {tag}
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
                const known = people.find(
                  (p) => p.id === person.id || p.name === person.name,
                );
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
    </div>
  );
}
