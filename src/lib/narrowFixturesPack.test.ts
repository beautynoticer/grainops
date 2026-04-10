import test from "node:test";
import assert from "node:assert/strict";
import { PROVING_FIXTURES } from "./narrowFixtures.ts";

test("proving fixture pack covers required narrow classes", () => {
  const seedClasses = new Set(PROVING_FIXTURES.map((fixture) => fixture.seed_class));

  assert.equal(seedClasses.has("opaque_idiom"), true);
  assert.equal(seedClasses.has("legal_civic"), true);
  assert.equal(seedClasses.has("religious_scriptural"), true);
  assert.equal(seedClasses.has("historically_resonant"), true);
  assert.equal(seedClasses.has("ordinary_control"), true);
});

test("proving fixture pack contains both lineage-suppressed and lineage-rendered cases", () => {
  assert.equal(PROVING_FIXTURES.some((fixture) => fixture.expected.lineage_rendered), true);
  assert.equal(PROVING_FIXTURES.some((fixture) => !fixture.expected.lineage_rendered), true);
});

test("proving fixture pack includes a carrier-rendered case", () => {
  assert.equal(PROVING_FIXTURES.some((fixture) => fixture.expected.carrier_rendered), true);
});
