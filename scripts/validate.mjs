#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const eventsDir = path.join(root, "data", "events");
const peopleFile = path.join(root, "data", "people.yml");

const DATE_PRECISIONS = new Set(["day", "month", "year"]);
const EVIDENCE_TYPES = new Set([
  "press",
  "primary_document",
  "court",
  "official",
  "other",
]);
const CONFIDENCE = new Set(["high", "medium", "low"]);

function loadYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function loadEvents() {
  const files = fs
    .readdirSync(eventsDir)
    .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
    .sort();
  const events = [];
  for (const file of files) {
    const parsed = loadYaml(path.join(eventsDir, file));
    const list = Array.isArray(parsed) ? parsed : parsed?.events;
    if (!Array.isArray(list)) {
      throw new Error(`${file}: esperado uma lista YAML de eventos.`);
    }
    for (const event of list) {
      events.push({ ...event, _file: file });
    }
  }
  return events;
}

function isIsoDate(value) {
  return typeof value === "string" && /^\d{4}(-\d{2}(-\d{2})?)?$/.test(value);
}

function isUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function extractUrls(text) {
  if (!text) return [];
  const urls = [];
  const re = /https?:\/\/[^\s\]|>,'"]+/g;
  let match;
  while ((match = re.exec(text))) {
    let url = match[0].replace(/[).,;:]+$/g, "");
    url = url.replace(/\/+$/, "");
    if (!urls.includes(url)) urls.push(url);
  }
  return urls;
}

function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    return parsed.href.replace(/\/+$/, "");
  } catch {
    return String(url).replace(/\/+$/, "");
  }
}

function parseMarkdownCards(md, sectionHeading) {
  let body = md;
  if (sectionHeading) {
    const start = md.indexOf(sectionHeading);
    if (start < 0) return [];
    body = md.slice(start);
  }
  return body.split(/^### /m).slice(1).map((chunk) => {
    const nl = chunk.indexOf("\n");
    const heading = chunk.slice(0, nl).trim();
    const rest = chunk.slice(nl + 1);
    const cut = rest.search(/\n## /);
    const block = cut >= 0 ? rest.slice(0, cut) : rest;
    return { heading, urls: extractUrls(block) };
  });
}

function parseTimelineCards(md) {
  return parseMarkdownCards(md, "## Full chronological event cards");
}

function personHasEvent(person, list) {
  const names = new Set(
    [person.name, person.shortName, ...(person.aliases ?? [])]
      .filter(Boolean)
      .map((n) =>
        n.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
      ),
  );
  return list.some((event) =>
    (event.people ?? []).some((ref) => {
      if (ref.id === person.id) return true;
      if (!ref.name) return false;
      const n = ref.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      return names.has(n);
    }),
  );
}

const errors = [];
const warnings = [];

const events = loadEvents();
const people = loadYaml(peopleFile);
const edges = loadYaml(path.join(root, "data", "edges.yml"));
const personIds = new Set(people.map((p) => p.id));
const ids = new Set();

if (!Array.isArray(people) || people.length === 0) {
  errors.push("data/people.yml está vazio.");
}

for (const event of events) {
  const loc = `${event._file} / ${event.id ?? "(sem id)"}`;
  if (!event.id || typeof event.id !== "string") {
    errors.push(`${loc}: falta id (slug).`);
  } else if (ids.has(event.id)) {
    errors.push(`${loc}: id duplicado.`);
  } else {
    ids.add(event.id);
  }

  if (!isIsoDate(event.date)) {
    errors.push(`${loc}: date inválida (${event.date}). Use ISO (YYYY-MM-DD).`);
  }
  if (!DATE_PRECISIONS.has(event.date_precision)) {
    errors.push(`${loc}: date_precision deve ser day|month|year.`);
  }
  if (!event.title || String(event.title).trim().length < 8) {
    errors.push(`${loc}: title ausente ou curto demais.`);
  }
  if (!event.summary || String(event.summary).trim().length < 40) {
    errors.push(`${loc}: summary ausente ou curto demais.`);
  }
  if (!Array.isArray(event.people) || event.people.length === 0) {
    errors.push(`${loc}: people precisa ser um array com ao menos um nome.`);
  } else {
    for (const person of event.people) {
      if (!person?.name) errors.push(`${loc}: pessoa sem name.`);
      if (person?.id && !personIds.has(person.id)) {
        warnings.push(`${loc}: people.id "${person.id}" não está em people.yml.`);
      }
    }
  }
  if (!Array.isArray(event.tags) || event.tags.length === 0) {
    errors.push(`${loc}: tags vazias.`);
  }
  if (!EVIDENCE_TYPES.has(event.evidence_type)) {
    errors.push(`${loc}: evidence_type inválido.`);
  }
  if (event.confidence && !CONFIDENCE.has(event.confidence)) {
    errors.push(`${loc}: confidence inválido.`);
  }

  if (!Array.isArray(event.sources) || event.sources.length === 0) {
    errors.push(`${loc}: EVENTO SEM FONTES — rejeitado.`);
  } else {
    const withUrl = event.sources.filter((s) => s?.url && isUrl(s.url));
    if (withUrl.length === 0) {
      errors.push(`${loc}: EVENTO SEM URL DE FONTE — rejeitado.`);
    }
    for (const source of event.sources) {
      if (!source.publisher) {
        errors.push(`${loc}: fonte sem publisher (${source.url ?? "?"}).`);
      }
      if (source.url && !isUrl(source.url)) {
        errors.push(`${loc}: URL inválida (${source.url}).`);
      }
    }
  }
}

