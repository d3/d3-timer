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
      }, 50);
      return true;
    }, 50);
    return true;
  });
  timer.timerFlush();
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
