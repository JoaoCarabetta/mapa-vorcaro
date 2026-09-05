import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import type { EdgeRecord, EventRecord, PersonRecord } from "./types";
import { compareEventsChrono } from "./format";

const DATA_DIR = path.join(process.cwd(), "data");

function readYaml<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8");
  return yaml.load(raw) as T;
}

export function loadEvents(): EventRecord[] {
  const eventsDir = path.join(DATA_DIR, "events");
  const files = fs
    .readdirSync(eventsDir)
    .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"))
    .sort();

  const events: EventRecord[] = [];
  for (const file of files) {
    const parsed = readYaml<EventRecord[] | { events: EventRecord[] }>(
      path.join(eventsDir, file),
    );
    const list = Array.isArray(parsed) ? parsed : parsed.events;
    if (!Array.isArray(list)) {
      throw new Error(`Arquivo ${file} não contém uma lista de eventos.`);
    }
    events.push(...list);
  }

  return events.sort((a, b) => compareEventsChrono(a, b));
}

export function loadPeople(): PersonRecord[] {
  return readYaml<PersonRecord[]>(path.join(DATA_DIR, "people.yml"));
}

export function loadEdges(): EdgeRecord[] {
  return readYaml<EdgeRecord[]>(path.join(DATA_DIR, "edges.yml"));
}

export function getEventById(id: string): EventRecord | undefined {
  return loadEvents().find((event) => event.id === id);
}

export function getPersonById(id: string): PersonRecord | undefined {
  return loadPeople().find((person) => person.id === id);
}

export function eventsForPerson(personId: string): EventRecord[] {
  const person = getPersonById(personId);
  if (!person) return [];
  return loadEvents().filter((event) =>
    event.people.some(
      (ref) =>
        ref.id === personId ||
        ref.name.toLowerCase() === person.name.toLowerCase(),
    ),
  );
}

export function uniqueTags(events: EventRecord[]): string[] {
  return [...new Set(events.flatMap((event) => event.tags))].sort();
}

export function uniqueYears(events: EventRecord[]): number[] {
  return [
    ...new Set(events.map((event) => Number(event.date.slice(0, 4)))),
  ].sort((a, b) => a - b);
}

export function forensicChildrenOf(
  events: EventRecord[],
  clusterId?: string,
): EventRecord[] {
  if (!clusterId) return [];
  return events
    .filter(
      (event) =>
        event.cluster_id === clusterId && event.cluster_role === "child",
    )
    .sort(compareEventsChrono);
}
