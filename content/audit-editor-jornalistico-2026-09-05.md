# Audit Editor jornalístico — timeline-eventos.md
Date: 2026-09-05 America/Sao_Paulo
File: `/workspace/vorcaro/timeline-eventos.md` (1869 lines; md5 `f9d0d2520fc5c2d90ec606ff7383586c`)
Repo check: `JoaoCarabetta/mapa-vorcaro` **has** `content/timeline-eventos.md` on `main`. Local vs repo: **identical** (224510 bytes, same md5). Also under `content/`: `events-from-press.md`, `events-from-primary.md`, `resumo-pet16662.md`.

## Pass / Fail summary
- Caveats present: **yes** (all 4 in `## Notes` L7–12)
  1. Agenda label ≠ proven chip owner — **yes**
  2. View-once / 24h disappearing incomplete — **yes**
  3. Barci disputes 2nd contract / dação — **yes**
  4. Confidence honest / PF non-exhaustive — **yes** (Notes §4)
- Compact table rows: **152**; missing https: **0**; **wrong https: 11** (10× Valor Apr/2025 bio paste + 1× Folha SPA for Estadão claim)
- Full cards: **152**; missing https: **0**; wrong/partial source cards: **≥7**
- Overclaim / dispute / view-once flags: **14** (card-level; Notes themselves pass)
- Invented-quote suspects: **0 fabricated**; **1 unrecoverable-from-cited-https** (Estadão quote on L529)
- Wrong-source flags: **18** (compact+full, counting distinct rows/cards)
- Per-card confidence: present on **all 152** full cards

## BAD CARDS (do not rewrite — flag only)

### BLOCKER — Wrong source URL (Valor 03/04/2025 “forasteiro” bio on non-bio claims)

| date | title | where | problem | evidence |
|---|---|---|---|---|
| 2025-05-12 | Second Barci contract (Viking, up to R$50 mi) and aircraft settlement dispute | compact L68 | Valor bio URL for Viking/dação | URL=`.../2025/04/03/forasteiro-...`. Full L687 has correct Poder360+PDF. Blurb PF-only despite “dispute” in title. |
| ~mid-Aug 2025 | Ibaneis sanctions CLDF law authorizing BRB to buy Master shares | compact L79 | Valor bio for Ibaneis/CLDF | Prose cites Agência Brasil; URL is Valor bio. |
| ~Sep 2025 | Temer says he was called to mediate BRB–Master after BC block | compact L81 | Valor bio for Temer/Roda Viva | Prose cites G1 conexões; URL is Valor bio. |
| 2025-09-17 | Moraes-labeled contact activates 24h ephemeral messages | compact L83 | Valor bio for 24h ephemeral PF fact | Twin L82 correctly uses PF PDF. |
| 2025-10-01 | Pix warning on Barci payments; four “deleted by sender” bubbles | compact L84 | Valor bio for Pix/deleted msgs | Twin L85 correctly uses PF PDF. |
| 2025-11-28 | Soltura with electronic ankle monitor and restrictions | compact L157 | Valor bio for TRF-1 release | Prose cites G1; URL is Valor bio. |
| ~2025-12-03 | Toffoli places Master inquiry under secrecy at STF | compact L158 | Valor bio for G1 Toffoli secrecy | Prose cites G1 conexões; URL is Valor bio. |
| 2026-01-14 | Searches at Vorcaro family, Zettel, Tanure, Mansur | compact L159 | Valor bio for G1 2ª fase | Prose cites G1; URL is Valor bio. |
| 2026-04-16 | 4ª fase: PH Costa arrested over Master portfolio deals | compact L163 | Valor bio for Estadão PH Costa arrest | Prose cites Estadão; URL is Valor bio. |
| 2026-09-01 | Methodological caveats crystallized in same-day coverage | compact L170 | Valor bio for Sep/2026 caveat cluster | Full L1798 has correct Poder360/O Globo cluster. |

### BLOCKER — Wrong / non-supporting https for the claim (full + compact)

| date | title | where | problem | evidence |
|---|---|---|---|---|
| 2024-07 | BRB injects liquidity via credit-portfolio purchases from Master | compact L53 + full L529 | Compact→Folha Mar/2025 SPA; full→Agência Brasil veto + Valor bio. Claim/quote are Estadão Apr/2026. | Quote on L529: “Tem notícia do BRB?…” attributed to Estadão; listed https cannot recover it (text exists only in local `sources/press/estadao_brb_urgenca.txt`). |
| 2025-11-28 | Soltura… | full L1664 | https = Agência Brasil veto + Valor bio + Valor PF-op + CNN liquidação — not G1/TRF-1 soltura | G1 only in `was:` crumb. |
| ~2025-12-03 | Toffoli secrecy… | full L1674 | https = Poder360 íntegras + Valor 18/11 PF op — not G1 conexões | G1 only in `was:`. |
| 2026-01-14 | Searches… | full L1684 | Same pattern as Toffoli card | G1 only in `was:`. |
| 2026-04-16 | PH Costa arrested… | full L1724 | https = Agência Brasil + Valor bio + Poder360 íntegras + Valor 18/11 — not Estadão | Estadão only in `was:`. |
| ~mid-Aug 2025 | Ibaneis… | full L802 | Agência Brasil OK + **Valor bio as 2nd https** | Wrong secondary; G1 only in prose/`was:`. Severity: **major** if Agência Brasil alone accepted for sanction fact. |
| ~Sep 2025 | Temer mediation… | full L822 | Agência Brasil veto + Valor bio for G1/Roda Viva claim | No G1 https. |

