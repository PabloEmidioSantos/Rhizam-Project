import test from "node:test";
import assert from "node:assert/strict";
import { getVisiblePartners, partners } from "../src/lib/partnerCarousel.js";

test("keeps all eight partner logos available", () => {
  assert.equal(partners.length, 8);
});

test("returns the requested number of consecutive partners at each layout size", () => {
  for (const visibleCount of [1, 2, 3, 4]) {
    assert.equal(getVisiblePartners(0, visibleCount).length, visibleCount);
  }
});

test("wraps visible partners around the end of the carousel", () => {
  const visible = getVisiblePartners(6, 4);

  assert.deepEqual(visible.map(({ partner }) => partner.name), [
    "RD Station",
    "Braveo",
    "Agile",
    "VTEX",
  ]);
});

test("normalizes negative indexes and rejects invalid visible counts", () => {
  assert.equal(getVisiblePartners(-1, 1)[0].partner.name, "Braveo");
  assert.deepEqual(getVisiblePartners(0, 0), []);
  assert.deepEqual(getVisiblePartners(0, Number.NaN), []);
});
