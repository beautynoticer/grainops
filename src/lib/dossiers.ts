export interface SeedDossier {
  term: string;
  shortDefinition: string;
  environments: string[];
  weakSubstitutes: string[];
}

export const SEEDED_DOSSIERS: SeedDossier[] = [
  { term: "honor", shortDefinition: "Publicly due weight expressed through action.", environments: ["kings_court", "traditional_religious", "plain_modern"], weakSubstitutes: ["respect"] },
  { term: "reverence", shortDefinition: "Posture of due submission toward higher reality.", environments: ["traditional_religious", "classical_literary"], weakSubstitutes: ["mindful tone", "politeness"] },
  { term: "fidelity", shortDefinition: "Covenant loyalty under pressure.", environments: ["traditional_religious", "rebel_insurgent", "plain_modern"], weakSubstitutes: ["consistency", "reliability"] },
  { term: "witness", shortDefinition: "Truth-bearing speech with consequence.", environments: ["legal_civic", "traditional_religious", "rebel_insurgent"], weakSubstitutes: ["sharing", "storytelling"] },
  { term: "stewardship", shortDefinition: "Accountable care over entrusted goods.", environments: ["modern_corporate", "traditional_religious"], weakSubstitutes: ["management", "ownership"] },
  { term: "beauty", shortDefinition: "Fitting form that reveals order and draws allegiance.", environments: ["classical_literary", "traditional_religious"], weakSubstitutes: ["aesthetic", "taste"] },
  { term: "obedience", shortDefinition: "Responsive alignment to rightful command.", environments: ["traditional_religious", "kings_court", "legal_civic"], weakSubstitutes: ["compliance"] },
  { term: "freedom", shortDefinition: "Capacity for right action within rightful order.", environments: ["legal_civic", "rebel_insurgent", "plain_modern"], weakSubstitutes: ["autonomy"] },
  { term: "longing", shortDefinition: "Enduring ache toward absent good.", environments: ["classical_literary", "plain_modern"], weakSubstitutes: ["missing", "wanting"] },
  { term: "mercy", shortDefinition: "Costly restraint in judgment for restoration.", environments: ["traditional_religious", "legal_civic"], weakSubstitutes: ["kindness"] },
  { term: "fear", shortDefinition: "Recognition of dangerous magnitude demanding posture.", environments: ["traditional_religious", "rebel_insurgent"], weakSubstitutes: ["anxiety"] },
  { term: "due", shortDefinition: "What obligation rightly requires to be rendered.", environments: ["legal_civic", "kings_court", "plain_modern"], weakSubstitutes: ["fair"] },
];
