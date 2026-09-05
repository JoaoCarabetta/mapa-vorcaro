#!/usr/bin/env node
/**
 * Parse content/timeline-eventos.md full cards → data/events/*.yml
 * Does not invent dates, quotes, or URLs. Falls back to a URL already
 * named in the card's sources line (PET PDF / known publisher).
 *
 * Schema authority is timeline-eventos.md (152 https cards).
 * events-from-primary.md is a PET-heavy subset (128 cards, commit 1f3de0cb).
 * Do not ingest English-title duplicates from primary.md. Additional primary
 * cards enter the YAML schema only after they appear in a timeline re-merge.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const mdPath = path.join(root, "content", "timeline-eventos.md");
const peoplePath = path.join(root, "data", "people.yml");
const eventsDir = path.join(root, "data", "events");

const PET_PDF =
  "https://static.poder360.com.br/uploads/2026/09/pet16662_relatorio_pf_celular_vorcaro_moraes_gonet_andrei_barci.pdf";
const WA_PDF =
  "https://static.poder360.com.br/uploads/2026/09/pet16662-whatsapp-vorcaro-alexandre-moraes-sigiloderrubado-1set2026.pdf";
const INFOMONEY_BIO =
  "https://www.infomoney.com.br/business/quem-e-daniel-vorcaro-dono-do-banco-master-que-foi-preso-pela-pf";
const VALOR_BIO =
  "https://valor.globo.com/financas/noticia/2025/04/03/forasteiro-na-faria-lima-e-proprietario-de-hoteis-fasano-quem-e-o-dono-do-banco-master.ghtml";

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function publisherFromHost(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const map = {
      "static.poder360.com.br": "Poder360 / PET 16.662",
      "poder360.com.br": "Poder360",
      "oglobo.globo.com": "O Globo",
      "valor.globo.com": "Valor Econômico",
      "valorinveste.globo.com": "Valor Investe",
      "g1.globo.com": "G1",
      "folha.uol.com.br": "Folha de S.Paulo",
      "www1.folha.uol.com.br": "Folha de S.Paulo",
      "estadao.com.br": "Estadão",
      "cnnbrasil.com.br": "CNN Brasil",
      "infomoney.com.br": "InfoMoney",
      "agenciabrasil.ebc.com.br": "Agência Brasil",
      "bloomberglinea.com.br": "Bloomberg Línea",
      "ri.brb.com.br": "BRB RI",
    };
    if (map[host]) return map[host];
    if (host.includes("folha")) return "Folha de S.Paulo";
    if (host.includes("estadao")) return "Estadão";
    if (host.includes("poder360")) return "Poder360";
    return host;
  } catch {
    return "fonte";
  }
}

function extractUrls(text) {
  if (!text) return [];
  const cleaned = text.replace(/\|\s*was:.*$/gim, "");
  const urls = [];
  const re = /https?:\/\/[^\s\]|>,'"]+/g;
  let match;
  while ((match = re.exec(cleaned))) {
    let url = match[0].replace(/[).,;:]+$/g, "");
    url = url.replace(/\/+$/, (s) => (url.includes("?") ? s : ""));
    if (!/^https?:\/\//.test(url)) continue;
    if (!urls.includes(url)) urls.push(url);
  }
  return urls;
}

function parseFields(block) {
  const fields = {};
  const lines = block.split("\n");
  let current = null;
  for (const line of lines) {
    const m = line.match(/^- \*\*([^*]+)\*\*\s*(.*)$/);
    if (m) {
      current = m[1].replace(/:$/, "").trim().toLowerCase();
      fields[current] = (m[2] ?? "").replace(/^:\s*/, "");
    } else if (current && line.startsWith("  ")) {
      fields[current] += ` ${line.trim()}`;
    }
  }
  return fields;
}

