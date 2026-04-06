import type { SourceAnchorView } from "../types/meaning";

export const DEFAULT_SOURCE_ANCHORS: SourceAnchorView[] = [
  {
    id: "anch-formation",
    kind: "scholarship",
    note: "Formation engine primitives populated from seeded environment profiles.",
    confidence: "inferred",
  },
  {
    id: "anch-substitute",
    kind: "text",
    note: "Thin-substitute map matched against known editorial entries.",
    confidence: "verified",
  },
];
