import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../components/narrow/DevModelWorkbench.tsx", import.meta.url), "utf8");

test("workbench exposes required comparison buckets", () => {
  [
    "directly_supported",
    "inferred",
    "distortion_risk",
    "decorative_surplus",
    "runtime_fidelity",
    "scope_discipline",
    "correction_worth_testing",
  ].forEach((bucket) => assert.equal(source.includes(bucket), true));
});

test("workbench stays plain with no leaderboard/blended-summary language", () => {
  assert.equal(source.includes("leaderboard"), false);
  assert.equal(source.includes("benchmark"), false);
  assert.equal(source.includes("blended summary"), false);
});
