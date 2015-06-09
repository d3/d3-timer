var tape = require("tape"),
    timer = require("../");

require("./inRange");

tape("timer(callback) invokes the callback in about 17ms", function(test) {
  var start = Date.now();
  timer.timer(function() {
    test.inRange(Date.now() - start, 17 - 10, 17 + 10);
    test.end();
    return true;
  });
});

tape("timer(callback) invokes callbacks in scheduling order within a frame", function(test) {
  var results = [];
  timer.timer(function() { results.push(1); return true; });
  timer.timer(function() { results.push(2); return true; });
  timer.timer(function() { results.push(3); return true; });
  timer.timer(function() {
    test.deepEqual(results, [1, 2, 3]);
    test.end();
    return true;
  });
});

tape("timer(callback, delay) invokes callbacks in scheduling order within a frame", function(test) {
  var start = Date.now(),
      results = [];
  timer.timer(function() { results.push(1); return true; }, 100, start);
  timer.timer(function() { results.push(2); return true; }, 100, start);
  timer.timer(function() { results.push(3); return true; }, 100, start);
  timer.timer(function() {
    test.deepEqual(results, [1, 2, 3]);
    test.end();
    return true;
  }, 100, start);
});

tape("timer(callback) invokes the callback about every 17ms until it returns true", function(test) {
  var start = Date.now(), count = 0;
  timer.timer(function() {
    if (++count > 10) {
      test.inRange(Date.now() - start, 170 - 100, 170 + 100);
      test.end();
      return true;
    }
  });
});

tape("timer(callback) invokes the callback until it returns a truthy value", function(test) {
  var count = 0;
  timer.timer(function() {
    if (++count > 2) {
      test.end();
      return 1;
    }
  });
});

tape("timer(callback) passes the callback the elapsed and current time", function(test) {
  var start = Date.now(), count = 0;
  timer.timer(function(elapsed, now) {
    test.equal(elapsed, now - start);
    test.inRange(now, Date.now() - 10, Date.now());
    if (++count > 10) {
      test.end();
      return true;
    }
  }, 0, start);
});

tape("timer(callback) within a callback invokes a new eligible callback within the same frame", function(test) {
  var start = Date.now();
  timer.timer(function(elapsed, now) {
    var delay = Date.now() - start;
    timer.timer(function(elapsed2, now2) {
      test.equal(elapsed2, 0);
      test.equal(now2, now);
      test.inRange(Date.now() - start, delay, delay + 3);
      test.end();
      return true;
    }, 0, now);
    return true;
  });
});

tape("timer(callback, delay) first invokes the callback after the specified delay", function(test) {
  var start = Date.now(), delay = 150;
  timer.timer(function() {
    test.inRange(Date.now() - start, delay - 10, delay + 10);
    test.end();
    return true;
  }, delay);
});

tape("timer(callback, delay) computes the elapsed time relative to the delay", function(test) {
  var delay = 150;
  timer.timer(function(elapsed) {
    test.inRange(elapsed, 0, 10);
    test.end();
    return true;
  }, delay);
});

tape("timer(callback, delay, time) computes the effective delay relative to the specified time", function(test) {
  var delay = 150, skew = 200;
  timer.timer(function(elapsed) {
    test.inRange(elapsed, skew - delay + 17 - 10, skew - delay + 17 + 10);
    test.end();
    return true;
  }, delay, Date.now() - skew);
});

tape("timer(callback) within a timerFlush() does not schedule a duplicate requestAnimationFrame", function(test) {
  var requestAnimationFrame0 = requestAnimationFrame,
      frames = 0;
  requestAnimationFrame = function() { ++frames; return requestAnimationFrame0.apply(this, arguments); };
  timer.timer(function() {
    timer.timer(function() {
      timer.timer(function() {
        requestAnimationFrame = requestAnimationFrame0;
        test.equal(frames, 2);
        test.end();
        return true;
      }, 10);
      return true;
    }, 10);
    return true;
  });
  timer.timerFlush();
});

tape("timer(callback) switches to setTimeout for long delays", function(test) {
  var requestAnimationFrame0 = requestAnimationFrame,
      setTimeout0 = setTimeout,
      frames = 0,
      timeouts = 0;
  requestAnimationFrame = function() { --timeouts, ++frames; return requestAnimationFrame0.apply(this, arguments); }; // calls setTimeout
  setTimeout = function() { ++timeouts; return setTimeout0.apply(this, arguments); };
  timer.timer(function() {
    test.equal(frames, 0);
    test.equal(timeouts, 1);
    timer.timer(function() {
      test.equal(frames, 1);
      test.equal(timeouts, 1);
      timer.timer(function() {
        test.equal(frames, 1);
        test.equal(timeouts, 2);
        requestAnimationFrame = requestAnimationFrame0;
        setTimeout = setTimeout0;
        test.end();
        return true;
      }, 100);
      return true;
    });
    return true;
  }, 100);
});

tape("timer(callback) cancels an earlier setTimeout as appropriate", function(test) {
  var setTimeout0 = setTimeout,
      clearTimeout0 = clearTimeout,
      setTimeouts = [],
      clearTimeouts = [],
      reenter = 0;
  setTimeout = function() { var t = setTimeout0.apply(this, arguments); setTimeouts.push(t); return t; };
  clearTimeout = function(t) { clearTimeouts.push(t); return clearTimeout0.apply(this, arguments); };
  timer.timer(function() {
    test.equal(clearTimeouts.length, 1);
    test.equal(setTimeouts.length, 3);
    setTimeout = setTimeout0;
    clearTimeout = clearTimeout0;
    test.end();
    return true;
  }, 150);
  timer.timer(function() {
    test.equal(clearTimeouts.length, 1);
    test.equal(setTimeouts.length, 2);
    test.equal(clearTimeouts[0], setTimeouts[0]);
    return true;
  }, 100);
});

tape("timer(callback) reuses an earlier setTimeout as appropriate", function(test) {
  var setTimeout0 = setTimeout,
      clearTimeout0 = clearTimeout,
      setTimeouts = [],
      clearTimeouts = [],
      reenter = 0;
  setTimeout = function() { var t = setTimeout0.apply(this, arguments); setTimeouts.push(t); return t; };
  clearTimeout = function(t) { clearTimeouts.push(t); return clearTimeout0.apply(this, arguments); };
  timer.timer(function() {
    test.equal(clearTimeouts.length, 0);
    test.equal(setTimeouts.length, 1);
    return true;
  }, 100);
  timer.timer(function() {
    test.equal(clearTimeouts.length, 0);
    test.equal(setTimeouts.length, 2);
    setTimeout = setTimeout0;
    clearTimeout = clearTimeout0;
    test.end();
    return true;
  }, 150);
});

tape("timerFlush() immediately invokes any eligible timers", function(test) {
  var count = 0;
  timer.timer(function() { return ++count; });
  timer.timerFlush();
  timer.timerFlush();
  test.equal(count, 1);
  test.end();
});

tape("timerFlush() within timerFlush() still executes all eligible timers", function(test) {
  var count = 0;
  timer.timer(function() { if (++count >= 3) return true; timer.timerFlush(); });
  timer.timerFlush();
  test.equal(count, 3);
  test.end();
});
