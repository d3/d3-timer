import {assert, test} from "vitest";
import {now} from "../src/index.js";
import {assertInRange} from "./asserts.js";

test("now() returns the same time when called repeatedly", () => {
  const then = now();
  assert(then > 0);
  assert.strictEqual(now(), then);
});

test("now() returns a different time when called after a timeout", () => new Promise(end => {
  const then = now();
  assert(then > 0);
  setTimeout(() => {
    assertInRange(now() - then, 50 - 10, 50 + 10);
    end();
  }, 50);
}));
