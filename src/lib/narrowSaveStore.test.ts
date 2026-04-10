import test from "node:test";
import assert from "node:assert/strict";
import { clearNarrowSaves, getNarrowSaves, persistNarrowSave } from "./narrowSaveStore.ts";

test("one save creates one persisted record", () => {
  clearNarrowSaves();

  persistNarrowSave({
    governing_term: "due process",
    selected_canonical_save_reason: "useful_now",
    timestamp: 123,
    route: "READ",
    seed_class: "legal_civic",
    card_state: "B",
  });

  const saved = getNarrowSaves();
  assert.equal(saved.length, 1);
  assert.equal(saved[0].governing_term, "due process");
});

test("only canonical reasons persist", () => {
  clearNarrowSaves();

  assert.throws(
    () =>
      persistNarrowSave({
        governing_term: "due process",
        selected_canonical_save_reason: "saved_to_notebook",
        timestamp: 123,
        route: "READ",
        seed_class: "legal_civic",
        card_state: "B",
      }),
    /Non-canonical save reason/,
  );
});

test("repeated save does not widen object shape", () => {
  clearNarrowSaves();

  persistNarrowSave({
    governing_term: "due process",
    selected_canonical_save_reason: "useful_now",
    timestamp: 123,
    route: "READ",
    seed_class: "legal_civic",
    card_state: "B",
  });
  persistNarrowSave({
    governing_term: "equal protection",
    selected_canonical_save_reason: "clarified_meaning",
    timestamp: 456,
    route: "READ",
    seed_class: "legal_civic",
    card_state: "B",
  });

  const expectedKeys = [
    "governing_term",
    "selected_canonical_save_reason",
    "timestamp",
    "route",
    "seed_class",
    "card_state",
  ].sort();

  getNarrowSaves().forEach((record) => {
    assert.deepEqual(Object.keys(record).sort(), expectedKeys);
  });
});
