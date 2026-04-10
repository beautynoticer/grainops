import test from "node:test";
import assert from "node:assert/strict";
import { WRAPPER_QUERY_FIXTURES } from "./narrowFixtures.ts";
import {
  CANONICAL_RUNTIME_EVENTS,
  CANONICAL_SAVE_REASONS,
  PRE_RENDER_GATES,
  assertCanonicalEvent,
  assertCanonicalSaveReason,
  evaluateRun,
  type EvaluatedRun,
  type NarrowFixture,
} from "./narrowRuntime.ts";

const [resolvedFixture, unresolvedFixture] = WRAPPER_QUERY_FIXTURES;

const buildRun = (fixture: NarrowFixture, overrides: Partial<EvaluatedRun> = {}): EvaluatedRun => ({
  fixture_id: fixture.fixture_id,
  raw_input: fixture.raw_input,
  normalized_input: fixture.normalized_input,
  governing_term: fixture.governing_term,
  target_type: fixture.target_type,
  seed_class: fixture.seed_class,
  route: fixture.expected.route,
  phrase_mode_fired: fixture.expected.phrase_mode_fired,
  lineage_rendered: fixture.expected.lineage_rendered,
  carrier_rendered: fixture.expected.carrier_rendered,
  card_state: fixture.expected.card_state,
  canonical_events: fixture.expected.canonical_events_baseline,
  ...overrides,
});

test("adversarial: selected fixture and evaluated object diverge", () => {
  const divergedRun = buildRun(resolvedFixture, {
    normalized_input: "what does due process means",
    canonical_events: ["lookup_submitted", "card_rendered"],
  });

  assert.throws(() => evaluateRun(resolvedFixture, divergedRun, () => "pass"), /Fixture integrity mismatch at normalized_input/);
});

test("adversarial: historical event alias emitted as canonical runtime event", () => {
  assert.throws(() => assertCanonicalEvent("result_rendered"), /Non-canonical runtime event: result_rendered/);
});

test("adversarial: historical notebook save reason emitted as live value", () => {
  assert.throws(() => assertCanonicalSaveReason("saved_to_notebook"), /Non-canonical save reason: saved_to_notebook/);
});

test("adversarial: wrapper query silently invents a governing term", () => {
  const inventedTermRun = buildRun(unresolvedFixture, {
    governing_term: "due process",
    canonical_events: ["lookup_submitted", "card_rendered"],
    card_state: "B",
    phrase_mode_fired: true,
    lineage_rendered: true,
    carrier_rendered: false,
  });

  assert.throws(() => evaluateRun(unresolvedFixture, inventedTermRun, () => "pass"), /Fixture integrity mismatch at governing_term/);
});

test("adversarial: wrapper query renders a card after clarification_required=true", () => {
  const invalidClarificationRun = buildRun(unresolvedFixture, {
    clarification_required: true,
    canonical_events: ["lookup_submitted", "route_clarification_shown", "card_rendered"],
  });
  const fixtureWithInvalidBaseline = {
    ...unresolvedFixture,
    expected: {
      ...unresolvedFixture.expected,
      canonical_events_baseline: ["lookup_submitted", "route_clarification_shown", "card_rendered"],
    },
  };

  assert.throws(
    () => evaluateRun(fixtureWithInvalidBaseline, invalidClarificationRun, () => "pass"),
    /clarification_required=true must emit route_clarification_shown and stop before card rendering/,
  );
});

test("adversarial: unresolved wrapper emits card_rendered instead of route_clarification_shown", () => {
  const wrongEventRun = buildRun(unresolvedFixture, {
    canonical_events: ["lookup_submitted", "card_rendered"],
  });
  const fixtureWithWrongEventBaseline = {
    ...unresolvedFixture,
    expected: {
      ...unresolvedFixture.expected,
      canonical_events_baseline: ["lookup_submitted", "card_rendered"],
    },
  };

  assert.throws(
    () => evaluateRun(fixtureWithWrongEventBaseline, wrongEventRun, () => "pass"),
    /unresolved wrapper_query must clarify and stop before card rendering/,
  );
});

test("resolved and unresolved wrapper branches still pass when structurally valid", () => {
  const resolvedRun = buildRun(resolvedFixture, {
    canonical_events: ["lookup_submitted", "card_rendered"],
  });
  const unresolvedRun = buildRun(unresolvedFixture, {
    canonical_events: ["lookup_submitted", "route_clarification_shown"],
  });

  assert.equal(evaluateRun(resolvedFixture, resolvedRun, () => "pass"), "pass");
  assert.equal(evaluateRun(unresolvedFixture, unresolvedRun, () => "pass"), "pass");
});

test("canonical schemas and narrow gate names remain frozen", () => {
  assert.deepEqual(CANONICAL_RUNTIME_EVENTS, [
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
  ]);

  assert.deepEqual(CANONICAL_SAVE_REASONS, [
    "useful_now",
    "want_to_revisit",
    "helps_me_write",
    "clarified_meaning",
    "lineage_mattered",
  ]);

  assert.deepEqual(PRE_RENDER_GATES, ["source_honesty", "suppression_gate"]);
});
