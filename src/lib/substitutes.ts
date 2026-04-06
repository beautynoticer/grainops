import type { SubstituteMapEntry } from "../types/meaning";

export const SUBSTITUTE_MAP: SubstituteMapEntry[] = [
  {
    thin: ["respect"],
    governing: "honor",
    costOfSubstitution: "Respect can stay polite while honor binds action and obligation.",
    environmentalDifferences: ["Courtly rank", "covenantal duty", "public witness"],
    evidenceExamples: ["Ceremonial address", "oath formulas"],
    confidence: "verified",
    createdBy: "editor",
    status: "active",
  },
  {
    thin: ["consistency", "reliability"],
    governing: "fidelity",
    costOfSubstitution: "Reliability tracks output; fidelity tracks covenant and cost.",
    environmentalDifferences: ["Marriage vows", "military allegiance"],
    evidenceExamples: ["Vow language", "oath keeping"],
    confidence: "verified",
    createdBy: "editor",
    status: "active",
  },
  {
    thin: ["management", "ownership"],
    governing: "stewardship",
    costOfSubstitution: "Management controls assets; stewardship answers for entrusted goods.",
    environmentalDifferences: ["Household economics", "public office"],
    evidenceExamples: ["Custodial obligations"],
    confidence: "verified",
    createdBy: "editor",
    status: "active",
  },
  {
    thin: ["mindfulness", "respectful tone"],
    governing: "reverence",
    costOfSubstitution: "Tone can perform civility while reverence submits to what is due.",
    environmentalDifferences: ["Liturgical practice", "judicial ritual"],
    evidenceExamples: ["Consecration formulas"],
    confidence: "verified",
    createdBy: "editor",
    status: "active",
  },
  {
    thin: ["sharing", "storytelling"],
    governing: "witness",
    costOfSubstitution: "Sharing expresses self; witness binds speech to truth and consequence.",
    environmentalDifferences: ["Court testimony", "public confession"],
    evidenceExamples: ["Testimony language"],
    confidence: "verified",
    createdBy: "editor",
    status: "active",
  },
  {
    thin: ["aesthetic", "taste"],
    governing: "beauty",
    costOfSubstitution: "Taste tracks preference; beauty names an order that claims attention.",
    environmentalDifferences: ["Classical poetics", "sacred art"],
    evidenceExamples: ["Poetic canons"],
    confidence: "verified",
    createdBy: "editor",
    status: "active",
  },
  {
    thin: ["values", "integrity", "excellence"],
    governing: "hollow",
    costOfSubstitution: "Abstract virtue bundles evade enforceable obligations.",
    environmentalDifferences: ["Corporate mission language"],
    evidenceExamples: ["Policy audits"],
    confidence: "verified",
    createdBy: "editor",
    status: "active",
  },
];

export const discoverProvisionalSubstitution = (input: string): string | undefined => {
  if (/hold space/i.test(input)) {
    return "hold space -> witnessed accompaniment";
  }
  return undefined;
};
