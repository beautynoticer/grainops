import test from "node:test";
import assert from "node:assert/strict";
import { clearCanonicalEventLog, getCanonicalEventLog } from "./narrowEventLog.ts";
import { recordSaveClicked, recordSaveReasonSelected, recordSubmitFlow } from "./narrowEventFlow.ts";

test("canonical events fire on clean wrapper resolve", () => {
  clearCanonicalEventLog();

  recordSubmitFlow({
    input: "what does due process mean",
    submissionCount: 0,
    previousState: "empty",
  });

  const names = getCanonicalEventLog().map((entry) => entry.name);
  assert.deepEqual(names, ["lookup_submitted", "card_rendered"]);
});

test("clarification path emits route_clarification_shown and not card_rendered", () => {
  clearCanonicalEventLog();

  recordSubmitFlow({
    input: "what does this mean here",
    submissionCount: 0,
    previousState: "empty",
  });

  const names = getCanonicalEventLog().map((entry) => entry.name);
  assert.equal(names.includes("route_clarification_shown"), true);
  assert.equal(names.includes("card_rendered"), false);
});

test("save flow emits save_clicked then save_reason_selected", () => {
  clearCanonicalEventLog();

  recordSaveClicked();
  recordSaveReasonSelected("useful_now");

  const names = getCanonicalEventLog().map((entry) => entry.name);
  assert.deepEqual(names, ["save_clicked", "save_reason_selected"]);
});
