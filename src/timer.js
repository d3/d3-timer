var queueHead = {previous: null, next: null},
    queueTail = {previous: null, next: null},
    active, // the currently-executing timer
    frame, // is an animation frame pending?
    timeout; // is a timeout pending?

queueHead.next = queueTail;
queueTail.previous = queueHead;

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
  this.previous = queueTail.previous;
  this.next = queueTail;
  queueTail.previous.next = this;
  queueTail.previous = this;
}

Timer.prototype = {
  reset: function(callback, delay, time) {
    this.callback = callback;
    this.time = (time == null ? Date.now() : +time) + (delay == null ? 0 : +delay);
    sleep(); // Sleep for a tick, and then compute the desired wake time.
  },
  stop: function() {
    if (this === active) active = this.previous;
    this.previous.next = this.next, this.next.previous = this.previous;
    this.previous = this.next = this.callback = null;
  }
};

export function timer(callback, delay, time) {
  return new Timer(callback, delay, time);
};

export function timerFlush(time) {
  time = time == null ? Date.now() : +time;
  var active0 = active;
  active = queueHead;
  try {
    while ((active = active.next) !== queueTail) {
      if (time >= active.time) {
        active.callback(time - active.time, time);
      }
    }
  } finally {
    active = active0;
  }
};

function wake() {
  frame = timeout = 0;
  try {
    timerFlush();
  } finally {
    var timer = queueHead, time = Infinity;
    while ((timer = timer.next) !== queueTail) {
      if (time > timer.time) {
        time = timer.time;
      }
    }
    sleep(time);
  }
}

function sleep(time) {
  if (frame || active) return; // Soonest alarm already set, or will be.
  if (timeout) timeout = clearTimeout(timeout);
  var delay = time - Date.now();
  if (delay > 24) timeout = setTimeout(wake, delay);
  else frame = setFrame(wake);
}
