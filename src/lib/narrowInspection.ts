import { WRAPPER_QUERY_FIXTURES } from "./narrowFixtures.ts";
import { evaluateRun, type EvaluatedRun } from "./narrowRuntime.ts";
import { resolveNarrowSurfaceState } from "./narrowUiState.ts";

export type InspectionReport = {
  selected_fixture_id: string;
  request_object: EvaluatedRun;
  decision_object: {
    fixture_integrity_gate_passed: boolean;
    wrapper_assertion_passed: boolean;
    canonical_event_schema_assertions_passed: boolean;
    first_failing_assertion: string | null;
  };
  emitted_events: string[];
  pass_fail_assertions: {
    fixture_integrity_gate_passed: boolean;
    wrapper_assertion_passed: boolean;
    canonical_event_schema_assertions_passed: boolean;
  };
  card_state_rendered: string | null;
  final_pass_fail: "pass" | "fail";
};

export const FIXTURE_OPTIONS = WRAPPER_QUERY_FIXTURES.map((fixture) => fixture.fixture_id);

export const inspectFixture = (fixtureId: string): InspectionReport => {
  const fixture = WRAPPER_QUERY_FIXTURES.find((item) => item.fixture_id === fixtureId) ?? WRAPPER_QUERY_FIXTURES[0];

  const request_object: EvaluatedRun = {
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
    canonical_events:
      fixture.governing_term === null ? ["lookup_submitted", "route_clarification_shown"] : ["lookup_submitted", "card_rendered"],
  };

  const decision_object = {
    fixture_integrity_gate_passed: false,
    wrapper_assertion_passed: false,
    canonical_event_schema_assertions_passed: false,
    first_failing_assertion: null as string | null,
  };
  let final_pass_fail: "pass" | "fail" = "fail";

  try {
    evaluateRun(fixture, request_object, () => "pass");
    decision_object.fixture_integrity_gate_passed = true;
    decision_object.wrapper_assertion_passed = true;
    decision_object.canonical_event_schema_assertions_passed = true;
    final_pass_fail = "pass";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    decision_object.first_failing_assertion = message;
    if (message.startsWith("Fixture integrity mismatch")) {
      decision_object.fixture_integrity_gate_passed = false;
    } else {
      decision_object.fixture_integrity_gate_passed = true;
      if (message.startsWith("Wrapper resolution violation")) {
        decision_object.wrapper_assertion_passed = false;
      } else {
        decision_object.wrapper_assertion_passed = true;
        decision_object.canonical_event_schema_assertions_passed = false;
      }
    }
  }

  const resolvedSurface = resolveNarrowSurfaceState(fixture.raw_input);
  const card_state_rendered = resolvedSurface.kind === "result" ? resolvedSurface.card.fixture_id : null;

  return {
    selected_fixture_id: fixture.fixture_id,
    request_object,
    decision_object,
    emitted_events: request_object.canonical_events,
    pass_fail_assertions: {
      fixture_integrity_gate_passed: decision_object.fixture_integrity_gate_passed,
      wrapper_assertion_passed: decision_object.wrapper_assertion_passed,
      canonical_event_schema_assertions_passed: decision_object.canonical_event_schema_assertions_passed,
    },
    card_state_rendered,
    final_pass_fail,
  };
};
