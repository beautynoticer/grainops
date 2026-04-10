import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { recordSaveClicked, recordSaveReasonSelected, recordSubmitFlow } from "./narrowEventFlow.ts";
import { clearCanonicalEventLog, getCanonicalEventLog } from "./narrowEventLog.ts";
import { clearNarrowSaves, getNarrowSaves, persistNarrowSave } from "./narrowSaveStore.ts";
import { completeSaveSelection, resolveNarrowSurfaceStateFromRuntime } from "./narrowUiState.ts";

const shellSource = readFileSync(new URL("../components/narrow/NarrowShell.tsx", import.meta.url), "utf8");

test("smoke: clean wrapper query renders result card", () => {
  const runtime = recordSubmitFlow({
    input: "what does due process mean",
    submissionCount: 0,
    previousState: "empty",
  });
  const state = resolveNarrowSurfaceStateFromRuntime("what does due process mean", runtime);

  assert.equal(state.kind, "result");
  assert.equal(state.showCard, true);
});

test("smoke: unresolved wrapper shows clarification and no card", () => {
  const runtime = recordSubmitFlow({
    input: "what does this mean here",
    submissionCount: 0,
    previousState: "empty",
  });
  const state = resolveNarrowSurfaceStateFromRuntime("what does this mean here", runtime);

  assert.equal(state.kind, "wrapper_clarification");
  assert.equal(state.showCard, false);
});

test("smoke: broad pasted input shows narrowing and no card", () => {
  const input = "paragraph one text\nparagraph two text with additional copied material that should be treated as broad context";
  const runtime = recordSubmitFlow({
    input,
    submissionCount: 0,
    previousState: "empty",
  });
  const state = resolveNarrowSurfaceStateFromRuntime(input, runtime);

  assert.equal(state.kind, "unsupported_narrowing");
  assert.equal(state.showCard, false);
});

test("smoke: save menu path persists one canonical reason and completes terminally", () => {
  clearCanonicalEventLog();
  clearNarrowSaves();

  recordSaveClicked();
  persistNarrowSave({
    governing_term: "due process",
    selected_canonical_save_reason: "useful_now",
    timestamp: 123,
    route: "READ",
    seed_class: "legal_civic",
    card_state: "B",
  });
  recordSaveReasonSelected("useful_now");
  const saveUiState = completeSaveSelection("useful_now");

  assert.equal(getNarrowSaves().length, 1);
  assert.equal(getNarrowSaves()[0].selected_canonical_save_reason, "useful_now");
  assert.equal(saveUiState.menuOpen, false);
  assert.equal(saveUiState.completed, true);

  const events = getCanonicalEventLog().map((entry) => entry.name);
  assert.deepEqual(events.slice(-2), ["save_clicked", "save_reason_selected"]);
});

test("smoke: dev inspection panel hidden by default and visible only by explicit opt-in", () => {
  assert.equal(shellSource.includes("Loaded fixture:"), false);
  assert.equal(shellSource.includes("import.meta.env.DEV && <DevInspectionPanel />"), false);
  assert.equal(shellSource.includes('params.get("dev_inspect") === "1"'), true);
  assert.equal(shellSource.includes("{showDevInspection && <DevInspectionPanel />}"), true);
});
