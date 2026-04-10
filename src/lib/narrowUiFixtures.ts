export type NarrowCardFixture = {
  fixture_id: string;
  input: string;
  governing_term: string;
  meaning: string;
  use: string;
  lineage?: string;
  carrier?: string;
};

export const UI_CARD_FIXTURES: Record<"two_lane" | "three_lane" | "carrier_inset", NarrowCardFixture> = {
  two_lane: {
    fixture_id: "fx_ui_2_lane_runtime",
    input: "what does due process mean",
    governing_term: "due process",
    meaning: "A guarantee that official decisions must follow fair rules, not arbitrary force.",
    use: "Use it when naming procedure requirements that change what authorities must do next.",
  },
  three_lane: {
    fixture_id: "fx_ui_3_lane_runtime",
    input: "what does due process mean in constitutional law",
    governing_term: "due process",
    meaning: "A legal constraint that requires fair procedure before life, liberty, or property is restricted.",
    use: "Use it to challenge shortcuts and insist on notice, hearing, and reviewable process.",
    lineage: "Lineage: constitutional law, procedural fairness doctrine, and court-enforced limits on state action.",
  },
  carrier_inset: {
    fixture_id: "fx_ui_carrier_inset_runtime",
    input: "what does due process mean with enforceable carriers",
    governing_term: "due process",
    meaning: "A fairness rule that only works when procedure is explicit and enforceable.",
    use: "Use it to bind decisions to evidence, notice, and accountable adjudication steps.",
    lineage: "Lineage: Anglo-American legal procedure refined through appellate review.",
    carrier: "Carrier note: enforceability comes from courts, records, deadlines, and jurisdictional authority.",
  },
};
