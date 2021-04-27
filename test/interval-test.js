import assert from "assert";
import * as d3 from "../src/index.js";
import {assertInRange} from "./asserts.js";

// It’s difficult to test the timing behavior reliably, since there can be small
// hiccups that cause a timer to be delayed. So we test only the mean rate.
it("interval(callback) invokes the callback about every 17ms", (end) => {
  const then = d3.now();
  let count = 0;
  const t = d3.interval(function() {
    if (++count > 10) {
      t.stop();
      assertInRange(d3.now() - then, (17 - 5) * count, (17 + 5) * count);
      end();
    }
  });
});

it("interval(callback) invokes the callback until the timer is stopped", (end) => {
  let count = 0;
  const t = d3.interval(function() {
    if (++count > 2) {
      t.stop();
      end();
    }
  });
});

it("interval(callback, delay) invokes the callback about every delay milliseconds", (end) => {
  const then = d3.now(), delay = 50, nows = [then];
  const t = d3.interval(function() {
    if (nows.push(d3.now()) > 10) {
      t.stop();
      nows.forEach(function(now, i) { assertInRange(now - then, delay * i - 10, delay * i + 10); });
      end();
    }
  }, delay);
});

it("interval(callback, delay, time) invokes the callback repeatedly after the specified delay relative to the given time", (end) => {
  const then = d3.now() + 50, delay = 50;
  const t = d3.interval(function(elapsed) {
    assertInRange(d3.now() - then, delay - 10, delay + 10);
    t.stop();
    end();
  }, delay, then);
});

it.skip("interval(callback) uses the global context for the callback", (end) => {
  const t = d3.interval(function() {
    assert.strictEqual(this, global);
    t.stop();
    end();
  });
});

it("interval(callback) passes the callback the elapsed time", (end) => {
  const then = d3.now();
  const t = d3.interval(function(elapsed) {
    assert.strictEqual(elapsed, d3.now() - then);
    t.stop();
    end();
  }, 100);
});

it("interval(callback) returns a timer", (end) => {
  let count = 0;
  const t = d3.interval(function() { ++count; });
  assert.strictEqual(t instanceof d3.timer, true);
  t.stop();
  setTimeout(function() {
    assert.strictEqual(count, 0);
    end();
  }, 100);
});

it("interval(callback).restart restarts as an interval", (end) => {
  const then = d3.now(), delay = 50, nows = [then];
  const callback = function() {
    if (nows.push(d3.now()) > 10) {
      t.stop();
      nows.forEach(function(now, i) { assertInRange(now - then, delay * i - 10, delay * i + 10); });
      end();
    }
  };
  const t = d3.interval(callback, delay);
  t.stop();
  t.restart(callback, delay);
});