if (events.length < 170) {
  errors.push(
    `Corpus incompleto (${events.length}/170). Base 152 de timeline-eventos.md + densificação de imprensa/PET em data/events/05 e 06.`,
  );
}

const timelineCards = parseTimelineCards(
  fs.readFileSync(path.join(root, "content", "timeline-eventos.md"), "utf8"),
);
if (timelineCards.length !== 152) {
  errors.push(
    `content/timeline-eventos.md deveria ter 152 cards completos; encontrados ${timelineCards.length}.`,
  );
}
const primaryCards = parseMarkdownCards(
  fs.readFileSync(path.join(root, "content", "events-from-primary.md"), "utf8"),
);
if (primaryCards.length !== 128) {
  errors.push(
    `content/events-from-primary.md deveria ter 128 cards PET (1f3de0cb); encontrados ${primaryCards.length}. Extras só entram no YAML após re-merge da timeline.`,
  );
}
const yamlUrls = new Set();
for (const event of events) {
  for (const source of event.sources ?? []) {
    if (source?.url) yamlUrls.add(normalizeUrl(source.url));
  }
}
for (const card of timelineCards) {
  if (card.urls.length === 0) {
    errors.push(`timeline-eventos.md sem URL: ${card.heading}`);
    continue;
  }
  if (!card.urls.some((url) => yamlUrls.has(normalizeUrl(url)))) {
    errors.push(`Card sourced sem URL no YAML: ${card.heading}`);
  }
}
for (const card of primaryCards) {
  if (card.urls.length === 0) {
    errors.push(`events-from-primary.md sem URL: ${card.heading}`);
    continue;
  }
  if (!card.urls.some((url) => yamlUrls.has(normalizeUrl(url)))) {
    errors.push(
      `Card primário sem URL no YAML (aguardar re-merge da timeline): ${card.heading}`,
    );
  }
}

for (const person of people) {
  if (!personHasEvent(person, events)) {
    errors.push(
      `people.yml "${person.id}" não aparece no campo people de nenhum evento sourced.`,
    );
  }
}

if (!Array.isArray(edges) || edges.length === 0) {
  errors.push("data/edges.yml está vazio.");
} else {
  for (const edge of edges) {
    if (!personIds.has(edge.from)) {
      errors.push(`edges.yml from desconhecido: ${edge.from}`);
    }
    if (!personIds.has(edge.to)) {
      errors.push(`edges.yml to desconhecido: ${edge.to}`);
    }
  }
}

function compactDate(event) {
  if (event.date_precision === "year") return event.date.slice(0, 4);
  if (event.date_precision === "month") return event.date.slice(0, 7);
  return event.date;
}

const compact = events
  .filter((event) =>
    (event.sources ?? []).some((source) => source?.url && isUrl(source.url)),
  )
  .map((event) => ({
    date: compactDate(event),
    title: String(event.title).trim(),
    summary: String(event.summary).replace(/\s+/g, " ").trim(),
    sources: [
      ...new Set(
        (event.sources ?? [])
          .map((source) => source.url)
          .filter((url) => isUrl(url)),
      ),
    ],
  }));

const seedPath = path.join(root, "content", "events.json");
fs.writeFileSync(seedPath, `${JSON.stringify(compact, null, 2)}\n`);

if (compact.length < 133) {
  errors.push(
    `content/events.json incompleto (${compact.length}/133 http-sourced).`,
  );
}
for (const [index, item] of compact.entries()) {
  if (!item.date || !item.title || !item.summary || !item.sources?.length) {
    errors.push(`content/events.json[${index}]: faltam date/title/summary/sources.`);
  }
}

const exportDir = path.join(root, "public", "export");
fs.mkdirSync(exportDir, { recursive: true });

const publicEvents = events.map(({ _file, ...rest }) => rest);
fs.writeFileSync(
  path.join(exportDir, "events.json"),
  JSON.stringify(publicEvents, null, 2),
);

const csvEscape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const csvHeader = [
  "id",
  "date",
  "date_precision",
  "title",
  "tags",
  "people",
  "evidence_type",
  "confidence",
  "source_urls",
];
const csvRows = publicEvents.map((event) =>
  [
    event.id,
    event.date,
    event.date_precision,
    event.title,
    (event.tags ?? []).join("|"),
    (event.people ?? []).map((p) => p.name).join("|"),
    event.evidence_type,
    event.confidence ?? "",
    (event.sources ?? []).map((s) => s.url).join(" "),
  ]
    .map(csvEscape)
    .join(","),
);
fs.writeFileSync(
  path.join(exportDir, "events.csv"),
  [csvHeader.join(","), ...csvRows].join("\n"),
);

if (warnings.length) {
  console.warn(`Avisos (${warnings.length}):`);
  for (const warning of warnings) console.warn("  -", warning);
}

if (errors.length) {
  console.error(`Falha na validação (${errors.length} erro(s), ${events.length} eventos):`);
  for (const error of errors) console.error("  -", error);
  process.exit(1);
}

console.log(
  `OK: ${events.length} eventos, ${people.length} pessoas, todos com ao menos uma URL de fonte.`,
);
console.log(
  `Compacto: content/events.json (${compact.length} objetos {date, title, summary, sources})`,
);
console.log("Exportado: public/export/events.json e public/export/events.csv");
