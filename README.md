# d3-timer

An efficient queue capable of managing thousands of concurrent animations. Also guarantees consistent, synchronized timing with concurrent or staged animations. Uses [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) for fluid animation, switching to [setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setTimeout) for delays longer than 24ms.

Changes from D3 3.x:

* A new [timerReplace](#timerReplace) method has been added to replace the current timer within a timer callback.

* The timer.flush method has been renamed [timerFlush](#timerFlush).

* Calling [timerFlush](#timerFlush) within a timer callback no longer causes a crash.

* Calling [timer](#timer) within a timer callback no longer makes a duplicate requestAnimationFrame.

* Timer callbacks are now passed the current time as a second argument, in addition to the elapsed time; this is useful for precise scheduling of secondary timers.

<a name="timer" href="#timer">#</a> <b>timer</b>(<i>callback</i>[, <i>delay</i>[, <i>time</i>]])

Schedules a new timer, invoking the specified *callback* repeatedly until it returns true. To cancel the timer after it starts, the *callback* must return a truthy value.

An optional numeric *delay* in milliseconds may be specified to invoke the given *callback* after a delay. The delay is relative to the specified *time* in milliseconds since UNIX epoch; if *time* is not specified, it defaults to [Date.now](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/now).

Use *delay* and *time* to specify relative and absolute moments in time when the *callback* should start being invoked. For example, a calendar notification might be coded as:

```js
timer(callback, -4 * 1000 * 60 * 60, +new Date(2012, 09, 29)); // four hours before midnight October 29 (months are zero-based)
```

Note that if [timer](#timer) is called within the callback of another timer, the new timer callback  (if eligible as determined by the specified *delay* and *time*) will be invoked immediately at the end of the current frame, rather than waiting until the next frame.

<a name="timerFlush" href="#timerFlush">#</a> <b>timerFlush</b>()

Immediately execute (invoke once) any eligible timer callbacks. Normally, zero-delay transitions are executed after an instantaneous delay (~17ms). This can cause a brief flicker if the browser renders the page twice: once at the end of the first event loop, then again immediately on the first timer callback. By flushing the timer queue at the end of the first event loop, you can run any zero-delay transitions immediately and avoid the flicker.

<a name="timerReplace" href="#timerReplace">#</a> <b>timerReplace</b>(<i>callback</i>[, <i>delay</i>[, <i>time</i>]])

Replace the current timer’s *callback*, *delay* and *time*. This method can only be called within a timer callback, and is equivalent to [timer](#timer), except that it replaces the current timer rather than scheduling a new timer.