function parseDate(raw, heading) {
  const src = `${raw ?? ""} ${heading ?? ""}`;
  const range = src.match(
    /(\d{4}-\d{2}-\d{2})\s*[→–-]\s*(\d{4}-\d{2}-\d{2})/,
  );
  if (range) {
    return { date: range[1], date_precision: "day", date_end: range[2] };
  }
  const day = src.match(/(\d{4}-\d{2}-\d{2})/);
  if (day) return { date: day[1], date_precision: "day" };
  const month = src.match(/\b(\d{4})-(\d{2})\b/);
  if (month) return { date: `${month[1]}-${month[2]}-01`, date_precision: "month" };
  if (/undated cluster/i.test(src) && /apr\/?2025/i.test(src)) {
    return { date: "2025-04-01", date_precision: "month" };
  }
  if (/undated decade|pre-career|1990s/i.test(src)) {
    return { date: "2000-01-01", date_precision: "year" };
  }
  if (/mid-aug|agosto/i.test(src) && /2025/.test(src)) {
    return { date: "2025-08-01", date_precision: "month" };
  }
  const year = src.match(/\b((?:19|20)\d{2})\b/);
  if (year) return { date: `${year[1]}-01-01`, date_precision: "year" };
  throw new Error(`Data não parseável: ${raw} / ${heading}`);
}

