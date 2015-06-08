# d3-timer

Changes from D3 3.x:

* A new [timerReplace](#timerReplace) method has been added to replace the current timer within a timer callback.

* The timer.flush method has been renamed [timerFlush](#timerFlush).

* Calling [timerFlush](#timerFlush) within a timer callback no longer causes a crash.

* Calling [timer](#timer) within a timer callback no schedules a duplicate requestAnimationFrame.

* Timer callbacks are now passed the current time as a second argument, in addition to the elapsed time; this is useful for precise scheduling of secondary timers.
