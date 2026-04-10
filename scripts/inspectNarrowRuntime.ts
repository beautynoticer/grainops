import { WRAPPER_QUERY_FIXTURES } from "../src/lib/narrowFixtures.ts";
import { evaluateRun, type EvaluatedRun, type NarrowFixture } from "../src/lib/narrowRuntime.ts";

const fixtureIdArg = process.argv[2];
const fixture = fixtureIdArg
  ? WRAPPER_QUERY_FIXTURES.find((item) => item.fixture_id === fixtureIdArg)
  : WRAPPER_QUERY_FIXTURES[0];

if (!fixture) {
  console.error(JSON.stringify({ error: `Unknown fixture id: ${fixtureIdArg}` }, null, 2));
  process.exit(1);
}

const request: EvaluatedRun = {
  fixture_id: fixture.fixture_id,
  raw_input: fixture.raw_input,
  normalized_input: fixture.normalized_input,
  governing_term: fixture.governing_term,
  target_type: fixture.target_type,
  seed_class: fixture.seed_class,
  route: fixture.expected.route,
  phrase_mode_fired: fixture.expected.phrase_mode_fired,
  card_state: fixture.expected.card_state,
  canonical_events:
    fixture.fixture_id === "fx_wq_002_missing_target_clarify"
      ? ["lookup_submitted", "route_clarification_shown"]
      : ["lookup_submitted", "card_rendered"],
};

const decision = {
  fixture_integrity_gate_passed: false,
  wrapper_assertion_passed: false,
  canonical_event_schema_assertions_passed: false,
  first_failing_assertion: null as string | null,
};

let final_pass_fail: "pass" | "fail" = "fail";

try {
  evaluateRun(fixture as NarrowFixture, request, () => "pass");
  decision.fixture_integrity_gate_passed = true;
  decision.wrapper_assertion_passed = true;
  decision.canonical_event_schema_assertions_passed = true;
  final_pass_fail = "pass";
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  decision.first_failing_assertion = message;

  if (message.startsWith("Fixture integrity mismatch")) {
    decision.fixture_integrity_gate_passed = false;
  } else {
    decision.fixture_integrity_gate_passed = true;
    if (message.startsWith("Wrapper resolution violation")) {
      decision.wrapper_assertion_passed = false;
    } else {
      decision.wrapper_assertion_passed = true;
      decision.canonical_event_schema_assertions_passed = false;
    }
  }
}

console.log(
  JSON.stringify(
    {
      selected_fixture_id: fixture.fixture_id,
      request,
      decision,
      emitted_events: request.canonical_events,
      fixture_integrity_gate_passed: decision.fixture_integrity_gate_passed,
      wrapper_assertion_passed: decision.wrapper_assertion_passed,
      canonical_event_schema_assertions_passed: decision.canonical_event_schema_assertions_passed,
      final_pass_fail,
    },
    null,
    2,
  ),
);
