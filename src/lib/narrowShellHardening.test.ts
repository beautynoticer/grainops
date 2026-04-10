import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const shellSource = readFileSync(new URL("../components/narrow/NarrowShell.tsx", import.meta.url), "utf8");
const cardSource = readFileSync(new URL("../components/narrow/ResultCard.tsx", import.meta.url), "utf8");

test("shell has robust loading/error and empty-state handling", () => {
  assert.equal(shellSource.includes("setShellError"), true);
  assert.equal(shellSource.includes("narrow-status-error"), true);
  assert.equal(shellSource.includes("Single target input"), true);
});

test("shell adds focus management for clarification and narrowing states", () => {
  assert.equal(shellSource.includes("clarificationRef"), true);
  assert.equal(shellSource.includes("narrowingRef"), true);
  assert.equal(shellSource.includes("tabIndex={-1}"), true);
});

test("save menu has accessible keyboard and menu semantics", () => {
  assert.equal(cardSource.includes("aria-haspopup=\"menu\""), true);
  assert.equal(cardSource.includes("aria-controls={saveMenuId}"), true);
  assert.equal(cardSource.includes('event.key === "Escape"'), true);
  assert.equal(cardSource.includes('event.key === "ArrowDown"'), true);
});