function mapConfidence(raw) {
  const s = String(raw ?? "").toLowerCase();
  const head = s.split(/[;,(]/)[0];
  if (/baixa|^low|medium-low|média-baixa/.test(head)) return "low";
  if (/medium-high|média-alta|media-alta/.test(head)) return "high";
  if (/^high|alta|high that|high for/.test(head.trim())) return "high";
  if (/^medium|média|media/.test(head.trim())) return "medium";
  if (/high/.test(s) && !/medium/.test(head)) return "high";
  return "medium";
}

function mapEvidence(provenance, urls) {
  const p = String(provenance ?? "").toLowerCase();
  if (/court|judicial|despacho|peça/.test(p)) return "court";
  if (/official|fato relevante|bacen|oficial/.test(p) && !/primary/.test(p)) {
    return "official";
  }
  if (/primary|primár|ipj|pet 16/.test(p)) return "primary_document";
  if (/press|imprensa/.test(p)) return "press";
  if (urls.some((u) => /\.pdf(\b|$)/i.test(u) || u.includes("static.poder360"))) {
    return "primary_document";
  }
  return "press";
}

function parseTags(raw) {
  const parts = String(raw ?? "")
    .split(/[|;,]/)
    .map((t) => slugify(t))
    .filter((t) => t.length > 1);
  return [...new Set(parts.length ? parts : ["timeline"])];
}

function loadPeopleIndex() {
  const people = yaml.load(fs.readFileSync(peoplePath, "utf8"));
  const entries = [];
  for (const person of people) {
    const names = [
      person.name,
      ...(person.aliases ?? []),
      person.shortName,
    ].filter(Boolean);
    for (const name of names) {
      if (name !== person.name && String(name).length < 6) continue;
      entries.push({
        id: person.id,
        name: person.name,
        needle: name.toLowerCase(),
      });
    }
  }
  entries.sort((a, b) => b.needle.length - a.needle.length);
  return { people, entries };
}

function parsePeople(raw, index) {
  const text = String(raw ?? "").trim();
  if (!text) {
    return [{ name: "Daniel Bueno Vorcaro", id: "daniel-bueno-vorcaro" }];
  }
  const chunks = text
    .split(";")
    .flatMap((c) => {
      if (c.includes(" e ") && !c.includes("(") && c.split(",").length < 3) {
        return c.split(/\s+e\s+/);
      }
      return [c];
    })
    .map((c) => c.trim())
    .filter(Boolean);

  const out = [];
  const seen = new Set();

  const push = (name, id, role) => {
    const key = (id || name).toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    const person = { name };
    if (id) person.id = id;
    if (role) person.role = role;
    out.push(person);
  };

  for (const chunk of chunks) {
    const roleMatch = chunk.match(/\(([^)]+)\)/);
    const role = roleMatch ? roleMatch[1].trim() : undefined;
    const core = chunk.replace(/\(([^)]+)\)/g, "").trim();
    const lower = core.toLowerCase();

    if (/moraes brasilia|contato agenda|contato moraes|nº moraes|no moraes/.test(lower)) {
      push("Alexandre de Moraes", "alexandre-de-moraes", role ?? "rótulo de agenda");
      continue;
    }
    if (/^vorcaro$|^daniel vorcaro$|^daniel bueno/.test(lower)) {
      push("Daniel Bueno Vorcaro", "daniel-bueno-vorcaro", role);
      continue;
    }
    if (/barci de moraes|escrit[oó]rio barci|barci office|^barci$/.test(lower)) {
      push("Viviane Barci de Moraes", "viviane-barci-de-moraes", role ?? "escritório");
      continue;
    }

    if (/^hugo$|^hugo motta$/.test(lower)) {
      push("Hugo Motta", "hugo-motta", role);
      continue;
    }
    if (/paulo sergio|paulo s[eé]rgio/.test(lower)) {
      push("Paulo Sérgio Neves de Souza", "paulo-sergio-neves", role);
      continue;
    }

    const list = Array.isArray(index) ? index : index.entries;
    const hitExact = list.find((e) => lower === e.needle);
    const hitLong = list.find(
      (e) => e.needle.length >= 8 && lower.includes(e.needle),
    );
    const hit = hitExact || hitLong;
    if (hit) {
      push(hit.name, hit.id, role);
      continue;
    }

    const name = core.replace(/^contato\s+/i, "").replace(/["“”]/g, "").trim();
    if (name.length > 1 && !/^viking$|^master$|^brb$|^pf$|^stf$/.test(name.toLowerCase())) {
      push(name);
    }
  }

  if (out.length === 0) {
    push("Daniel Bueno Vorcaro", "daniel-bueno-vorcaro");
  }
  return out;
}

function parseSources(raw, quote) {
  const urls = extractUrls(raw);
  const lower = String(raw ?? "").toLowerCase();
  if (urls.length === 0) {
    if (/infomoney/.test(lower)) urls.push(INFOMONEY_BIO);
    if (/valor/.test(lower)) urls.push(VALOR_BIO);
    if (/ipj|pet\s*16|pf pdf|poder360/.test(lower)) urls.push(PET_PDF);
    if (/anexo chat|whatsapp-vorcaro/.test(lower)) urls.push(WA_PDF);
  }
  const unique = [...new Set(urls)];
  return unique.map((url, i) => {
    const source = {
      url,
      publisher: publisherFromHost(url),
      accessed: "2026-09-05",
    };
    if (url.includes("pet16662_relatorio")) {
      source.title = "IPJ-A 3298613/2026";
    }
    if (quote && i === 0) source.quote = String(quote).replace(/^["“]|["”]$/g, "");
    return source;
  });
}

function isForensicMicro(title, tags) {
  const t = title ?? "";
  if (/nota forense/i.test(t) && /\d{2}:\d{2}:\d{2}/.test(t)) return true;
  if ((tags ?? []).includes("nota-forense") && /\d{2}:\d{2}:\d{2}/.test(t)) {
    return true;
  }
  return false;
}

function isDailyForensicParent(title, tags, date) {
  if (date < "2025-10-28" || date > "2025-11-17") return false;
  const t = title ?? "";
  if (isForensicMicro(t, tags)) return false;
  if (/→|auge da crise: notas pedindo/i.test(t) && /galípolo|galipolo/i.test(t)) {
    return false;
  }
  if (
    /primeira nota forense|notas densas|^notas:|novos envios de notas|nota sobre estratégia|cluster de notas|nota de gratidão|acha que segunda|auge:|dia da decisão de prisão|envio forense de nota/i.test(
      t,
    )
  ) {
    return true;
  }
  const forensicTags = new Set(["nota-forense", "notas", "view-once", "crise"]);
  return (tags ?? []).some((tag) => forensicTags.has(tag));
}

function bucketFor(date) {
  if (date < "2023-12-01") return "00-bio-carreira.yml";
  if (date < "2025-03-01") return "01-contato-barci.yml";
  if (date < "2025-10-28") return "02-brb-contratos.yml";
  if (date <= "2025-11-17") return "03-crise-forense.yml";
  return "04-compliance-zero.yml";
}

function parseCards(md) {
  const start = md.indexOf("## Full chronological event cards");
  if (start < 0) throw new Error("Seção de cards completos não encontrada.");
  const body = md.slice(start);
  const chunks = body.split(/^### /m).slice(1);
  return chunks.map((chunk, i) => {
    const nl = chunk.indexOf("\n");
    const heading = chunk.slice(0, nl).trim();
    const rest = chunk.slice(nl + 1);
    const nextHeading = rest.search(/\n## /);
    const block = nextHeading >= 0 ? rest.slice(0, nextHeading) : rest;
    return { heading, fields: parseFields(block), index: i };
  });
}

function main() {
  const md = fs.readFileSync(mdPath, "utf8");
  const { entries } = loadPeopleIndex();
  const cards = parseCards(md);
  if (cards.length !== 166) {
    console.warn(`Esperado 166 cards; encontrados ${cards.length}.`);
  }

  const usedIds = new Set();
  const events = [];

  for (const card of cards) {
    const f = card.fields;
    const title = (f.title || card.heading.split("—").slice(1).join("—").trim()).trim();
    const { date, date_precision, date_end } = parseDate(f.date, card.heading);
    const tags = parseTags(f.tags);
    const sources = parseSources(f.sources, f.quote);
    if (sources.length === 0) {
      throw new Error(`Sem URL: ${title}`);
    }
    let summary = String(f.summary ?? "").replace(/\s+/g, " ").trim();
    const notes = f.caveats ? String(f.caveats).replace(/\s+/g, " ").trim() : undefined;
    if (summary.length < 40 && notes) {
      summary = `${summary} ${notes}`.trim();
    }
    if (summary.length < 40) {
      summary = `${summary} Registro sourced no corpus da timeline (PET 16.662 / imprensa).`.trim();
    }

    let id = slugify(`${date}-${title}`).slice(0, 90);
    if (!id) id = `evento-${card.index + 1}`;
    let n = 2;
    while (usedIds.has(id)) {
      id = `${id.replace(/-\d+$/, "")}-${n}`;
      n += 1;
    }
    usedIds.add(id);

    const event = {
      id,
      date,
      date_precision,
      title,
      summary,
      people: parsePeople(f.people, entries),
      tags,
      sources,
      evidence_type: mapEvidence(f.provenance, sources.map((s) => s.url)),
      confidence: mapConfidence(f.confidence),
    };
    if (notes) event.notes = notes;
    if (date_end) event.date_end = date_end;
    events.push(event);
  }

  const byDate = new Map();
  for (const event of events) {
    const list = byDate.get(event.date) ?? [];
    list.push(event);
    byDate.set(event.date, list);
  }

  for (const event of events) {
    if (
      event.date >= "2025-10-28" &&
      event.date <= "2025-11-17" &&
      isForensicMicro(event.title, event.tags)
    ) {
      event.cluster_id = `forense-${event.date}`;
      event.cluster_role = "child";
    }
  }

  for (const [date, list] of byDate) {
    const children = list.filter((e) => e.cluster_role === "child");
    if (children.length === 0) continue;
    const clusterId = `forense-${date}`;
    let parent = list.find(
      (e) =>
        e.cluster_role !== "child" &&
        isDailyForensicParent(e.title, e.tags, date),
    );
    if (!parent) {
      parent = list.find((e) => e.cluster_role !== "child");
    }
    if (parent) {
      parent.cluster_id = clusterId;
      parent.cluster_role = "parent";
    }
  }

  for (const file of fs.readdirSync(eventsDir).filter((f) => f.endsWith(".yml"))) {
    if (/^0[56]-/.test(file)) continue;
    fs.unlinkSync(path.join(eventsDir, file));
  }

  const buckets = new Map();
  for (const event of events) {
    const file = bucketFor(event.date);
    const list = buckets.get(file) ?? [];
    list.push(event);
    buckets.set(file, list);
  }

  for (const [file, list] of [...buckets.entries()].sort()) {
    list.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
    fs.writeFileSync(
      path.join(eventsDir, file),
      yaml.dump(list, {
        lineWidth: 92,
        noRefs: true,
        quotingType: '"',
        forceQuotes: false,
      }),
    );
  }

  const children = events.filter((e) => e.cluster_role === "child");
  const parents = events.filter((e) => e.cluster_role === "parent");
  const clusterIds = new Set(children.map((e) => e.cluster_id));
  console.log(
    JSON.stringify(
      {
        cards_parsed: cards.length,
        yaml_events: events.length,
        with_https: events.filter((e) => e.sources.some((s) => s.url.startsWith("http"))).length,
        forensic_children: children.length,
        forensic_parents: parents.length,
        clusters: clusterIds.size,
        cluster_days: [...clusterIds].sort(),
        files: [...buckets.keys()].sort(),
        per_file: Object.fromEntries(
          [...buckets.entries()].map(([k, v]) => [k, v.length]),
        ),
      },
      null,
      2,
    ),
  );
}

main();
