import {assert, test} from "vitest";
import {now, timeout, timer} from "../src/index.js";
import {assertInRange} from "./asserts.js";

test("timeout(callback) invokes the callback once", () => new Promise(end => {
  let count = 0;
  timeout(function() {
    assert.strictEqual(++count, 1);
    end();
  });
}));

test("timeout(callback, delay) invokes the callback once after the specified delay", () => new Promise(end => {
  const then = now(), delay = 50;
  timeout(function() {
    assertInRange(now() - then, delay - 10, delay + 10);
    end();
  }, delay);
}));

test("timeout(callback, delay, time) invokes the callback once after the specified delay relative to the given time", () => new Promise(end => {
  const then = now() + 50, delay = 50;
  timeout(function() {
    assertInRange(now() - then, delay - 10, delay + 10);
    end();
  }, delay, then);
}));

test("timeout(callback) uses the undefined context for the callback", () => new Promise(end => {
  timeout(function() {
    assert.strictEqual(this, undefined);
    end();
  });
}));

test("timeout(callback) passes the callback the elapsed time", () => new Promise(end => {
  const then = now();
  timeout(function(elapsed) {
    assert.strictEqual(elapsed, now() - then);
    end();
  });
}));

test("timeout(callback) returns a timer", () => new Promise(end => {
  let count = 0;
  const t = timeout(function() { ++count; });
  assert.strictEqual(t instanceof timer, true);
  t.stop();
  setTimeout(function() {
    assert.strictEqual(count, 0);
    end();
  }, 100);
}));
