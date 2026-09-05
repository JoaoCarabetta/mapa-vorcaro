"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Linha do tempo" },
  { href: "/pessoas", label: "Pessoas" },
  { href: "/rede", label: "Rede" },
  { href: "/metodologia", label: "Metodologia" },
  { href: "/sobre", label: "Sobre" },
  { href: "/exportar", label: "Exportar" },
];

export function Header() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/">
          <span className="brand-kicker">Investigação em aberto</span>
          <span className="brand-title">Mapa Vorcaro</span>
        </Link>
        <nav className="nav" aria-label="Principal">
          {LINKS.map((link) => {
            const current =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
