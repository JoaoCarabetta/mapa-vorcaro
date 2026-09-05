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

export type EventRecord = {
  id: string;
  date: string;
  date_precision: DatePrecision;
  title: string;
  summary: string;
  notes?: string;
  people: PersonRef[];
  tags: string[];
  sources: Source[];
  evidence_type: EvidenceType;
  confidence?: Confidence;
};

export type PersonRecord = {
  id: string;
  name: string;
  shortName?: string;
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
