export const CANONICAL_RUNTIME_EVENTS = [
  "lookup_submitted",
  "card_rendered",
  "lane_opened_meaning",
  "lane_opened_use",
  "lane_opened_lineage",
  "carrier_note_opened",
  "copy_from_meaning",
  "copy_from_use",
  "copy_from_lineage",
  "save_clicked",
  "save_reason_selected",
  "followup_lookup_submitted",
  "route_clarification_shown",
  "route_clarification_answered",
] as const;

export const CANONICAL_SAVE_REASONS = [
  "useful_now",
  "want_to_revisit",
  "helps_me_write",
  "clarified_meaning",
  "lineage_mattered",
] as const;

export const PRE_RENDER_GATES = ["source_honesty", "suppression_gate"] as const;

export type CanonicalRuntimeEvent = (typeof CANONICAL_RUNTIME_EVENTS)[number];
export type CanonicalSaveReason = (typeof CANONICAL_SAVE_REASONS)[number];
export type PreRenderGate = (typeof PRE_RENDER_GATES)[number];
export type RouteType = "READ";
export type CardState = "B" | null;
export type SeedClass =
  | "legal_civic"
  | "unsupported_unbounded_wrapper"
  | "religious_scriptural"
  | "historically_resonant"
  | "ordinary_control"
  | "opaque_idiom";
export type TargetType = "wrapper_query";

export type FixtureExpectations = {
  route: RouteType;
  phrase_mode_fired: boolean;
  lineage_rendered: boolean;
  carrier_rendered: boolean;
  card_state: CardState;
  canonical_events_baseline: CanonicalRuntimeEvent[];
};

export type NarrowFixture = {
  fixture_id: string;
  raw_input: string;
  normalized_input: string;
  governing_term: string | null;
  target_type: TargetType;
  seed_class: SeedClass;
  expected: FixtureExpectations;
};

export type EvaluatedRun = {
  fixture_id: string;
  raw_input: string;
  normalized_input: string;
  governing_term: string | null;
  target_type: TargetType;
  seed_class: SeedClass;
  route: RouteType;
  phrase_mode_fired: boolean;
  lineage_rendered: boolean;
  carrier_rendered: boolean;
  card_state: CardState;
  canonical_events: string[];
  save_reason?: string;
  clarification_required?: boolean;
};

const canonicalEventSet = new Set<string>(CANONICAL_RUNTIME_EVENTS);
const canonicalSaveReasonSet = new Set<string>(CANONICAL_SAVE_REASONS);

export class FixtureIntegrityError extends Error {}

export const assertCanonicalEvent = (eventName: string): asserts eventName is CanonicalRuntimeEvent => {
  if (!canonicalEventSet.has(eventName)) {
    throw new Error(`Non-canonical runtime event: ${eventName}`);
  }
};

export const assertCanonicalSaveReason = (reason: string): asserts reason is CanonicalSaveReason => {
  if (!canonicalSaveReasonSet.has(reason)) {
    throw new Error(`Non-canonical save reason: ${reason}`);
  }
};

const checkEqual = (name: string, expected: unknown, actual: unknown) => {
  if (expected !== actual) {
    throw new FixtureIntegrityError(`Fixture integrity mismatch at ${name}: expected ${String(expected)} got ${String(actual)}`);
  }
};

export const enforceFixtureIntegrity = (fixture: NarrowFixture, run: EvaluatedRun): void => {
  checkEqual("fixture_id", fixture.fixture_id, run.fixture_id);
  checkEqual("raw_input", fixture.raw_input, run.raw_input);
  checkEqual("normalized_input", fixture.normalized_input, run.normalized_input);
  checkEqual("governing_term", fixture.governing_term, run.governing_term);
  checkEqual("target_type", fixture.target_type, run.target_type);
  checkEqual("seed_class", fixture.seed_class, run.seed_class);
  checkEqual("expected route", fixture.expected.route, run.route);
  checkEqual("expected phrase_mode_fired", fixture.expected.phrase_mode_fired, run.phrase_mode_fired);
  checkEqual("expected lineage_rendered", fixture.expected.lineage_rendered, run.lineage_rendered);
  checkEqual("expected carrier_rendered", fixture.expected.carrier_rendered, run.carrier_rendered);
  checkEqual("expected card_state", fixture.expected.card_state, run.card_state);
  checkEqual(
    "expected canonical_events_baseline",
    JSON.stringify(fixture.expected.canonical_events_baseline),
    JSON.stringify(run.canonical_events),
  );
};

