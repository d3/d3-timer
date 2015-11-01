var queueHead,
    queueTail,
    frame = 0, // is an animation frame pending?
    timeout = 0; // is a timeout pending?

var setFrame = typeof window !== "undefined"
    && (window.requestAnimationFrame
      || window.msRequestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.oRequestAnimationFrame)
      || function(callback) { return setTimeout(callback, 17); };

// TODO These fields should be really private, like, inaccessible?
function Timer(callback, delay, time) {
  this.reset(callback, delay, time);
  this.next = null;
  if (queueTail) queueTail.next = this;
  else queueHead = this;
  queueTail = this;
}

Timer.prototype = {
  reset: function(callback, delay, time) {
    this.callback = callback;
    this.time = (time == null ? Date.now() : +time) + (delay == null ? 0 : +delay);
    sleep();
  },
  stop: function() {
    this.callback = null;
    this.time = Infinity;
    sleep();
  }
};

export function timer(callback, delay, time) {
  return new Timer(callback, delay, time);
};

export function timerFlush(time) {
  time = time == null ? Date.now() : +time;
  ++frame;
  try {
    var t = queueHead;
    while (t) {
      if (time >= t.time) t.callback(time - t.time, time);
      t = t.next;
    }
  } finally {
    --frame;
  }
};

function wake() {
  frame = timeout = 0;
  try {
    timerFlush();
  } finally {
    var t0, t1 = queueHead, time = Infinity;
    while (t1) {
      if (t1.callback) {
        if (time > t1.time) time = t1.time;
        t1 = (t0 = t1).next;
      } else {
        t1 = t0 ? t0.next = t1.next : queueHead = t1.next;
      }
    }
    queueTail = t0;
    sleep(time);
  }
}

function sleep(time) {
  if (frame) return; // Soonest alarm already set, or will be.
  if (timeout) timeout = clearTimeout(timeout);
  var delay = time - Date.now();
  if (delay > 24) { if (time < Infinity) timeout = setTimeout(wake, delay); }
  else frame = setFrame(wake);
}
