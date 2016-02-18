import {timer, now} from "./timer";

function Interval(callback, that, delay, time) {
  this._timer = timer(this.call, this, delay, time);
  this._call = callback;
  this._that = that;
  this._elapsed = 0;
  this._delay = delay;
}

Interval.prototype.call = function(elapsed) {
  this._timer.restart(this.call, this, this._delay, this._timer._time);
  this._call.call(this._that, (this._elapsed += this._delay) + elapsed);
};

export default function(callback, that, delay, time) {
  if (typeof that !== "object") time = delay, delay = that, that = null;
  if (delay == null) return timer(callback, that, delay, time);
  delay = +delay, time = time == null ? now() : +time;
  return new Interval(callback, that, delay, time)._timer;
}
