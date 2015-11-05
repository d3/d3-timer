var tape = require("tape"),
    timer = require("../");

require("./inRange");

tape("timer(callback) invokes the callback in about 17ms", function(test) {
  var t = timer.timer(function(elapsed) {
    test.inRange(elapsed, 17 - 10, 17 + 10);
    test.end();
    t.stop();
  });
});

tape("timer(callback) passes the callback the elapsed and current time", function(test) {
  var then = Date.now();
  var t = timer.timer(function(elapsed, now) {
    test.inRange(now, Date.now() - 5, Date.now());
    test.equal(elapsed, now - then);
    test.end();
    t.stop();
  }, 0, then);
});

tape("timer(callback) invokes callbacks in scheduling order within a frame", function(test) {
  var results = [];
  var t0 = timer.timer(function() { results.push(1); t0.stop(); });
  var t1 = timer.timer(function() { results.push(2); t1.stop(); });
  var t2 = timer.timer(function() { results.push(3); t2.stop(); });
  var t3 = timer.timer(function() {
    test.deepEqual(results, [1, 2, 3]);
    test.end();
    t3.stop();
  });
});

tape("timer(callback, delay) invokes callbacks in scheduling order within a frame", function(test) {
  var then = Date.now(), results = [];
  var t0 = timer.timer(function() { results.push(1); t0.stop(); }, 100, then);
  var t1 = timer.timer(function() { results.push(2); t1.stop(); }, 100, then);
  var t2 = timer.timer(function() { results.push(3); t2.stop(); }, 100, then);
  var t3 = timer.timer(function() {
    test.deepEqual(results, [1, 2, 3]);
    test.end();
    t3.stop();
  }, 100, then);
});

tape("timer(callback) invokes the callback about every 17ms", function(test) {
  var start = Date.now(), count = 0;
  var t = timer.timer(function() {
    if (++count >= 10) {
      test.inRange(Date.now() - start, 170 - 50, 170 + 50);
      test.end();
      t.stop();
    }
  });
});

tape("timer(callback) invokes the callback until the timer is stopped", function(test) {
  var count = 0;
  var t = timer.timer(function() {
    if (++count > 2) {
      test.end();
      t.stop();
    }
  });
});

tape("timer(callback) passes the callback the elapsed and current time", function(test) {
  var start = Date.now(), count = 0;
  var t = timer.timer(function(elapsed, now) {
    test.equal(elapsed, now - start);
    test.inRange(now, Date.now() - 10, Date.now());
    if (++count > 10) {
      test.end();
      t.stop();
    }
  }, 0, start);
});

// TODO test that timer(callback, 0, time) during flush runs at the end of the tick
// TODO should check the number of frames requested here
tape("timer(callback) within a callback invokes the new callback within the same frame", function(test) {
  var start = Date.now();
  var t0 = timer.timer(function(elapsed, now) {
    var delay = Date.now() - start;
    var t1 = timer.timer(function(elapsed2, now2) {
      test.equal(elapsed2, 0);
      test.equal(now2, now);
      test.inRange(Date.now() - start, delay, delay + 3);
      test.end();
      t1.stop();
    }, 0, now);
    t0.stop();
  });
});

tape("timer(callback, delay) first invokes the callback after the specified delay", function(test) {
  var start = Date.now(), delay = 150;
  var t = timer.timer(function() {
    test.inRange(Date.now() - start, delay - 10, delay + 10);
    test.end();
    t.stop();
  }, delay);
});

tape("timer(callback, delay) computes the elapsed time relative to the delay", function(test) {
  var delay = 150;
  var t = timer.timer(function(elapsed) {
    test.inRange(elapsed, 0, 10);
    test.end();
    t.stop();
  }, delay);
});

tape("timer(callback, delay, time) computes the effective delay relative to the specified time", function(test) {
  var delay = 150, skew = 200;
  var t = timer.timer(function(elapsed) {
    test.inRange(elapsed, skew - delay + 17 - 10, skew - delay + 17 + 10);
    test.end();
    t.stop();
  }, delay, Date.now() - skew);
});

// Note: assumes that Node doesn’t support requestAnimationFrame, falling back to setTimeout.
tape("timer(callback, delay) within a timerFlush() does not request duplicate frames", function(test) {
  var setTimeout0 = setTimeout,
      frames = 0;
  setTimeout = function() { ++frames; return setTimeout0.apply(this, arguments); };

  var t0 = timer.timer(function(elapsed, time) {

    // 2. The first timer is invoked synchronously by timerFlush, so only the
    // first frame—when this timer was created—has been requested.
    test.equal(frames, 1);

    t0.stop();

    // 3. This timer was stopped during flush, so it doesn’t request a frame.
    test.equal(frames, 1);

    var t1 = timer.timer(function() {

      // 6. Still only one frame has been requested so far: the second timer has
      // a <17ms delay, and so was called back during the first frame requested
      // by the first timer on creation. If the second timer had a longer delay,
      // it might need another frame (or timeout) before invocation.
      test.equal(frames, 1);

      t1.stop();

      // 7. Stopping the second timer doesn’t immediately request a frame since
      // we’re now within an implicit flush (initiated by this timer).
      test.equal(frames, 1);

      setTimeout0(function() {
        setTimeout = setTimeout0;

        // 8. Since the timer queue was empty when we stopped the second timer,
        // no additional frame was requested after the timers were flushed.
        test.equal(frames, 1);
        test.end();
      }, 50);
    }, 1);

    // 4. Creating a second timer during flush also doesn’t immediately request
    // a frame; the request would happen AFTER all the timers are called back,
    // and we still have the request active from when the first timer was
    // created, since the first timer is invoked synchronously.
    test.equal(frames, 1);
  });

  // 1. Creating the first timer requests the first frame.
  test.equal(frames, 1);

  timer.timerFlush();

  // 5. Still only one frame active!
  test.equal(frames, 1);
});

