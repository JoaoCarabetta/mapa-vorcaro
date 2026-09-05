"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
  const [open, setOpen] = useState(false);

  const nav = (
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
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/">
          <span className="brand-kicker">Investigação em aberto</span>
          <span className="brand-title">Mapa Vorcaro</span>
        </Link>
        <div className="nav-desktop">{nav}</div>
        <details
          className="nav-mobile"
          open={open}
          onToggle={(e) => setOpen(e.currentTarget.open)}
        >
          <summary>Menu</summary>
          {nav}
        </details>
      </div>
    </header>
  );
}