export const assertWrapperResolution = (fixture: NarrowFixture, run: EvaluatedRun): void => {
  if (fixture.target_type !== "wrapper_query") {
    return;
  }

  const hasResolvedTarget = Boolean(run.governing_term);
  const emittedClarification = run.canonical_events.includes("route_clarification_shown");
  const emittedCard = run.canonical_events.includes("card_rendered");

  if (run.clarification_required) {
    if (!emittedClarification || emittedCard) {
      throw new Error("Wrapper resolution violation: clarification_required=true must emit route_clarification_shown and stop before card rendering.");
    }

    return;
  }

  if (hasResolvedTarget) {
    if (!emittedCard || emittedClarification) {
      throw new Error(
        "Wrapper resolution violation: explicit governing_term must continue to card rendering without route clarification.",
      );
    }
    return;
  }

  if (!emittedClarification || emittedCard) {
    throw new Error("Wrapper resolution violation: unresolved wrapper_query must clarify and stop before card rendering.");
  }
};

export const evaluateRun = (
  fixture: NarrowFixture,
  run: EvaluatedRun,
  qualitativeGrader: (fixtureToGrade: NarrowFixture, runToGrade: EvaluatedRun) => "pass" | "fail",
): "pass" | "fail" => {
  enforceFixtureIntegrity(fixture, run);

  run.canonical_events.forEach((eventName) => assertCanonicalEvent(eventName));
  if (run.save_reason) {
    assertCanonicalSaveReason(run.save_reason);
  }

  assertWrapperResolution(fixture, run);

  return qualitativeGrader(fixture, run);
};


export type FrozenRuntimeOutcome = {
  governing_term: string | null;
  route: RouteType;
  phrase_mode_fired: boolean;
  gate_outcome: {
    source_honesty: "pass" | "fail";
    suppression_gate: "pass" | "fail";
  };
  card_state: CardState;
  clarification_required: boolean;
  unsupported_narrowing_required: boolean;
  seed_class: SeedClass;
  canonical_events: CanonicalRuntimeEvent[];
};

const broadRuntimePattern = /(everything|all of|the whole|life|society|entire text|full article|entire paragraph)/i;
const broadRuntimeStructuralPattern = /\n|\r|(?:\S+\s+){39,}\S+/;
const wrapperStemRuntimePattern = /^what does\b/i;
const wrapperTargetRuntimePattern = /^what does ([a-z0-9\- ]{2,}) mean(?:\??)$/i;
const unresolvedRuntimeTargetPattern = /^(this|that|it)$/i;

export const runFrozenNarrowRuntime = (input: string): FrozenRuntimeOutcome => {
  const normalized = input.trim().toLowerCase();

  const baseOutcome: Omit<FrozenRuntimeOutcome, "canonical_events" | "clarification_required" | "unsupported_narrowing_required" | "card_state" | "governing_term" | "phrase_mode_fired" | "seed_class"> = {
    route: "READ",
    gate_outcome: {
      source_honesty: "pass",
      suppression_gate: "pass",
    },
  };

  if (!normalized) {
    return {
      ...baseOutcome,
      governing_term: null,
      phrase_mode_fired: false,
      card_state: null,
      clarification_required: false,
      unsupported_narrowing_required: false,
      seed_class: "unsupported_unbounded_wrapper",
      canonical_events: ["lookup_submitted"],
    };
  }

  if (broadRuntimePattern.test(normalized) || broadRuntimeStructuralPattern.test(input)) {
    return {
      ...baseOutcome,
      governing_term: null,
      phrase_mode_fired: false,
      card_state: null,
      clarification_required: false,
      unsupported_narrowing_required: true,
      seed_class: "unsupported_unbounded_wrapper",
      canonical_events: ["lookup_submitted"],
    };
  }

  const resolvedWrapper = normalized.match(wrapperTargetRuntimePattern);
  if (resolvedWrapper) {
    const target = resolvedWrapper[1].trim();
    if (!target || unresolvedRuntimeTargetPattern.test(target)) {
      return {
        ...baseOutcome,
        governing_term: null,
        phrase_mode_fired: false,
        card_state: null,
        clarification_required: true,
        unsupported_narrowing_required: false,
        seed_class: "unsupported_unbounded_wrapper",
        canonical_events: ["lookup_submitted", "route_clarification_shown"],
      };
    }

    return {
      ...baseOutcome,
      governing_term: target,
      phrase_mode_fired: true,
      card_state: "B",
      clarification_required: false,
      unsupported_narrowing_required: false,
      seed_class: "legal_civic",
      canonical_events: ["lookup_submitted", "card_rendered"],
    };
  }

  if (wrapperStemRuntimePattern.test(normalized)) {
    return {
      ...baseOutcome,
      governing_term: null,
      phrase_mode_fired: false,
      card_state: null,
      clarification_required: true,
      unsupported_narrowing_required: false,
      seed_class: "unsupported_unbounded_wrapper",
      canonical_events: ["lookup_submitted", "route_clarification_shown"],
    };
  }

  return {
    ...baseOutcome,
    governing_term: normalized,
    phrase_mode_fired: false,
    card_state: "B",
    clarification_required: false,
    unsupported_narrowing_required: false,
    seed_class: "legal_civic",
    canonical_events: ["lookup_submitted", "card_rendered"],
  };
};
