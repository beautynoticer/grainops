import { defaultChargeBands } from "./charge";
import { classifyDiagnosis } from "./diagnosis";
import { SEEDED_DOSSIERS } from "./dossiers";
import { DEFAULT_SOURCE_ANCHORS } from "./evidence";
import { SEEDED_ENVIRONMENTS } from "./environments";
import { classifyRoute } from "./routing";
import { discoverProvisionalSubstitution } from "./substitutes";
import type {
  ChamberMemory,
  EnvironmentVariant,
  InterpretRequest,
  InterpretResponse,
  LoadBearingTokenModel,
  TranslationCardResult,
} from "../types/meaning";

const token = (
  id: string,
  text: string,
  role: string,
  environmentalCharge: string,
  usagePatterns: string[],
): LoadBearingTokenModel => ({
  id,
  text,
  role,
  environmentalCharge,
  usagePatterns,
  ladder: {
    thin: ["respect", "care"],
    neutral: ["due weight"],
    thick: ["honor", "reverence"],
    extreme: ["fear", "dread"],
  },
  confidence: "inferred",
});

const buildVariants = (): EnvironmentVariant[] => [
  {
    id: "v1",
    environmentId: "traditional_religious",
    environmentLabel: "Traditional Religious",
    text: "Let this be received with reverence, as a charge entrusted before God and neighbor.",
    tokens: [
      token("t1", "reverence", "names due posture", "Sanctity under covenant", ["liturgy", "catechesis"]),
      token("t2", "charge", "binds speech to obligation", "Office-bearing duty", ["ordination vows", "rule of life"]),
    ],
    constraintNote: "Speech is accountable to sacred order, not personal preference.",
    gains: "Moral gravity and enforceable posture.",
    losses: "Harder to use in secular settings.",
  },
  {
    id: "v2",
    environmentId: "kings_court",
    environmentLabel: "King's Court / Formal Hierarchy",
    text: "Receive this with due honor; it bears the seal of office and admits no levity.",
    tokens: [
      token("t3", "due honor", "sets rank-aligned obligation", "Hierarchy and tribute", ["oath", "court petition"]),
      token("t4", "seal of office", "anchors legitimacy", "Institutional authority", ["decree", "proclamation"]),
    ],
    constraintNote: "Meaning is carried by rank and enforceable protocol.",
  },
  {
    id: "v3",
    environmentId: "plain_modern",
    environmentLabel: "Plain Modern",
    text: "I need this treated as weighty, not handled casually.",
    tokens: [
      token("t5", "weighty", "preserves seriousness without archaism", "Practical accountability", ["boundary setting", "repair talk"]),
      token("t6", "casually", "names the behavior to refuse", "Social cost and trust", ["team norms", "relationship repair"]),
    ],
    constraintNote: "Low ritual world; clarity and follow-through must carry the load.",
  },
  {
    id: "v4",
    environmentId: "modern_corporate",
    environmentLabel: "Modern Corporate",
    text: "This requires disciplined stewardship; informal handling will create downstream risk.",
    tokens: [
      token("t7", "disciplined stewardship", "converts value claim into accountable role", "Operational duty", ["owner assignment", "risk review"]),
      token("t8", "downstream risk", "maps moral weight to consequences", "Institutional consequence", ["incident postmortem", "SLA breach"]),
    ],
    constraintNote: "Meaning must map to ownership, risk, and enforceable process.",
  },
];

const buildResult = (input: string): TranslationCardResult => {
  const diagnosis = classifyDiagnosis(input);
  const routeDecision = classifyRoute(input);
  const coreInvariant = "weight";
  const chargeBands = defaultChargeBands(coreInvariant);

  return {
    route: routeDecision.route,
    diagnosis,
    governingLine: diagnosis.primary === "wrong_word" ? "Reverence" : "Right Word, Missing World Support",
    verdict:
      diagnosis.primary === "wrong_word"
        ? "You are reaching for due weight, not polite tone."
        : diagnosis.primary === "right_word_wrong_world"
          ? "The term is right, but the carriers that once enforced it are gone."
          : diagnosis.primary === "right_word_missing_context"
            ? "The wording is sound; your listener lacks the world that made it obvious."
            : "Your sentence mixes weak substitutes with a world that cannot enforce them.",
    theThing: "A demand for conduct that treats the matter as binding, not optional.",
    theWorld:
      "This meaning survives where obligation has carriers: office, ritual, evidence, vow, sanction, and handoff. Without those, the same word thins into sentiment.",
    variants: buildVariants(),
    gap: "Modern usage often privatizes the claim (feelings) and drops enforceable carriers (office, vow, consequence).",
    coreInvariant,
    chargeBands,
    modernRewrite: chargeBands[1].updatedRewrite,
    recoveryPrompt: {
      mode: "question",
      text: "Which world are you actually operating in, and what carrier can make this enforceable?",
      ctaLabel: "Choose a world",
    },
    sourceAnchors: DEFAULT_SOURCE_ANCHORS,
  };
};

export const interpretInput = (request: InterpretRequest, memory: ChamberMemory): InterpretResponse => {
  const routeDecision = classifyRoute(request.input);
  const result = buildResult(request.input);
  const provisional = discoverProvisionalSubstitution(request.input);

  if (provisional && !memory.provisionalSubstitutions.includes(provisional)) {
    memory.provisionalSubstitutions.push(provisional);
  }

  memory.governingTerm = result.governingLine;
  memory.chosenChargeBandId = request.selectedChargeBandId ?? memory.chosenChargeBandId;
  memory.chosenEnvironmentId = request.selectedEnvironmentIds?.[0] ?? memory.chosenEnvironmentId;

  const selectedBand = result.chargeBands?.find((band) => band.id === memory.chosenChargeBandId);
  if (selectedBand?.updatedRewrite) {
    result.modernRewrite = selectedBand.updatedRewrite;
  }

  if (!result.sourceAnchors?.length) {
    result.sourceAnchors = [{ id: "none", kind: "text", note: "No suitable anchor available.", confidence: "uncertain" }];
  }

  if (SEEDED_DOSSIERS.length < 12 || SEEDED_ENVIRONMENTS.length < 7) {
    result.recoveryPrompt = {
      mode: "warning",
      text: "Seed editorial objects are too thin; expand dossiers and environments before trusting production output.",
    };
  }

  return { routeDecision, result };
};
