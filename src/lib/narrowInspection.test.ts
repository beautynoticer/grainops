import test from "node:test";
import assert from "node:assert/strict";
import { inspectFixture } from "./narrowInspection.ts";

test("inspection report includes runtime objects and assertion outcomes", () => {
  const report = inspectFixture("fx_wq_001_due_process_meaning");

  assert.equal(report.selected_fixture_id, "fx_wq_001_due_process_meaning");
  assert.equal(Array.isArray(report.emitted_events), true);
  assert.equal(typeof report.request_object, "object");
  assert.equal(typeof report.decision_object, "object");
  assert.equal(typeof report.pass_fail_assertions, "object");
  assert.equal(typeof report.card_state_rendered === "string" || report.card_state_rendered === null, true);
});
