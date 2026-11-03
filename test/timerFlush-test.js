import {assert, test} from "vitest";
import {now, timer, timerFlush} from "../src/index.js";

test("timerFlush() immediately invokes any eligible timers", () => {
  let count = 0;
  const t = timer(function() { ++count; t.stop(); });
  timerFlush();
  timerFlush();
  assert.strictEqual(count, 1);
});

test("timerFlush() within timerFlush() still executes all eligible timers", () => {
  let count = 0;
  const t = timer(function() { if (++count >= 3) t.stop(); timerFlush(); });
  timerFlush();
  assert.strictEqual(count, 3);
});

test("timerFlush() observes the current time", () => {
  const start = now();
  let foos = 0, bars = 0, bazs = 0;
  const foo = timer(function() { ++foos; foo.stop(); }, 0, start + 1);
  const bar = timer(function() { ++bars; bar.stop(); }, 0, start);
  const baz = timer(function() { ++bazs; baz.stop(); }, 0, start - 1);
  timerFlush();
  assert.strictEqual(foos, 0);
  assert.strictEqual(bars, 1);
  assert.strictEqual(bazs, 1);
});
