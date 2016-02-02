var tape = require("tape"),
    timer = require("../"),
    end = require("./end");

tape("timerFlush() immediately invokes any eligible timers", function(test) {
  var count = 0;
  var t = timer.timer(function() { ++count; t.stop(); });
  timer.timerFlush();
  timer.timerFlush();
  test.equal(count, 1);
  end(test);
});

tape("timerFlush() within timerFlush() still executes all eligible timers", function(test) {
  var count = 0;
  var t = timer.timer(function() { if (++count >= 3) t.stop(); timer.timerFlush(); });
  timer.timerFlush();
  test.equal(count, 3);
  end(test);
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
  end(test);
});
