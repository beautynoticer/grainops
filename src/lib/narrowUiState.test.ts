import test from "node:test";
import assert from "node:assert/strict";
import { runFrozenNarrowRuntime } from "./narrowRuntime.ts";
import { SAVE_REASON_OPTIONS, completeSaveSelection, resolveNarrowSurfaceState } from "./narrowUiState.ts";

test("canonical save reasons are rendered as the only options", () => {
  assert.deepEqual(SAVE_REASON_OPTIONS, [
    "useful_now",
    "want_to_revisit",
    "helps_me_write",
    "clarified_meaning",
    "lineage_mattered",
  ]);
});

test("save selection is single-choice and terminal", () => {
  const result = completeSaveSelection("helps_me_write");
  assert.equal(result.menuOpen, false);
  assert.equal(result.selectedReason, "helps_me_write");
  assert.equal(result.completed, true);
});

test("submit clean wrapper query renders normal result card", () => {
  const runtime = runFrozenNarrowRuntime("what does due process mean");
  const state = resolveNarrowSurfaceState("what does due process mean");

  assert.equal(runtime.card_state, "B");
  assert.equal(runtime.clarification_required, false);
  assert.equal(runtime.unsupported_narrowing_required, false);
  assert.equal(state.kind, "result");
  assert.equal(state.showCard, true);
});

test("submit unresolved wrapper shows clarification and no card", () => {
  const runtime = runFrozenNarrowRuntime("what does this mean in this paragraph");
  const state = resolveNarrowSurfaceState("what does this mean in this paragraph");

  assert.equal(runtime.clarification_required, true);
  assert.equal(state.kind, "wrapper_clarification");
  assert.equal(state.showCard, false);
});

test("submit broad pasted input shows narrowing and no card", () => {
  const input = "paragraph one text\nparagraph two text with additional copied material that should be treated as broad context";
  const runtime = runFrozenNarrowRuntime(input);
  const state = resolveNarrowSurfaceState(input);

  assert.equal(runtime.unsupported_narrowing_required, true);
  assert.equal(state.kind, "unsupported_narrowing");
  assert.equal(state.showCard, false);
});

test("submit path uses canonical runtime outputs instead of fixture preview routing", () => {
  const runtime = runFrozenNarrowRuntime("what does equal protection mean");
  const state = resolveNarrowSurfaceState("what does equal protection mean");

  assert.equal(runtime.route, "READ");
  assert.equal(runtime.governing_term, "equal protection");
  assert.equal(runtime.phrase_mode_fired, true);
  assert.equal(runtime.card_state, "B");
  assert.equal(state.kind, "result");
  if (state.kind === "result") {
    assert.equal(state.card.governing_term, "equal protection");
  }
});
