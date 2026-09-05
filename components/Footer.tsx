import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p>
          Mapa Vorcaro — arquivo jornalístico. Cada evento exige URL de fonte.
          Não é peça de acusação nem de defesa.
        </p>
        <p>
          <Link href="/metodologia">Metodologia</Link>
          {" · "}
          <Link href="/exportar">JSON/CSV</Link>
          {" · "}
          <a href="https://github.com/JoaoCarabetta/mapa-vorcaro">Código</a>
        </p>
      </div>
    </footer>
  );
}
