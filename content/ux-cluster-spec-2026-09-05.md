# UX cluster HARD SPEC — PR #8
Date: 2026-09-05 America/Sao_Paulo
Window: 2025-10-28 → 2025-11-17 (~53 forensic)

## Rules
- Flat list FAIL. Daily parent REQUIRED.
- Key: `event.date` day-precision; ≥2 → one parent; singleton = EventCard; chrono inside + across days
- Day wins over tag-cluster; never cross year; no fake cluster of 1

## Closed
- PT date; tag label or `Vários fios`; `N fichas`
- micro title ≤2 lines · evidence · publisher
- confidence chip if any low/med
- collapsed default

## Open
- full EventCards chrono
- `?dia=YYYY-MM-DD`
- citation `/eventos/{id}`

## Density chrome
- Month rail out/nov under 2025
- Mobile full width 44px; no swipe; no Kanban

## Acceptance
- `/` shows daily parents not ~53 cards
- expand N = YAML that day
- `?dia=2025-11-17` opens
- UI survives 63→152
