export const metadata = { title: "Exportar" };

export default function ExportPage() {
  return (
    <div className="wrap prose">
      <header className="hero">
        <h1>Exportar os eventos</h1>
        <p className="lede">
          O corpus vive em YAML no repositório. Estas rotas devolvem o mesmo conjunto
          validado, para quem quiser cruzar, espelhar ou auditar.
        </p>
      </header>
      <div className="export-actions">
        <a className="btn" href="/api/export/events.json">
          Baixar JSON
        </a>
        <a className="btn secondary" href="/api/export/events.csv">
          Baixar CSV
        </a>
        <a className="btn secondary" href="/export/events.json">
          JSON estático
        </a>
        <a className="btn secondary" href="/export/events.csv">
          CSV estático
        </a>
      </div>
      <p>
        O compacto <code>content/events.json</code> espelha o YAML em{" "}
        <code>{"{date, title, summary, sources}"}</code>. O corpus completo destas
        rotas é o YAML validado.
      </p>
      <p className="muted">
        O build roda <code>validate</code> antes do <code>next build</code> e grava
        cópias em <code>public/export/</code>.
      </p>
    </div>
  );
}