// TODO test that timer.stop outside of flush requests a frame
// TODO test that timer.restart outside of flush requests a frame
// TODO test that multipler timer(…) schedulings only requests one frame
// TODO test that scheduling a short timer will cancel an existing long timeout
// TODO test that scheduling a long timer will use an existing short timeout

// Note: assumes that Node doesn’t support requestAnimationFrame, falling back to setTimeout.
tape("timer(callback) switches to setTimeout for long delays", function(test) {
  var setTimeout0 = setTimeout,
      frames = 0,
      timeouts = 0;
  setTimeout = function(callback, delay) { delay === 17 ? ++frames : ++timeouts; return setTimeout0.apply(this, arguments); }; // calls setTimeout

  var t0 = timer.timer(function() {

    // 2. The first timer had a delay >24ms, so after the first scheduling
    // frame, we used a longer timeout to wake up.
    test.equal(frames, 1);
    test.equal(timeouts, 1);

    t0.stop();

    // 3. Stopping a timer during flush doesn’t request a new frame.
    test.equal(frames, 1);
    test.equal(timeouts, 1);

    var t1 = timer.timer(function() {

      // 5. The second timer had a short delay, so it’s not immediately invoked
      // during the same tick as the first timer; it gets a new frame.
      test.equal(frames, 2);
      test.equal(timeouts, 1);

      t1.stop();

      // 6. Stopping a timer during flush doesn’t request a new frame.
      test.equal(frames, 2);
      test.equal(timeouts, 1);

      setTimeout0(function() {
        setTimeout = setTimeout0;

        // 7. Since the timer queue was empty when we stopped the second timer,
        // no additional frame was requested after the timers were flushed.
        test.equal(frames, 2);
        test.equal(timeouts, 1);
        test.end();
      }, 50);
    }, 1);

    // 4. Scheduling a new timer during flush doesn’t request a new frame;
    // that happens after all the timers have been invoked.
    test.equal(frames, 1);
    test.equal(timeouts, 1);
  }, 100);

  // 1. Creating the first timer requests the first frame. Even though the timer
  // has a long delay, we always use a frame to consolidate timer creation for
  // multiple timers. That way, if you schedule a bunch of timers with different
  // delays, we don’t thrash timeouts.
  test.equal(frames, 1);
  test.equal(timeouts, 0);
});

// tape("timer(callback) cancels an earlier setTimeout as appropriate", function(test) {
//   var setTimeout0 = setTimeout,
//       clearTimeout0 = clearTimeout,
//       setTimeouts = [],
//       clearTimeouts = [],
//       reenter = 0;
//   setTimeout = function() { var t = setTimeout0.apply(this, arguments); setTimeouts.push(t); return t; };
//   clearTimeout = function(t) { clearTimeouts.push(t); return clearTimeout0.apply(this, arguments); };
//   timer.timer(function() {
//     test.equal(clearTimeouts.length, 1);
//     test.equal(setTimeouts.length, 3);
//     setTimeout = setTimeout0;
//     clearTimeout = clearTimeout0;
//     test.end();
//     this.stop();
//   }, 150);
//   timer.timer(function() {
//     test.equal(clearTimeouts.length, 1);
//     test.equal(setTimeouts.length, 2);
//     test.equal(clearTimeouts[0], setTimeouts[0]);
//     this.stop();
//   }, 100);
// });

// tape("timer(callback) reuses an earlier setTimeout as appropriate", function(test) {
//   var setTimeout0 = setTimeout,
//       clearTimeout0 = clearTimeout,
//       setTimeouts = [],
//       clearTimeouts = [],
//       reenter = 0;
//   setTimeout = function() { var t = setTimeout0.apply(this, arguments); setTimeouts.push(t); return t; };
//   clearTimeout = function(t) { clearTimeouts.push(t); return clearTimeout0.apply(this, arguments); };
//   timer.timer(function() {
//     test.equal(clearTimeouts.length, 0);
//     test.equal(setTimeouts.length, 1);
//     this.stop();
//   }, 100);
//   timer.timer(function() {
//     test.equal(clearTimeouts.length, 0);
//     test.equal(setTimeouts.length, 2);
//     setTimeout = setTimeout0;
//     clearTimeout = clearTimeout0;
//     test.end();
//     this.stop();
//   }, 150);
// });

tape("timerFlush() immediately invokes any eligible timers", function(test) {
  var count = 0;
  var t = timer.timer(function() { ++count; t.stop(); });
  timer.timerFlush();
  timer.timerFlush();
  test.equal(count, 1);
  test.end();
});

tape("timerFlush() within timerFlush() still executes all eligible timers", function(test) {
  var count = 0;
  var t = timer.timer(function() { if (++count >= 3) t.stop(); timer.timerFlush(); });
  timer.timerFlush();
  test.equal(count, 3);
  test.end();
});

tape("timerFlush(time) observes the specified time", function(test) {
  var start = Date.now(), count = 0;
  var t = timer.timer(function() { if (++count >= 2) t.stop(); }, 0, start);
  timer.timerFlush(start - 1);
  test.equal(count, 0);
  timer.timerFlush(start);
  test.equal(count, 1);
  timer.timerFlush(start + 1);
  test.equal(count, 2);
  test.end();
});
