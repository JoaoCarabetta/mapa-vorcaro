export const DATE_PRECISIONS = ["day", "month", "year"] as const;
export type DatePrecision = (typeof DATE_PRECISIONS)[number];

export const EVIDENCE_TYPES = [
  "press",
  "primary_document",
  "court",
  "official",
  "other",
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export const CONFIDENCE_LEVELS = ["high", "medium", "low"] as const;
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];

export type PersonRef = {
  name: string;
  role?: string;
  id?: string;
};

export type Source = {
  url: string;
  publisher: string;
  title?: string;
  accessed?: string;
  quote?: string;
};

export type ClusterRole = "parent" | "child";

export type EventRecord = {
  id: string;
  date: string;
  date_precision: DatePrecision;
  date_end?: string;
  title: string;
  summary: string;
  notes?: string;
  people: PersonRef[];
  tags: string[];
  sources: Source[];
  evidence_type: EvidenceType;
  confidence?: Confidence;
  cluster_id?: string;
  cluster_role?: ClusterRole;
};

export type PersonRecord = {
  id: string;
  name: string;
  shortName?: string;
  aliases?: string[];
  roles: string[];
  summary: string;
  group: "nucleo" | "poder" | "master" | "estado" | "intermediario" | "familia";
};

export type EdgeRecord = {
  from: string;
  to: string;
  type: string;
  label: string;
  confidence: Confidence;
};
