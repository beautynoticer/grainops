import type { ChargeBandView } from "../types/meaning";

export const defaultChargeBands = (coreInvariant: string): ChargeBandView[] => [
  {
    id: "cool",
    label: "Cool",
    examples: ["seriousness", "careful regard"],
    note: `${coreInvariant} stated without ritual demand.`,
    updatedRewrite: "I need this treated with real seriousness.",
  },
  {
    id: "neutral",
    label: "Neutral",
    examples: ["due weight", "respect"],
    note: `${coreInvariant} framed as shared obligation.`,
    updatedRewrite: "I need this given the weight it is due.",
  },
  {
    id: "hot",
    label: "Hot",
    examples: ["honor", "reverence"],
    note: `${coreInvariant} tied to duty and posture.`,
    updatedRewrite: "I need you to honor what is at stake here.",
  },
  {
    id: "extreme",
    label: "Extreme",
    examples: ["fear", "dread"],
    note: `${coreInvariant} treated as dangerous to violate.`,
    updatedRewrite: "Treat this as something dangerous to profane.",
  },
];
