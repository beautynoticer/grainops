import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const shellSource = readFileSync(new URL("../components/narrow/NarrowShell.tsx", import.meta.url), "utf8");

test("live shell does not expose fixture/debug helper text", () => {
  assert.equal(shellSource.includes("Loaded fixture:"), false);
});

test("dev inspection panel is absent by default", () => {
  assert.equal(shellSource.includes("import.meta.env.DEV && <DevInspectionPanel />"), false);
});

test("dev inspection panel appears only with explicit opt-in", () => {
  assert.equal(shellSource.includes('params.get("dev_inspect") === "1"'), true);
  assert.equal(shellSource.includes("{showDevInspection && <DevInspectionPanel />}"), true);
});
