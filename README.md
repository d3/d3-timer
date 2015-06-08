# d3-timer

An efficient queue capable of managing thousands of concurrent animations. Also guarantees consistent, synchronized timing with concurrent or staged animations. Uses [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) for fluid animation, switching to [setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setTimeout) for delays longer than 24ms.

Changes from D3 3.x:

* Timer callbacks are now passed the current time as a second argument, in addition to the elapsed time; this is useful for precise scheduling of secondary timers.

* A new [timerReplace](#timerReplace) method has been added to replace the current timer within a timer callback.

* The timer.flush method has been renamed [timerFlush](#timerFlush). This method now accepts an optional *time* argument representing the current time, and returns the time of the earliest next timer. Calling this method within a timer callback no longer causes a crash.

* Calling [timer](#timer) within a timer callback no longer makes a duplicate requestAnimationFrame. Calling this method with a delay greater than 24ms when no earlier timers are active guarantees a setTimeout rather than a requestAnimationFrame.

<a name="timer" href="#timer">#</a> <b>timer</b>(<i>callback</i>[, <i>delay</i>[, <i>time</i>]])

Schedules a new timer, invoking the specified *callback* repeatedly until it returns true. (There is no API for canceling a timer; the *callback* must return a truthy value to terminate.) An optional numeric *delay* in milliseconds may be specified to invoke the given *callback* after a delay. The delay is relative to the specified *time* in milliseconds since UNIX epoch; if *time* is not specified, it defaults to [Date.now](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/now).

The *callback* is passed two arguments each time it is invoked: the elapsed time since the timer became active, and the current time. The latter is useful for precise scheduling of secondary timers. For example:

```js
timer(function(elapsed, time) {
  console.log(elapsed, time);
  return elapsed > 200;
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

Note that the first *elapsed* is 6ms, since this is the elapsed time since the timer became active, not the elapsed time since the timer was scheduled.

Use *delay* and *time* to specify relative and absolute moments in time when the *callback* should start being invoked. For example, a calendar notification might be coded as:

```js
timer(callback, -4 * 1000 * 60 * 60, new Date(2012, 09, 29)); // four hours before midnight October 29 (months are zero-based)
```

If [timer](#timer) is called within the callback of another timer, the new timer callback (if eligible as determined by the specified *delay* and *time*) will be invoked immediately at the end of the current frame, rather than waiting until the next frame.

<a name="timerFlush" href="#timerFlush">#</a> <b>timerFlush</b>([<i>time</i>])

Immediately execute (invoke once) any eligible timer callbacks. If *time* is specified, it represents the current time; if not specified, it defaults to Date.now. Specifying the time explicitly can ensure deterministic behavior.

Note that zero-delay timers are normally first executed after one frame (~17ms). This can cause a brief flicker because the browser renders the page twice: once at the end of the first event loop, then again immediately on the first timer callback. By flushing the timer queue at the end of the first event loop, you can run any zero-delay timers immediately and avoid the flicker.

<a name="timerReplace" href="#timerReplace">#</a> <b>timerReplace</b>(<i>callback</i>[, <i>delay</i>[, <i>time</i>]])

Replace the current timer’s *callback*, *delay* and *time*. This method can only be called within a timer callback, and is equivalent to [timer](#timer), except that it replaces the current timer rather than scheduling a new timer.
