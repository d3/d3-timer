import assert from "assert";
import * as d3 from "../src/index.js";
import {assertInRange} from "./asserts.js";

it("timeout(callback) invokes the callback once", end => {
  let count = 0;
  d3.timeout(function() {
    assert.strictEqual(++count, 1);
    end();
  });
});

it("timeout(callback, delay) invokes the callback once after the specified delay", end => {
  const then = d3.now(), delay = 50;
  d3.timeout(function(elapsed) {
    assertInRange(d3.now() - then, delay - 10, delay + 10);
    end();
  }, delay);
});

it("timeout(callback, delay, time) invokes the callback once after the specified delay relative to the given time", end => {
  const then = d3.now() + 50, delay = 50;
  d3.timeout(function(elapsed) {
    assertInRange(d3.now() - then, delay - 10, delay + 10);
    end();
  }, delay, then);
});

it.skip("timeout(callback) uses the global context for the callback", end => {
  d3.timeout(function() {
    assert.strictEqual(this, global);
    end();
  });
});

it("timeout(callback) passes the callback the elapsed time", end => {
  const then = d3.now();
  let count = 0;
  d3.timeout(function(elapsed) {
    assert.strictEqual(elapsed, d3.now() - then);
    end();
  });
});

it("timeout(callback) returns a timer", end => {
  let count = 0;
  const t = d3.timeout(function() { ++count; });
  assert.strictEqual(t instanceof d3.timer, true);
  t.stop();
  setTimeout(function() {
    assert.strictEqual(count, 0);
    end();
  }, 100);
});
