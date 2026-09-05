import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap">
      <header className="hero">
        <p className="brand-kicker">404</p>
        <h1>Esta ficha não existe neste arquivo</h1>
        <p className="lede">
          O endereço não corresponde a um evento ou a uma pessoa do corpus. Pode ser
          link quebrado — ou um fato que ainda não passou pelo teste da fonte.
        </p>
        <p>
          <Link className="btn" href="/">
            Voltar à linha do tempo
          </Link>
        </p>
      </header>
    </div>
  );
}
