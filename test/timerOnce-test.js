var tape = require("tape"),
    timer = require("../"),
    end = require("./end");

require("./inRange");

tape("timerOnce(callback) invokes the callback once", function(test) {
  var count = 0;
  timer.timerOnce(function() {
    test.equal(++count, 1);
    end(test);
  });
});

tape("timerOnce(callback, delay) invokes the callback once after the specified delay", function(test) {
  var time = Date.now(), delay = 50;
  timer.timerOnce(function(elapsed, now) {
    test.inRange(now - time, delay - 10, delay + 10);
    end(test);
  }, delay);
});

tape("timerOnce(callback, delay, time) invokes the callback once after the specified delay relative to the given time", function(test) {
  var time = Date.now() + 50, delay = 50;
  timer.timerOnce(function(elapsed, now) {
    test.inRange(now - time, delay - 10, delay + 10);
    end(test);
  }, delay, time);
});

tape("timerOnce(callback) uses the global context for the callback", function(test) {
  timer.timerOnce(function() {
    test.equal(this, global);
    end(test);
  });
});

tape("timerOnce(callback) passes the callback the elapsed and current time", function(test) {
  var time = Date.now(), count = 0;
  timer.timerOnce(function(elapsed, now) {
    test.equal(elapsed, now - time);
    test.inRange(now, Date.now() - 10, Date.now());
    end(test);
  }, 0, time);
});

tape("timerOnce(callback) returns a timer", function(test) {
  var count = 0;
  var t = timer.timerOnce(function() { ++count; });
  test.equal(t instanceof timer.timer, true);
  t.stop();
  setTimeout(function() {
    test.equal(count, 0);
    end(test);
  }, 100);
});
