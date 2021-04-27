import assert from "assert";
import * as d3 from "../src/index.js";
import {assertInRange} from "./asserts.js";

it("now() returns the same time when called repeatedly", end => {
  const now = d3.now();
  assert(now > 0);
  assert.strictEqual(d3.now(), now);
  end();
});

it("now() returns a different time when called after a timeout", end => {
  const then = d3.now();
  assert(then > 0);
  setTimeout(function() {
    assertInRange(d3.now() - then, 50 - 5, 50 + 5);
    end();
  }, 50);
});