### MAJOR — Barci 2nd contract / dação without dispute on compact row

| date | title | where | problem | evidence |
|---|---|---|---|---|
| 2025-05-12 | Contrato Viking Participações × Barci… | compact L67 | Correct Viking PDF URL but blurb presents contract as settled; no Barci dispute | Full L676 has dispute caveat — compact does not. |
| 2025-05-19 | Termo de Acordo e Dação Viking×Barci… | compact L69 | Correct dação PDF; blurb presents quitação as settled | Full L698 has dispute caveat. |
| 2025-05-12 | Second Barci… dispute (twin) | compact L68 | Title says dispute; blurb PF-only + wrong URL | See blocker above. |

*Full Viking cards L676 / L687 / L698: PASS dispute check (caveats present; L687 confidence hedges acceptance).*

### MAJOR — View-once / agenda caveat gap

| date | title | where | problem | evidence |
|---|---|---|---|---|
| 2025-11-17 | Final reproduced WhatsApp line before arrest (“Estou online”) | full L1556 | Missing view-once + agenda≠chip on card | Caveats only cover arrest night vs morning. Sibling L1544 has both caveats. People=“contact Moraes”; Poder360 headline says “escreveu a Moraes”. |

Most other crisis/forensic cards (~64) **pass** with view-once/agenda caveats.

### MAJOR — Duplicate compact twins with conflicting sources

| date | titles | problem | evidence |
|---|---|---|---|
| 2025-09-17 | L82 (PF PDF) vs L83 (Valor bio) | Same atomic fact; one correct, one wrong URL | Compact |
| 2025-10-01 | L85 (PF PDF) vs L84 (Valor bio) | Same | Compact |
| 2025-05-12 | L67 (Viking PDF, no dispute) vs L68 (Valor bio, “dispute” title) | Divergent sourcing + dispute handling | Compact |

EN/PT full twins (2025-11-17, 2026-08-27, 2026-09-01) are mostly complementary — OK if sources stay aligned.

### MINOR — Encounter cards high conf without unilateral-claim caveat

| date | title | where | problem |
|---|---|---|---|
| 2025-03-19 | Vorcaro a Martha “com o Ministro” / “com Moraes” | full L571 | High; no “afirmação unilateral” (Stella L540 has it) |
| 2025-03-20 | Hugo e Ciro “pra falarem com Alexandre” | full L581 | Same |
| 2025-04-19 | indo encontrar “alexandre moraes” | full L656 | Same |
| 2025-04-29 | está com “Alexandre” | full L666 | Same |
| 2025-05-21 | em casa com “Ciro e alexandre” | full L709 | Same |
| 2025-08-08 | está com “alexandre” | full L792 | Same |

### MINOR — Confidence wording on disputed Viking PDFs

| date | title | where | problem |
|---|---|---|---|
| 2025-05-12 | Contrato Viking… | full L676 | `confidence: high` while acceptance disputed — mitigated by caveat; prefer L687 hedge |
| 2025-05-19 | Termo de Dação… | full L698 | Same |

### Quotes
- **26** cards have `quote:` fields.
- Sample-checked against PF PDF / Poder360 / O Globo / Valor Investe: **no fabricated quotes found**.
- **L529**: Estadão quote is real in local mirror but **not recoverable from card’s cited https** → flag as wrong-source / sourcing failure (blocker), not invention.

## Gaps for PM/schema
1. Compact `source URL` not validated against claim — systematic Valor bio paste (≥10 non-bio rows).
2. Compact omits dispute/view-once hedges that full cards carry.
3. `was:` crumbs + bare outlet names (Estadão, G1, O Globo) without https for that outlet.
4. EN/PT duplicate rows need `twin_id` so wrong-URL twins cannot diverge.
5. Martha encounter cards lack standard unilateral-claim caveat (Stella has it).
6. Bibliography lists 29 URLs; file has ~37 unique https; needed Estadão/G1 soltura/G1 conexões URLs missing from bibliography.
7. Free-text confidence; no enum for disputed acceptance.
8. Notes are excellent; per-card inheritance inconsistent (forensic usually OK; press/compact often not).

## Verdict
**NOT READY** for ship. File-level mandatory caveats and most primary PF/WhatsApp forensic cards are careful (https present; view-once/agenda caveats on crisis cluster; Barci dispute on full Viking cards). Ship is blocked by **systematic wrong-source failure in the Compact PM table** (Valor Apr 2025 bio reused for Viking, ephemeral chat, Pix, Ibaneis, Temer, soltura, Toffoli, searches, PH Costa, caveat cluster) plus full press cards whose https do not support the claim (Estadão liquidity/quote, Temer/G1, TRF-1 soltura, etc.). Fix compact/full source parity on those rows before publish.
