# d3-timer

An efficient queue capable of managing thousands of concurrent animations. Also guarantees consistent, synchronized timing with concurrent or staged animations. Uses [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) for fluid animation, switching to [setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setTimeout) for delays longer than 24ms.

## Installing

If you use NPM, `npm install d3-timer`. Otherwise, download the [latest release](https://github.com/d3/d3-timer/releases/latest).

## API Reference

<a name="timer" href="#timer">#</a> <b>timer</b>(<i>callback</i>[, <i>delay</i>[, <i>time</i>]])

Schedules a new timer, invoking the specified *callback* repeatedly until the timer is [stopped](#timer_stop). An optional numeric *delay* in milliseconds may be specified to invoke the given *callback* after a delay; if *delay* is not specified, it defaults to zero. The delay is relative to the specified *time* in milliseconds since UNIX epoch; if *time* is not specified, it defaults to [Date.now](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/now).

The *callback* is passed two arguments when it is invoked: the elapsed time since the timer became active, and the current time. The latter is useful for precise scheduling of secondary timers. For example:

```js
var t = timer(function(elapsed, time) {
  console.log(elapsed, time);
  if (elapsed > 200) t.stop();
}, 150);
```

This produced the following console output:

```
6 1433806724202
26 1433806724222
51 1433806724247
73 1433806724269
92 1433806724288
114 1433806724310
132 1433806724328
152 1433806724348
171 1433806724367
191 1433806724387
213 1433806724409
```

Note that the first *elapsed* is 6ms, since this is the elapsed time since the timer started (after the 150ms delay), not the elapsed time since the timer was scheduled.

Use *delay* and *time* to specify relative and absolute moments in time when the *callback* should start being invoked. For example, a calendar notification might be coded as:

```js
timer(callback, -4 * 1000 * 60 * 60, new Date(2012, 09, 29)); // four hours before midnight October 29 (months are zero-based)
```

If [timer](#timer) is called within the callback of another timer, the new timer callback (if eligible as determined by the specified *delay* and *time*) will be invoked immediately at the end of the current frame, rather than waiting until the next frame. Within a frame, timer callbacks are guaranteed to be invoked in the order they were scheduled (regardless of their start time).

<a name="timer_restart" href="#timer_restart">#</a> <i>timer</i>.<b>restart</b>(<i>callback</i>[, <i>delay</i>[, <i>time</i>]])

Restart a timer with the specified *callback* and optional *delay* and *time*. This is equivalent to stopping this timer and creating a new timer with the specified arguments, although this timer retains the original [id](#timer_id) and invocation priority.

<a name="timer_stop" href="#timer_stop">#</a> <i>timer</i>.<b>stop</b>()

Stops this timer, preventing subsequent callbacks. This method has no effect if the timer has already stopped.

<a name="timer_id" href="#timer_id">#</a> <i>timer</i>.<b>id</b>

An opaque, unique identifier for this timer.

<a name="timerFlush" href="#timerFlush">#</a> <b>timerFlush</b>([<i>time</i>])

Immediately execute (invoke once) any eligible timer callbacks. If *time* is specified, it represents the current time; if not specified, it defaults to Date.now. Specifying an explicit time helps ensure deterministic behavior.

Note that zero-delay timers are normally first executed after one frame (~17ms). This can cause a brief flicker because the browser renders the page twice: once at the end of the first event loop, then again immediately on the first timer callback. By flushing the timer queue at the end of the first event loop, you can run any zero-delay timers immediately and avoid the flicker.

## Changes from D3 3.x:

* Returning a truthy value from the timer callback no longer has any effect; use [*timer*.stop](#timer_stop) instead. You can now stop a timer outside its callback.

* The timerReplace method has been replaced by [*timer*.restart](#timer_restart). You can now restart (replace) a timer outside its callback.

* Timer callbacks are now passed the current time as a second argument, in addition to the elapsed time; this is useful for precise scheduling of secondary timers.

* The timer.flush method has been renamed [timerFlush](#timerFlush). This method now accepts an optional *time* argument representing the current time, and returns the time of the earliest next timer. Calling this method within a timer callback no longer causes a crash.
