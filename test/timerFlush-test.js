import assert from "assert";
import * as d3 from "../src/index.js";

it("timerFlush() immediately invokes any eligible timers", end => {
  let count = 0;
  const t = d3.timer(function() { ++count; t.stop(); });
  d3.timerFlush();
  d3.timerFlush();
  assert.strictEqual(count, 1);
  end();
});

it("timerFlush() within timerFlush() still executes all eligible timers", end => {
  let count = 0;
  const t = d3.timer(function() { if (++count >= 3) t.stop(); d3.timerFlush(); });
  d3.timerFlush();
  assert.strictEqual(count, 3);
  end();
});

it("timerFlush() observes the current time", end => {
  const start = d3.now();
  let foos = 0, bars = 0, bazs = 0;
  const foo = d3.timer(function() { ++foos; foo.stop(); }, 0, start + 1);
  const bar = d3.timer(function() { ++bars; bar.stop(); }, 0, start);
  const baz = d3.timer(function() { ++bazs; baz.stop(); }, 0, start - 1);
  d3.timerFlush();
  assert.strictEqual(foos, 0);
  assert.strictEqual(bars, 1);
  assert.strictEqual(bazs, 1);
  end();
});
